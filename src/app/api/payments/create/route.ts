import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments';
import jwt from 'jsonwebtoken';
import { getDatabase } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

interface JwtPayload {
  userId: number;
  username: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency1, currency2, buyerEmail, buyerName, itemName } = body;

    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!currency1 || !currency2) {
      return NextResponse.json({ error: 'Currency1 and currency2 are required' }, { status: 400 });
    }

    // Initialize database connection
    const db = getDatabase();
    
    // Check if currency2 is allowed in database
    const [allowedRows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM allowed_cryptocurrencies WHERE symbol = ? AND is_active = 1',
      [currency2]
    );

    if (!allowedRows || allowedRows.length === 0) {
      return NextResponse.json({ error: 'Cryptocurrency not supported' }, { status: 400 });
    }

    // Check minimum deposit
    const [minDepositRows] = await db.execute<RowDataPacket[]>(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['min_deposit']
    );
    
    const minDeposit = parseFloat(minDepositRows[0]?.setting_value || '10.0');
    if (amount < minDeposit) {
      return NextResponse.json({ 
        error: `Minimum deposit amount is $${minDeposit}` 
      }, { status: 400 });
    }

    // Get user info
    const [userRows] = await db.execute<RowDataPacket[]>(
      'SELECT id, email, username FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!userRows[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userRows[0];
    
    // Get rates for USD conversion (for ABC coin calculation)
    const ratesResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payments/rates`);
    const rates = await ratesResponse.json();
    
    // Calculate USD value from crypto amount for ABC calculation
    const usdValue = amount * (rates[currency1] || 1);
    
    // Create payment with crypto amount
    const payment = await paymentService.createPayment({
      userId: user.id,
      amount: amount,  // crypto amount (1 BTC, 10 USDT, etc.)
      currency1: currency1,
      currency2: currency2,
      buyerEmail: buyerEmail || user.email,
      buyerName: buyerName || user.username,
      itemName: itemName || 'ABC Coin Purchase',
      itemNumber: `ORDER_${Date.now()}_${user.id}`
    });

    // Calculate ABC coin amount using USD value
    const abcCoinAmount = await paymentService.calculateCoinAmount(usdValue);

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.paymentId,
        txn_id: payment.txn_id,
        address: payment.address,
        amount: payment.amount,
        checkout_url: payment.checkout_url,
        status_url: payment.status_url,
        qrcode_url: payment.qrcode_url,
        confirms_needed: payment.confirms_needed,
        timeout: payment.timeout,
        abc_coin_amount: abcCoinAmount,
        referral_commission: payment.referralCommission
      }
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}