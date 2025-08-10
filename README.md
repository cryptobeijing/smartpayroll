# Smart Payroll

A Next.js application for automated USDC payroll payments using the Coinbase CDP SDK on Base Sepolia testnet.

## Background

Smart Payroll is designed to help Web3 startups streamline their monthly payroll operations through blockchain technology. By leveraging Coinbase's Developer Platform (CDP), the application automates USDC payments to employees, providing transparent, auditable payroll records on the blockchain.

The project demonstrates how modern Web3 startups can integrate decentralized payroll systems into their operations, offering benefits such as:
- **Reduced Manual Work**: Eliminate manual payroll processing and calculations
- **Lower Fraud Risk**: Transparent on-chain transactions with immutable records
- **Transparency**: All transactions recorded on-chain with BaseScan verification
- **Global Access**: Support for international employees with consistent payment processing

## Features

- 📊 **Dashboard** - View all employees and payroll statistics
- 💰 **USDC Payments** - Automated payments using CDP SDK
- 🔄 **Batch Processing** - Pay all employees or selected employees
- 📈 **Real-time Status** - Track payment progress and transaction hashes
- 🔗 **Blockchain Explorer** - Direct links to BaseScan for transactions

## Tech Stack

- **[Coinbase CDP Smart Wallet](https://docs.cdp.coinbase.com/wallet-api/v2/introduction/welcome)** - Secure key management and transaction signing
- **[Coinbase CDP API](https://docs.cdp.coinbase.com/api-reference/v2/introduction)** - Blockchain interactions and account management
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Viem** - Ethereum client utilities
- **Lucide React** - Icons

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy the `.env` file with your CDP credentials
   - The file includes the same credentials from the hackathon project

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   - Navigate to `http://localhost:3000`

## Usage

### Dashboard Overview
- View total employees (23)
- See total payroll amount
- Monitor payroll account address
- Track selected employees and their total

### Making Payments
1. **Select employees** - Use checkboxes to select specific employees or select all
2. **Choose payment option**:
   - "Pay All Employees" - Pays all 23 employees
   - "Pay Selected" - Pays only selected employees
3. **Monitor progress** - Watch real-time payment processing
4. **View results** - See transaction hashes and payment status

### Payment Process
Each payment:
- Uses the same USDC transfer logic as `main.ts` Step 5
- Sends USDC tokens to employee wallet addresses
- Includes 2-second delay between payments to avoid rate limiting
- Provides transaction hash for blockchain verification

## Employee Data

The system includes 23 pre-configured employees with:
- Random salaries between 0.01 and 0.05 USDC
- EVM wallet addresses
- Department and position information
- Unique employee IDs

## Network Configuration

- **Network**: Base Sepolia (testnet)
- **USDC Contract**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Block Explorer**: BaseScan Sepolia

## API Endpoints

- `GET /api/payroll` - Fetch employee data and payroll info
- `POST /api/payroll` - Process payroll payments

## Security Notes

- Uses testnet for safe development
- CDP credentials are required for blockchain operations
- All transactions are recorded on Base Sepolia testnet
- Real-time transaction monitoring with BaseScan links