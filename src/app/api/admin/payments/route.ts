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

    // Get only deposit and referral_commission transactions (no withdrawals)
    const [transactions] = await db.execute(`
      SELECT 
        t.id,
        t.user_id,
        u.username,
        t.type,
        t.amount,
        t.currency,
        t.status,
        t.external_id as txid,
        t.created_at,
        u.referral_code,
        u.referred_by,
        ref_user.username as referred_by_username
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users ref_user ON u.referred_by = ref_user.referral_code
      WHERE t.type IN ('deposit', 'referral_commission')
      ORDER BY t.created_at DESC
      LIMIT 1000
    `);

    // Get all payments from payments table (CoinPayments transactions) with full details
    const [payments] = await db.execute(`
      SELECT 
        p.id,
        p.user_id,
        u.username,
        'payment' as type,
        p.amount,
        p.currency1 as currency,
        p.currency2,
        p.status,
        p.txn_id as txid,
        p.address,
        p.checkout_url,
        p.status_url,
        p.qrcode_url,
        p.buyer_email,
        p.buyer_name,
        p.created_at,
        u.referral_code,
        u.referred_by,
        ref_user.username as referred_by_username
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN users ref_user ON u.referred_by = ref_user.referral_code
      ORDER BY p.created_at DESC
      LIMIT 1000
    `);

    // Combine and sort payment data (no withdrawals)
    const allPayments = [
      ...Array.isArray(transactions) ? transactions : [],
      ...Array.isArray(payments) ? payments : []
    ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Payment data retrieved successfully',
      data: {
        payments: allPayments
      }
    });

  } catch (error) {
    console.error('Get admin payments error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}