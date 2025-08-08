import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/types';

// Create sayac database connection
const getSayacDatabase = () => {
  return mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'sayac',
    charset: 'utf8mb4'
  });
};

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

    const db = await getSayacDatabase();

    // Get counter admin stats
    const [counters] = await db.execute('SELECT * FROM counter_admin_stats ORDER BY is_active DESC, counter_name ASC');

    await db.end();

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Counter data retrieved successfully',
      data: {
        counters: Array.isArray(counters) ? counters : []
      }
    });

  } catch (error) {
    console.error('Admin counter API error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { counter_name, target_date, title, description, is_active } = body;

    if (!counter_name || !target_date || !title) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Counter name, target date, and title are required'
      }, { status: 400 });
    }

    const db = await getSayacDatabase();

    // Update or insert counter
    await db.execute(`
      INSERT INTO counter_settings (counter_name, target_date, title, description, is_active)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        target_date = VALUES(target_date),
        title = VALUES(title),
        description = VALUES(description),
        is_active = VALUES(is_active),
        updated_at = CURRENT_TIMESTAMP
    `, [counter_name, target_date, title, description || '', is_active ? 1 : 0]);

    await db.end();

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Counter updated successfully'
    });

  } catch (error) {
    console.error('Admin counter update error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}