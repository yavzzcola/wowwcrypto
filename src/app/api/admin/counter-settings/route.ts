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

    // Get current counter settings
    const [results] = await db.execute(`
      SELECT * FROM counter_settings 
      WHERE is_active = 1 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    const settings = Array.isArray(results) && results.length > 0 ? results[0] : null;

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Counter settings retrieved successfully',
      settings: settings
    });

  } catch (error) {
    console.error('Get counter settings error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}