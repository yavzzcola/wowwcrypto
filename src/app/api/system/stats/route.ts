import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    
    // Get system settings including supply information
    const [settingsRows] = await db.execute<RowDataPacket[]>(
      `SELECT setting_key, setting_value 
       FROM system_settings 
       WHERE setting_key IN ('max_supply', 'current_supply', 'token_price', 'abc_coin_symbol')`
    );

    // Convert settings to object
    const settings: { [key: string]: string } = {};
    settingsRows.forEach((row: any) => {
      settings[row.setting_key] = row.setting_value;
    });

    const maxSupply = parseInt(settings.max_supply || '1000000');
    const currentSupply = parseInt(settings.current_supply || '0');
    const tokenPrice = parseFloat(settings.token_price || '1.0');
    const coinSymbol = settings.abc_coin_symbol || 'ABC';

    // Calculate supply percentage
    const supplyPercentage = maxSupply > 0 ? (currentSupply / maxSupply) * 100 : 0;

    // Get total users count
    const [usersCountRows] = await db.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users WHERE role != "admin"'
    );
    const totalUsers = usersCountRows[0]?.count || 0;

    // Get total completed transactions
    const [transactionsCountRows] = await db.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM transactions WHERE status = "completed"'
    );
    const totalTransactions = transactionsCountRows[0]?.count || 0;

    // Get total volume (sum of all completed deposits in USD)
    const [volumeRows] = await db.execute<RowDataPacket[]>(
      `SELECT 
         COALESCE(SUM(p.amount), 0) as total_volume
       FROM payments p 
       WHERE p.status = 'completed'`
    );
    const totalVolume = parseFloat(volumeRows[0]?.total_volume || '0');

    // Get recent activity count (last 24 hours)
    const [recentActivityRows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count 
       FROM transactions 
       WHERE status = 'completed' 
         AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );
    const recentActivity = recentActivityRows[0]?.count || 0;

    // Get active referrals count
    const [referralsRows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT u.referral_code) as count
       FROM users u
       WHERE u.referral_code IS NOT NULL 
         AND EXISTS (
           SELECT 1 FROM users u2 WHERE u2.referred_by = u.referral_code
         )`
    );
    const activeReferrals = referralsRows[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: {
        supply: {
          current: currentSupply,
          max: maxSupply,
          percentage: Math.round(supplyPercentage * 100) / 100,
          remaining: maxSupply - currentSupply
        },
        token: {
          price: tokenPrice,
          symbol: coinSymbol
        },
        platform: {
          total_users: totalUsers,
          total_transactions: totalTransactions,
          total_volume: totalVolume,
          recent_activity: recentActivity,
          active_referrals: activeReferrals
        },
        market: {
          market_cap: currentSupply * tokenPrice,
          circulating_supply: currentSupply
        }
      }
    });

  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system statistics' },
      { status: 500 }
    );
  }
}

// Update supply when coins are distributed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, operation = 'add' } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const db = getDatabase();
    
    // Get current supply
    const [currentSupplyRows] = await db.execute<RowDataPacket[]>(
      'SELECT setting_value FROM system_settings WHERE setting_key = "current_supply"'
    );
    
    const currentSupply = parseInt(currentSupplyRows[0]?.setting_value || '0');
    
    let newSupply: number;
    if (operation === 'add') {
      newSupply = currentSupply + amount;
    } else if (operation === 'subtract') {
      newSupply = Math.max(0, currentSupply - amount);
    } else {
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    // Check max supply limit
    const [maxSupplyRows] = await db.execute<RowDataPacket[]>(
      'SELECT setting_value FROM system_settings WHERE setting_key = "max_supply"'
    );
    const maxSupply = parseInt(maxSupplyRows[0]?.setting_value || '1000000');

    if (newSupply > maxSupply) {
      return NextResponse.json({ 
        error: 'Would exceed maximum supply',
        current_supply: currentSupply,
        max_supply: maxSupply,
        requested_amount: amount
      }, { status: 400 });
    }

    // Update supply
    await db.execute(
      'UPDATE system_settings SET setting_value = ? WHERE setting_key = "current_supply"',
      [newSupply.toString()]
    );

    return NextResponse.json({
      success: true,
      data: {
        previous_supply: currentSupply,
        new_supply: newSupply,
        change: newSupply - currentSupply,
        operation: operation
      }
    });

  } catch (error) {
    console.error('Error updating supply:', error);
    return NextResponse.json(
      { error: 'Failed to update supply' },
      { status: 500 }
    );
  }
}