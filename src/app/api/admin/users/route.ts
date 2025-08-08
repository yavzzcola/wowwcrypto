import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const tokenData = await verifyToken(request);
    if (!tokenData.success) {
      return NextResponse.json({
        success: false,
        message: tokenData.message
      }, { status: 401 });
    }

    // Check if user is admin
    if (tokenData.data?.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const db = getDatabase();

    // Get all users with referral info
    const [users] = await db.execute<RowDataPacket[]>(
      `SELECT 
        u.id, u.username, u.email, u.balance, u.referral_code, u.referred_by, u.role, u.created_at,
        COUNT(ref.id) as referral_count,
        COALESCE(SUM(t.amount), 0) as total_deposits
      FROM users u
      LEFT JOIN users ref ON ref.referred_by = u.referral_code
      LEFT JOIN transactions t ON u.id = t.user_id AND t.type = 'deposit' AND t.status = 'completed'
      GROUP BY u.id
      ORDER BY u.created_at DESC 
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Get total count
    const [countResult] = await db.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM users'
    );

    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Admin get users error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}