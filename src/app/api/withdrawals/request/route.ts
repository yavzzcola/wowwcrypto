import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { ApiResponse, WithdrawalRequest } from '@/types';
import { isPositiveNumber, isValidCryptoAddress } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const tokenData = await verifyToken(request);
    if (!tokenData.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: tokenData.message
      }, { status: 401 });
    }

    const { amount, crypto_address }: WithdrawalRequest = await request.json();

    // Validation
    if (!amount || !isPositiveNumber(amount)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Valid amount is required'
      }, { status: 400 });
    }

    if (!crypto_address || !isValidCryptoAddress(crypto_address)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Valid crypto address is required'
      }, { status: 400 });
    }

    const db = getDatabase();

    // Check user balance
    const [users] = await db.execute(
      'SELECT balance FROM users WHERE id = ?',
      [tokenData.data!.userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    const user = users[0] as any;
    
    if (user.balance < amount) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Insufficient balance'
      }, { status: 400 });
    }

    // Get withdrawal fee percentage
    const [settings] = await db.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = "withdraw_fee_percentage"'
    );
    
    const feePercentage = Array.isArray(settings) && settings.length > 0 
      ? parseFloat((settings[0] as any).setting_value) 
      : 2;
    
    const transactionFee = (amount * feePercentage) / 100;
    const totalAmount = amount + transactionFee;

    if (user.balance < totalAmount) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: `Insufficient balance. Required: ${totalAmount} (including ${feePercentage}% fee)`
      }, { status: 400 });
    }

    // Begin transaction
    await db.execute('START TRANSACTION');

    try {
      // Create withdrawal request (pending status)
      const [result] = await db.execute(
        'INSERT INTO withdrawals (user_id, amount, address, fee, status) VALUES (?, ?, ?, ?, ?)',
        [tokenData.data!.userId, amount, crypto_address, transactionFee, 'pending']
      );

      // Update user balance (deduct total amount including fee)
      await db.execute(
        'UPDATE users SET balance = balance - ? WHERE id = ?',
        [totalAmount, tokenData.data!.userId]
      );

      // Create transaction record
      await db.execute(
        'INSERT INTO transactions (user_id, type, amount, currency, status, external_id) VALUES (?, ?, ?, ?, ?, ?)',
        [tokenData.data!.userId, 'withdrawal', -totalAmount, 'USD', 'completed', `WD_${(result as any).insertId}`]
      );

      // Commit transaction
      await db.execute('COMMIT');

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Withdrawal request submitted successfully',
        data: {
          withdrawal_id: (result as any).insertId,
          amount,
          address: crypto_address,
          fee: transactionFee,
          status: 'pending',
          total_deducted: totalAmount
        }
      });

    } catch (error) {
      // Rollback on error
      await db.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Withdrawal request error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const tokenData = await verifyToken(request);
    if (!tokenData.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: tokenData.message
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const db = getDatabase();

    // Get user's withdrawal requests
    const [withdrawals] = await db.execute(
      'SELECT id, amount, address, status, fee, created_at, updated_at FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [tokenData.data!.userId, limit, offset]
    );

    // Get total count
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM withdrawals WHERE user_id = ?',
      [tokenData.data!.userId]
    );

    const total = Array.isArray(countResult) ? (countResult[0] as any).total : 0;

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Withdrawal requests retrieved successfully',
      data: {
        withdrawals,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
