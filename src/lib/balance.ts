import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const execAsync = promisify(exec);

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

interface CDPResponse {
  balances: TokenBalance[];
}

async function getUSDCBalance(): Promise<string> {
  const apiKeyId = process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET;
  const address = '0x4f53d06DE83CB8f2eaF8B2AAb647983Dcb496b1E'; // 6.715 USDC
  
  if (!apiKeyId || !apiKeySecret) {
    throw new Error('CDP API credentials not found in environment variables');
  }
  
  const url = `https://api.cdp.coinbase.com/platform/v2/data/evm/token-balances/base-sepolia/${address}?pageSize=100`;
  
  try {
    // Use cdpcurl command directly since it handles Ed25519 authentication
    const command = `cdpcurl -X GET -i ${apiKeyId} -s ${apiKeySecret} "${url}"`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.warn('cdpcurl stderr:', stderr);
    }
    
    // Parse the response
    const lines = stdout.trim().split('\n');
    const jsonLine = lines.find(line => line.startsWith('{'));
    
    if (!jsonLine) {
      throw new Error('No JSON response found');
    }
    
    const data: CDPResponse = JSON.parse(jsonLine);
    
    // Find USDC balance
    const usdcBalance = data.balances.find(balance => 
      balance.token.symbol === 'USDC'
    );

    if (!usdcBalance) {
      return '0';
    }

    // Convert from smallest unit to readable format
    const amount = BigInt(usdcBalance.amount.amount);
    const decimals = usdcBalance.amount.decimals;
    const readableAmount = Number(amount) / Math.pow(10, decimals);
    
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