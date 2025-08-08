import { NextRequest, NextResponse } from 'next/server';
import { coinpayments } from '@/lib/coinpayments';
import { getDatabase } from '@/lib/database';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    
    // Get allowed cryptocurrencies from database
    const [allowedCoins] = await db.execute<RowDataPacket[]>(
      'SELECT symbol FROM allowed_cryptocurrencies WHERE is_active = 1'
    );
    
    const allowedSymbols = allowedCoins.map((coin: any) => coin.symbol);
    
    // Get rates from CoinPayments without filter first to get all rates
    const coinpaymentsRates = await coinpayments.rates();
    
    if (!coinpaymentsRates) {
      return NextResponse.json({ error: 'Failed to fetch rates from CoinPayments' }, { status: 500 });
    }

    // Find USD rate to use as base conversion
    let usdRate = 0;
    if (coinpaymentsRates.USD) {
      usdRate = parseFloat(coinpaymentsRates.USD.rate_btc);
    }

    // Calculate USD values for allowed coins using rate_btc
    const ratesWithUSD: { [key: string]: number } = {};
    
    allowedSymbols.forEach((symbol: string) => {
      if (coinpaymentsRates[symbol]) {
        const coinData = coinpaymentsRates[symbol];
        let usdAmount = 0;
        
        if (symbol === 'USDT') {
          // USDT should be close to 1 USD
          usdAmount = 1.0;
        } else if (coinData.rate_btc && usdRate > 0) {
          // Convert: coin_rate_btc / usd_rate_btc = coin_price_in_usd
          usdAmount = parseFloat(coinData.rate_btc) / usdRate;
        }

        if (usdAmount > 0) {
          ratesWithUSD[symbol] = parseFloat(usdAmount.toFixed(2));
        }
      }
    });
    
    return NextResponse.json(ratesWithUSD);

  } catch (error) {
    console.error('Error fetching rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rates from CoinPayments' },
      { status: 500 }
    );
  }
}