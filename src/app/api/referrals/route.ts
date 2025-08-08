import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getDatabase } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

interface JwtPayload {
  userId: number;
  username: string;
  email: string;
}

export async function GET(request: NextRequest) {
  try {
    // Try to get token from Authorization header first, then from cookies
    let token: string | null = null;
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const cookieStore = await cookies();
      const cookieToken = cookieStore.get('token');
      token = cookieToken?.value || null;
    }

    // If no valid token, return default guest data
    if (!token) {
      return NextResponse.json({
        success: true,
        count: 0,
        earnings: 0,
        data: {
          total_referrals: 0,
          total_earnings: 0,
          recent_referrals: []
        }
      });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (error) {
      return NextResponse.json({
        success: true,
        count: 0,
        earnings: 0,
        data: {
          total_referrals: 0,
          total_earnings: 0,
          recent_referrals: []
        }
      });
    }

    const db = getDatabase();
    
    // Get user's referral code
    const [userRows] = await db.execute<RowDataPacket[]>(
      'SELECT referral_code FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!userRows[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const referralCode = userRows[0].referral_code;

    // Get referral count (users who used this referral code)
    const [countRows] = await db.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users WHERE referred_by = ?',
      [referralCode]
    );

    const referralCount = countRows[0]?.count || 0;

    // Get total referral earnings from transactions
    const [earningsRows] = await db.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(t.amount), 0) as total_earnings 
       FROM transactions t 
       WHERE t.user_id = ? 
         AND t.type = 'referral_commission' 
         AND t.status = 'completed'`,
      [decoded.userId]
    );

    const totalEarnings = parseFloat(earningsRows[0]?.total_earnings || '0');

    // Get recent referrals with their transaction info
    const [recentReferralsRows] = await db.execute<RowDataPacket[]>(
      `SELECT 
         u.id, 
         u.username, 
         u.email, 
         u.created_at,
         COALESCE(SUM(t.amount), 0) as total_deposits
       FROM users u
       LEFT JOIN transactions t ON u.id = t.user_id AND t.type = 'deposit' AND t.status = 'completed'
       WHERE u.referred_by = ?
       GROUP BY u.id, u.username, u.email, u.created_at
       ORDER BY u.created_at DESC 
       LIMIT 10`,
      [referralCode]
    );

    // Get referral commission transactions (earnings history)
    const [commissionHistory] = await db.execute<RowDataPacket[]>(
      `SELECT 
         t.amount,
         t.created_at,
         t.external_id,
         t.gateway_data
       FROM transactions t
       WHERE t.user_id = ? 
         AND t.type = 'referral_commission' 
         AND t.status = 'completed'
       ORDER BY t.created_at DESC 
       LIMIT 20`,
      [decoded.userId]
    );

    return NextResponse.json({
      success: true,
      count: referralCount,
      earnings: totalEarnings,
      data: {
        total_referrals: referralCount,
        total_earnings: totalEarnings,
        recent_referrals: recentReferralsRows,
        commission_history: commissionHistory
      },
      message: 'Referral data retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching referral data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error fetching referral data',
        count: 0,
        earnings: 0
      },
      { status: 500 }
    );
  }
}
