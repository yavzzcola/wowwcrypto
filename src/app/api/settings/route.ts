import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Mock system settings - in real app this would come from database
    const settings = {
      coin_name: 'ABC System',
      coin_symbol: 'ABC',
      coin_price: 1.0,
      referral_rate: 10,
      minimum_withdrawal: 100,
      withdrawal_fee: 0.5
    };

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
