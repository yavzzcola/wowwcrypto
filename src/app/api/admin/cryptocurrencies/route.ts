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

    // Get all cryptocurrencies
    const [cryptos] = await db.execute(`
      SELECT id, symbol, name, is_active, min_amount, max_amount, sort_order, logo_url, created_at
      FROM allowed_cryptocurrencies 
      ORDER BY sort_order ASC, symbol ASC
    `);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Cryptocurrencies retrieved successfully',
      data: {
        cryptocurrencies: Array.isArray(cryptos) ? cryptos : []
      }
    });

  } catch (error) {
    console.error('Get admin cryptocurrencies error:', error);
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
    const { symbol, name, is_active = 1, min_amount = 0.00000001, max_amount = 9999999.99999999, sort_order = 0, logo_url = '' } = body;

    if (!symbol || !name) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Symbol and name are required'
      }, { status: 400 });
    }

    const db = getDatabase();

    // Insert new cryptocurrency
    await db.execute(`
      INSERT INTO allowed_cryptocurrencies (symbol, name, is_active, min_amount, max_amount, sort_order, logo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [symbol.toUpperCase(), name, is_active ? 1 : 0, min_amount, max_amount, sort_order, logo_url]);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Cryptocurrency added successfully'
    });

  } catch (error) {
    console.error('Add cryptocurrency error:', error);
    if ((error as any).code === 'ER_DUP_ENTRY') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Cryptocurrency symbol already exists'
      }, { status: 400 });
    }
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}