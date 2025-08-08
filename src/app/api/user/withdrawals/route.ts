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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const db = getDatabase();

    const query = `
      SELECT id, amount, currency, address, fee, status, external_id, 
             rejection_reason, created_at, updated_at
      FROM withdrawals
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [withdrawals] = await db.execute(query, [tokenData.data!.userId, limit, offset]);

    // Get total count
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM withdrawals WHERE user_id = ?',
      [tokenData.data!.userId]
    );
    const total = Array.isArray(countResult) ? (countResult[0] as any).total : 0;

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Withdrawals retrieved successfully',
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
    console.error('Get user withdrawals error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
