import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const tokenData = await verifyToken(request);
    if (!tokenData.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: tokenData.message
      }, { status: 401 });
    }

    if (tokenData.data?.role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Admin access required'
      }, { status: 403 });
    }

    const db = getDatabase();

    // Get total users
    const [userCountResult] = await db.execute('SELECT COUNT(*) as count FROM users');
    const totalUsers = Array.isArray(userCountResult) ? (userCountResult[0] as any).count : 0;

    // Get total deposits
    const [depositResult] = await db.execute(
      "SELECT SUM(amount) as total FROM transactions WHERE type = 'deposit' AND status = 'completed'"
    );
    const totalDeposits = Array.isArray(depositResult) ? (depositResult[0] as any).total || 0 : 0;

    // Get total withdrawals
    const [withdrawalResult] = await db.execute(
      "SELECT SUM(amount) as total FROM withdrawals WHERE status = 'completed'"
    );
    const totalWithdrawals = Array.isArray(withdrawalResult) ? (withdrawalResult[0] as any).total || 0 : 0;

    // Get pending withdrawals count
    const [pendingResult] = await db.execute(
      "SELECT COUNT(*) as count FROM withdrawals WHERE status = 'pending'"
    );
    const pendingWithdrawals = Array.isArray(pendingResult) ? (pendingResult[0] as any).count : 0;

    // Get supply data
    const [supplyResult] = await db.execute(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'current_supply'"
    );
    const currentSupply = Array.isArray(supplyResult) && supplyResult.length > 0 
      ? parseFloat((supplyResult[0] as any).setting_value) 
      : 0;

    const [maxSupplyResult] = await db.execute(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'max_supply'"
    );
    const maxSupply = Array.isArray(maxSupplyResult) && maxSupplyResult.length > 0 
      ? parseFloat((maxSupplyResult[0] as any).setting_value) 
      : 1000000;

    // Get total referrals count
    const [referralResult] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE referred_by IS NOT NULL'
    );
    const totalReferrals = Array.isArray(referralResult) ? (referralResult[0] as any).count : 0;

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'System stats retrieved successfully',
      data: {
        totalUsers: totalUsers,
        totalDeposits: totalDeposits,
        totalWithdrawals: totalWithdrawals,
        pendingWithdrawals: pendingWithdrawals,
        totalReferrals: totalReferrals
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
