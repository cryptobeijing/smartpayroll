import { CdpClient } from '@coinbase/cdp-sdk';
import { parseUnits } from 'viem';

export interface Employee {
  id: number;
  name: string;
  address: string;
  salary: number;
  department: string;
  position: string;
}

export interface PaymentResult {
  employeeId: number;
  transactionHash: string;
  amount: string;
  success: boolean;
  error?: string;
}

export class PayrollService {
  private cdp: CdpClient;
  private account: any;
  private accountAddress: string;
  
  // USDC contract address on Base Sepolia testnet (this should be the actual USDC token contract)
  private readonly USDC_CONTRACT_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
  private readonly TRANSFER_FUNCTION_SIGNATURE = 'a9059cbb'; // transfer(address,uint256)

  constructor(accountAddress?: string) {
    this.cdp = new CdpClient();
    // Use the specific payroll account address
    this.accountAddress = accountAddress || '0x4f53d06DE83CB8f2eaF8B2AAb647983Dcb496b1E';
  }

  async initialize(): Promise<void> {
    try {
      // Use getOrCreateAccount to load existing or create new payroll account
      this.account = await this.cdp.evm.getOrCreateAccount({
        name: 'my-trading-account',
      });
      console.log('Using payroll account:', this.account.address);
      
      // Verify this is the correct payroll account
      if (this.account.address.toLowerCase() !== this.accountAddress.toLowerCase()) {
        console.warn(`Account address mismatch: expected ${this.accountAddress}, got ${this.account.address}`);
        console.log('This might be a different account. Proceeding with the CDP account.');
      }
    } catch (error) {
      console.error('Failed to initialize payroll service:', error);
      throw error;
    }
  }

  async payEmployee(employee: Employee): Promise<PaymentResult> {
    try {
      if (!this.account) {
        await this.initialize();
      }

      const usdcAmount = parseUnits(employee.salary.toString(), 6); // USDC has 6 decimals
      
      // Prepare the USDC transfer transaction data
      const recipientAddressPadded = employee.address.slice(2).padStart(64, '0');
      const amountPadded = usdcAmount.toString(16).padStart(64, '0');
      const transferData = `0x${this.TRANSFER_FUNCTION_SIGNATURE}${recipientAddressPadded}${amountPadded}`;

      console.log(`Paying ${employee.name}: ${employee.salary} USDC to ${employee.address}`);

      // Send the USDC transaction
      const transactionResult = await this.cdp.evm.sendTransaction({
        address: this.account.address,
        transaction: {
          to: this.USDC_CONTRACT_ADDRESS,
          value: 0n, // No ETH value for token transfer
          data: transferData as `0x${string}`,
        },
        network: 'base-sepolia',
      });

      console.log(`Payment sent! Tx: ${transactionResult.transactionHash}`);

      return {
        employeeId: employee.id,
        transactionHash: transactionResult.transactionHash,
        amount: employee.salary.toString(),
        success: true,
      };
    } catch (error) {
      console.error(`Failed to pay employee ${employee.name}:`, error);
      
      return {
        employeeId: employee.id,
        transactionHash: '',
        amount: employee.salary.toString(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async payAllEmployees(employees: Employee[]): Promise<PaymentResult[]> {
    const results: PaymentResult[] = [];
    
    console.log(`Starting payroll for ${employees.length} employees...`);
    
    // Check account and balance before starting
    if (!this.account) {
      await this.initialize();
    }
    
    console.log(`Using account: ${this.account.address}`);
    const balance = await this.checkUSDCBalance();
    console.log(`Account USDC balance: ${balance}`);

    // Pay employees one by one to avoid rate limiting
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      console.log(`Processing payment ${i + 1}/${employees.length} for ${employee.name}`);
      
      const result = await this.payEmployee(employee);
      results.push(result);
      
      // Small delay between payments
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Payroll complete: ${successful} successful, ${failed} failed`);
    
    return results;
  }

  getAccountAddress(): string | null {
    return this.account?.address || null;
  }

  async checkUSDCBalance(): Promise<string> {
    if (!this.account) {
      await this.initialize();
    }
    
    try {
      // For demo purposes, we'll return a mock balance
      // In a real implementation, you'd query the USDC contract
      console.log(`Checking USDC balance for account: ${this.account.address}`);
      return "1.0"; // Mock balance
    } catch (error) {
      console.error('Failed to check USDC balance:', error);
      return "0.0";
    }
  }
}