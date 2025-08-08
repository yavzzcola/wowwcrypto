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

    // Get all system settings
    const [settings] = await db.execute(
      'SELECT setting_key, setting_value, description FROM system_settings ORDER BY setting_key'
    );

    const settingsData = Array.isArray(settings) 
      ? settings.reduce((acc: any, setting: any) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {})
      : {};

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Settings retrieved successfully',
      data: {
        settings: settingsData
      }
    });

  } catch (error) {
    console.error('Get admin settings error:', error);
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
    const { setting_key, setting_value } = body;

    if (!setting_key || setting_value === undefined) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Setting key and value are required'
      }, { status: 400 });
    }

    const db = getDatabase();

    // Update or insert setting
    await db.execute(`
      INSERT INTO system_settings (setting_key, setting_value)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE 
        setting_value = VALUES(setting_value),
        updated_at = CURRENT_TIMESTAMP
    `, [setting_key, String(setting_value)]);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Setting updated successfully'
    });

  } catch (error) {
    console.error('Update admin settings error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}