import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { coinpayments } from '@/lib/coinpayments';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tokenData = await verifyToken(request);
    if (!tokenData.success) {
      return NextResponse.json({
        success: false,
        message: tokenData.message
      }, { status: 401 });
    }

    if (tokenData.data?.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 });
    }

    const resolvedParams = await params;
    const withdrawalId = parseInt(resolvedParams.id);

    if (isNaN(withdrawalId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid withdrawal ID'
      }, { status: 400 });
    }

    const db = getDatabase();

    // Get withdrawal details
    const [withdrawals] = await db.execute(
      'SELECT w.*, u.balance FROM withdrawals w JOIN users u ON w.user_id = u.id WHERE w.id = ? AND w.status = "pending"',
      [withdrawalId]
    );

    if (!Array.isArray(withdrawals) || withdrawals.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Withdrawal request not found or already processed'
      }, { status: 404 });
    }

    const withdrawal = withdrawals[0] as any;
    const totalAmount = withdrawal.amount + withdrawal.fee;

    // Update withdrawal status to approved
    await db.execute(
      'UPDATE withdrawals SET status = "approved", approved_by = ?, approved_at = NOW() WHERE id = ?',
      [tokenData.data!.userId, withdrawalId]
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Withdrawal approved successfully'
    });

  } catch (error) {
    console.error('Withdrawal approval error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    }, { status: error instanceof Error && error.message.includes('Admin') ? 403 : 500 });
  }
}
