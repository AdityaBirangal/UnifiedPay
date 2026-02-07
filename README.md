# UnifiedPay

<div align="center">
  <img src="public/logo.png" alt="UnifiedPay Logo" width="120" height="120" />
  
  <h3>The easiest way to accept USDC payments on Arc Network</h3>
  
  <p>
    <a href="https://unifiedpay.birangal.com/">🌐 Live Demo</a> •
    <a href="https://github.com/AdityaBirangal/UnifiedPay">📦 GitHub</a> 
  </p>
</div>

## About

UnifiedPay is a non-custodial payment platform that enables creators, sellers, and business owners to accept payments using USDC on Arc or any other Network.

### Key Features

- 🚀 **Instant Settlements** - Receive payments instantly on Arc Network
- 💰 **Zero Platform Fees** - Keep 100% of what customers pay
- 🔒 **Non-Custodial** - Payments go directly from customer to creator
- 🔓 **Automatic Content Unlocking** - Blockchain-verified access control
- 📊 **Easy Analytics** - Track all payments and earnings in one dashboard
- 🌍 **24/7 Available** - Your payment page is always online

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 18, Tailwind CSS, thirdweb WalletConnect
- **Backend**: Next.js API routes, Prisma ORM, PostgreSQL (Supabase)
- **Blockchain**: Arc Network (primary), USDC stablecoin, ethers.js
- **Database**: PostgreSQL (Supabase)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- Arc Network RPC endpoint
- ThirdWeb account (for wallet connection)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual API keys and configuration
# IMPORTANT: Never commit .env to git - it contains sensitive keys!
```

3. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to PostgreSQL database (creates tables)
npm run db:push

# Or create a migration
npm run db:migrate
```

**Note**: Make sure your `DATABASE_URL` in `.env` points to your PostgreSQL database (Supabase connection string).

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.


## Database Schema

- **users**: Wallet addresses of creators
- **payment_pages**: Public payment pages for each creator
- **payment_items**: Individual payment items (fixed or open amount)
- **payments**: Record of all payments made

## Project Structure

```
/app              # Next.js App Router pages
/components       # React components
/prisma           # Prisma schema and migrations
/lib              # Utility functions and configurations
/public           # Static assets (logos, etc.)
```

## Links

- 🌐 **Live Demo**: [https://unifiedpay.birangal.com/](https://unifiedpay.birangal.com/)
- 📦 **GitHub Repository**: [https://github.com/AdityaBirangal/UnifiedPay](https://github.com/AdityaBirangal/UnifiedPay)

### Track: Commerce & Creator Infrastructure

UnifiedPay enables:
- ✅ Creators to accept stablecoin payments without KYC barriers
- ✅ Instant, low-cost global payments using USDC on Arc Network
- ✅ Automated content access with blockchain verification
- ✅ Non-custodial architecture - users control their funds
- ✅ Production-ready with comprehensive analytics

## Contact

- 💼 **LinkedIn**: [linkedin.com/in/AdityaBirangal](https://linkedin.com/in/AdityaBirangal)

## License

Copyright (c) 2026 Aditya Birangal  
Licensed under the MIT License. See [LICENSE](LICENSE) for details.
