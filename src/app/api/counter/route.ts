import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    
    // Get active counter settings and system settings together
    const [counterResults] = await db.execute(`
      SELECT stage_name, start_date, end_date
      FROM counter_settings 
      WHERE is_active = 1 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    const [settingsResults] = await db.execute(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key IN ('current_supply', 'max_supply', 'token_price')
    `);
    
    const settings = Array.isArray(counterResults) && counterResults.length > 0 ? counterResults[0] : null;
    
    if (!settings) {
      return NextResponse.json({
        success: false,
        message: 'No active counter found'
      }, { status: 404 });
    }
    
    // Parse system settings
    const systemSettings: any = {};
    if (Array.isArray(settingsResults)) {
      settingsResults.forEach((setting: any) => {
        systemSettings[setting.setting_key] = setting.setting_value;
      });
    }
    
    const currentSupply = parseFloat(systemSettings.current_supply || '0');
    const maxSupply = parseFloat(systemSettings.max_supply || '1000000');
    const tokenPrice = parseFloat(systemSettings.token_price || '1.00');
    const progressPercentage = Math.min(Math.round((currentSupply / maxSupply) * 100), 100);
    
    const now = new Date().getTime();
    const endTime = new Date((settings as any).end_date).getTime();
    const distance = endTime - now;
    
    return NextResponse.json({
      success: true,
      data: {
        title: 'PRESALE ENDS IN',
        description: `${(settings as any).stage_name} - Don't miss your chance to join the revolution`,
        targetDate: new Date((settings as any).end_date).toISOString(),
        timeLeft: {
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
          isExpired: distance <= 0
        },
        progress: {
          currentSupply: currentSupply,
          maxSupply: maxSupply,
          percentage: progressPercentage
        },
        token: {
          price: tokenPrice
        }
      }
    });
    
  } catch (error) {
    console.error('Counter API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// Admin endpoint to update counter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stageName, startDate, endDate, isActive } = body;

    if (!stageName || !endDate) {
      return NextResponse.json({
        success: false,
        message: 'Stage name and end date are required'
      }, { status: 400 });
    }

    const db = getDatabase();

    // First, deactivate all current counters
    await db.execute('UPDATE counter_settings SET is_active = 0');

    // Insert new counter settings
    await db.execute(`
      INSERT INTO counter_settings (stage_name, start_date, end_date, is_active)
      VALUES (?, ?, ?, ?)
    `, [stageName, startDate || new Date().toISOString(), endDate, isActive ? 1 : 0]);

    return NextResponse.json({
      success: true,
      message: 'Counter updated successfully'
    });

  } catch (error) {
    console.error('Counter update error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}