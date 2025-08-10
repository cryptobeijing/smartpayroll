import { CdpClient } from '@coinbase/cdp-sdk';

interface TokenAmount {
  amount: string;
  decimals: number;
}

interface Token {
  contractAddress: string;
  name: string;
  network: string;
  symbol: string;
}

interface TokenBalance {
  amount: TokenAmount;
  token: Token;
}

async function getUSDCBalance(): Promise<string> {
  const apiKeyId = process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET;
  const address = '0x4f53d06DE83CB8f2eaF8B2AAb647983Dcb496b1E'; // 6.715 USDC
  
  if (!apiKeyId || !apiKeySecret) {
    throw new Error('CDP API credentials not found in environment variables');
  }
  
  try {
    // Use CDP SDK instead of cdpcurl command
    const cdp = new CdpClient();
    
    // Get token balances using the CDP SDK with fresh data
    // Add timestamp to ensure we're not getting cached responses
    const balances = await cdp.evm.listTokenBalances({
      address: address as `0x${string}`,
      network: 'base-sepolia',
    });
    
    console.log(`CDP API response received at ${new Date().toISOString()}:`, {
      totalBalances: balances.balances.length,
      address: address,
      network: 'base-sepolia'
    });
    
    // Find USDC balance
    const usdcBalance = balances.balances.find(balance => 
      balance.token.symbol === 'USDC'
    );

    if (!usdcBalance) {
      console.log('No USDC balance found in the response');
      return '0';
    }

    console.log('USDC balance details:', {
      symbol: usdcBalance.token.symbol,
      contractAddress: usdcBalance.token.contractAddress,
      rawAmount: usdcBalance.amount.amount,
      decimals: usdcBalance.amount.decimals
    });

    // Convert from smallest unit to readable format
    const amount = BigInt(usdcBalance.amount.amount);
    const decimals = usdcBalance.amount.decimals;
    const readableAmount = Number(amount) / Math.pow(10, decimals);
    
    // Log the fresh balance for debugging
    console.log(`Fresh USDC balance fetched at ${new Date().toISOString()}: ${readableAmount.toFixed(decimals)}`);
    
    return readableAmount.toFixed(decimals);
  } catch (error) {
    console.error('Error fetching USDC balance:', error);
    throw error;
  }
}

// Example usage
getUSDCBalance()
  .then(balance => {
    console.log(`USDC Balance: ${balance}`);
  })
  .catch(error => {
    console.error('Failed to get USDC balance:', error);
  });

export { getUSDCBalance };