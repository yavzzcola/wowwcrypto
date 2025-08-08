import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/database';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Simple security check - you might want to add more robust auth
    const body = await request.json();
    if (body.secret !== process.env.INIT_SECRET) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    await initializeDatabase();
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Database initialized successfully'
    });
    
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Database initialization failed'
    }, { status: 500 });
  }
}
