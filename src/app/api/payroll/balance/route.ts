import { NextResponse } from 'next/server';
import { getUSDCBalance } from '@/lib/balance';

export async function GET() {
  try {
    const usdcBalance = await getUSDCBalance();
    
    return NextResponse.json({
      success: true,
      balance: usdcBalance,
    });
  } catch (error) {
    console.error('Balance fetch error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch balance',
      balance: '0',
    }, { status: 500 });
  }
}
