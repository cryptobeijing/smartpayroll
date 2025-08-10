import { NextResponse } from 'next/server';
import { getUSDCBalance } from '@/lib/balance';

export async function GET() {
  try {
    // Force fresh data by adding cache-busting headers
    const usdcBalance = await getUSDCBalance();
    
    return NextResponse.json({
      success: true,
      balance: usdcBalance,
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date().toUTCString(),
      }
    });
  } catch (error) {
    console.error('Balance fetch error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch balance',
      balance: '0',
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  }
}
