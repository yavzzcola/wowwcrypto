import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';

interface JwtPayload {
  userId: number;
  username: string;
  email: string;
}

export async function GET(request: NextRequest) {
  try {
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

    const db = getDatabase();
    
    // Get user's payments
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT 
        id, txn_id, address, checkout_url, status_url, qrcode_url,
        amount, currency1, currency2, confirms_needed, timeout,
        buyer_email, buyer_name, item_name, item_number, custom,
        status, received_amount, referral_commission, referral_paid,
        created_at, updated_at
      FROM payments 
      WHERE user_id = ? 
      ORDER BY created_at DESC`,
      [decoded.userId]
    );

    return NextResponse.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Error fetching user payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}