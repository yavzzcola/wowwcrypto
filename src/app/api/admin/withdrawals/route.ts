import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { coinpayments } from '@/lib/coinpayments';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const db = getDatabase();

    // Get withdrawal requests
    let query = `
      SELECT w.id, w.user_id, w.amount, w.currency, w.address, w.fee, w.status, w.created_at, w.updated_at,
             u.username, u.email
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
    `;
    const params: any[] = [];

    if (status !== 'all') {
      query += ' WHERE w.status = ?';
      params.push(status);
    }

    query += ' ORDER BY w.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [withdrawals] = await db.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM withdrawals';
    const countParams: any[] = [];

    if (status !== 'all') {
      countQuery += ' WHERE status = ?';
      countParams.push(status);
    }

    const [countResult] = await db.execute(countQuery, countParams);
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
    console.error('Admin withdrawals error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    }, { status: error instanceof Error && error.message.includes('Admin') ? 403 : 500 });
  }
}
