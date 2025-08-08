import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { coinpayments } from '@/lib/coinpayments';
import { ApiResponse } from '@/types';
import { isPositiveNumber } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const tokenData = await verifyToken(request);
    if (!tokenData.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: tokenData.message
      }, { status: 401 });
    }

    const { amount, currency } = await request.json();

    // Validation
    if (!amount || !isPositiveNumber(amount)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Valid amount is required'
      }, { status: 400 });
    }

    if (!currency) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Currency is required'
      }, { status: 400 });
    }

    const db = getDatabase();
    
    // Check current supply and max supply
    const [settings] = await db.execute(
      'SELECT `key`, value FROM system_settings WHERE `key` IN ("current_supply", "max_supply")'
    );
    
    const settingsMap = new Map();
    (settings as any[]).forEach(setting => {
      settingsMap.set(setting.key, parseFloat(setting.value));
    });
    
    const currentSupply = settingsMap.get('current_supply') || 0;
    const maxSupply = settingsMap.get('max_supply') || 1000000;
    
    if (currentSupply + amount > maxSupply) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Amount exceeds available supply'
      }, { status: 400 });
    }

    // Create CoinPayments transaction
    try {
      const transaction = await coinpayments.createTransaction({
        amount: amount,
        currency1: 'USD',
        currency2: currency.toLowerCase(),
        buyerEmail: tokenData.data!.email,
        itemName: 'Platform Token Purchase',
        itemNumber: `DEP_${Date.now()}`,
        custom: tokenData.data!.userId.toString(),
      });

      // Save transaction to database
      await db.execute(
        'INSERT INTO transactions (user_id, type, amount, currency, status, external_id) VALUES (?, ?, ?, ?, ?, ?)',
        [tokenData.data!.userId, 'deposit', amount, currency, 'pending', transaction.txn_id]
      );

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Deposit transaction created successfully',
        data: {
          transaction_id: transaction.txn_id,
          address: transaction.address,
          amount: transaction.amount,
          currency: currency,
          checkout_url: transaction.checkout_url,
          qrcode_url: transaction.qrcode_url,
          timeout: transaction.timeout
        }
      });

    } catch (coinPaymentsError) {
      console.error('CoinPayments error:', coinPaymentsError);
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Failed to create payment transaction'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
