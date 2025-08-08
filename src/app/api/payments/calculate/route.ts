import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments';
import { getDatabase } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usdAmount = parseFloat(searchParams.get('amount') || '0');
    const currency = searchParams.get('currency') || 'USDT';

    if (usdAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const db = getDatabase();
    
    // Check if currency is allowed
    const [allowedRows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM allowed_cryptocurrencies WHERE symbol = ? AND is_active = 1',
      [currency]
    );

    if (!allowedRows || allowedRows.length === 0) {
      return NextResponse.json({ error: 'Currency not supported' }, { status: 400 });
    }

    // Calculate how many ABC coins user will receive
    const abcCoinAmount = await paymentService.calculateCoinAmount(usdAmount);

    // Get current ABC coin info
    const [tokenRows] = await db.execute<RowDataPacket[]>(
      `SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('token_price', 'abc_coin_symbol', 'current_supply', 'max_supply')`
    );
    
    const settings: { [key: string]: string } = {};
    tokenRows.forEach((row: any) => {
      settings[row.setting_key] = row.setting_value;
    });

    return NextResponse.json({
      success: true,
      data: {
        usd_amount: usdAmount,
        crypto_currency: currency,
        abc_coin: {
          symbol: settings.abc_coin_symbol || 'ABC',
          amount: abcCoinAmount,
          price: parseFloat(settings.token_price || '1.0'),
          current_supply: parseInt(settings.current_supply || '0'),
          max_supply: parseInt(settings.max_supply || '1000000'),
          supply_percentage: ((parseInt(settings.current_supply || '0') / parseInt(settings.max_supply || '1000000')) * 100).toFixed(2)
        },
        allowed_currency: allowedRows[0]
      }
    });

  } catch (error) {
    console.error('Error calculating coin amount:', error);
    return NextResponse.json(
      { error: 'Failed to calculate coin amount' },
      { status: 500 }
    );
  }
}