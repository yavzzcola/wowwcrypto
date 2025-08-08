import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { sanitizeInput } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const withdrawalId = parseInt(resolvedParams.id);
    if (isNaN(withdrawalId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid withdrawal ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length < 3) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Rejection reason is required (minimum 3 characters)'
      }, { status: 400 });
    }

    const db = getDatabase();

    // Get withdrawal details
    const [withdrawals] = await db.execute(
      'SELECT * FROM withdrawals WHERE id = ? AND status = ?',
      [withdrawalId, 'pending']
    );

    const withdrawalArray = withdrawals as any[];
    if (withdrawalArray.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Withdrawal request not found or already processed'
      }, { status: 404 });
    }

    const withdrawal = withdrawalArray[0];

    // Start transaction
    await db.execute('START TRANSACTION');

    try {
      // Reject withdrawal and add rejection reason
      await db.execute(
        'UPDATE withdrawals SET status = ?, rejection_reason = ?, updated_at = NOW() WHERE id = ?',
        ['rejected', sanitizeInput(reason), withdrawalId]
      );

      // Return the amount to user balance (add back the amount + fee that was deducted)
      const refundAmount = parseFloat(withdrawal.amount) + parseFloat(withdrawal.fee);
      await db.execute(
        'UPDATE users SET balance = balance + ? WHERE id = ?',
        [refundAmount.toFixed(2), withdrawal.user_id]
      );

      await db.execute('COMMIT');

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Withdrawal rejected and funds returned to user'
      });

    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Reject withdrawal error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
