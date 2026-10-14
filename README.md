# UnifiedPay

<div align="center">
  <img src="public/UnifiedPayLogo.png" alt="UnifiedPay Logo" width="120" height="120" />
  
  <h3>One USDC Liquidity Surface. Powered by Arc Network.</h3>
  
  <p>
    <a href="https://unifiedpay.birangal.com/">🌐 Live Demo</a> •
    <a href="https://github.com/AdityaBirangal/UnifiedPay">📦 GitHub</a> 
  </p>
</div>

---

## 📖 Project Overview

**UnifiedPay treats all USDC across chains as one unified liquidity surface.**

UnifiedPay enables creators to accept USDC payments on **Arc Network** as the settlement layer, while showing users a **unified USDC balance** across Arc, Ethereum, Polygon, Avalanche, and Base (plus any **Circle Gateway** deposits). Payments are made to human-readable **ENS names** (`creator.eth`) instead of hex addresses, with dynamic ENS resolution at runtime.

The result: **A non-custodial payment experience where users see all their USDC in one place, pay on Arc, and creators receive on Arc.**

**🟢 Live on Arc Mainnet** at [unifiedpay.birangal.com](https://unifiedpay.birangal.com/) — payments settle on Arc Mainnet (chain ID `5042`) in USDC, with a one-click switch to Arc Testnet.

### The Problem

Traditional Web3 payment platforms fragment liquidity across chains. A creator might accept payments on Ethereum, Polygon, and Base — but this creates:
- **Fragmented balances** that require manual reconciliation
- **Poor UX** — users must switch chains or bridge assets
- **Hex address fatigue** — sharing `0x1234...` instead of human names

### The Solution

UnifiedPay uses:
1. **Arc Network** as the single settlement and coordination layer
2. **A unified balance view** — on-chain USDC across chains plus Circle Gateway deposits
3. **ENS** for human-readable payment identities

Users see their total USDC across chains in one view, pay in USDC on Arc, and creators receive instantly on Arc — one settlement chain, one payment UI.

---

## 🌐 Why Arc Network?

**Arc serves as the coordination and settlement layer for UnifiedPay.**

While users may hold USDC on Ethereum, Polygon, Avalanche, or Base (shown in their unified balance), **all payments settle on Arc**. This design:

- ✅ **Avoids fragmenting liquidity** — One settlement layer, not N chains
- ✅ **Provides fast, low-cost settlement** — Creators receive payments instantly
- ✅ **Uses Arc as single source of truth** — Payment state lives on Arc
- ✅ **Verifiable** — Every payment is checked on Arc (recipient, amount, payer) before it's recorded

Arc is not just "another chain" — it's the **unified settlement surface** for cross-chain USDC liquidity.

### Arc's Role in the Payment Flow

```
1. User sees unified USDC balance (on-chain balances + Circle Gateway deposits)
2. User pays with USDC on Arc Network
3. Payment settles on Arc (coordination layer)
4. Creator receives USDC on Arc (single chain, instant)
```

By using Arc as the settlement layer, creators get **one place where all payments land**, instead of reconciling balances across chains.

---

## 💰 Unified USDC Balance

**One view of a user's USDC across chains.**

For the selected network, UnifiedPay reads the wallet's on-chain USDC balance on each chain and adds any USDC the user has deposited into **Circle Gateway**:

| Mainnet | Testnet |
|---|---|
| Arc Mainnet | Arc Testnet |
| Ethereum | Ethereum Sepolia |
| Polygon | Polygon Amoy |
| Avalanche | Avalanche Fuji |
| Base | Base Sepolia |

### What it does (and doesn't do)

✅ **What it does:**
- Shows one total USDC number, with a per-chain breakdown
- Includes Circle Gateway deposits (Gateway's balances API reports USDC deposited into the Gateway Wallet, so it is added on top of wallet balances)
- Helps users answer: *"Do I have enough USDC to make this payment?"*

❌ **What it doesn't do:**
- Does NOT bridge or swap assets — payments are made in USDC on Arc
- Does NOT custody user funds

### Implementation Details

- Direct `balanceOf` reads on each chain, in parallel, with a per-chain timeout
- Free public RPCs by default; set `NEXT_PUBLIC_RPC_URL_*` to use your own provider
- Circle Gateway REST API (`/v1/balances`), mainnet or testnet to match the selected network

Code reference: `app/api/balance/unified/route.ts`, `lib/circle-gateway.ts`

---

## 🌐 Arc Mainnet & Testnet

UnifiedPay runs on **Arc Mainnet by default**. A **Mainnet / Testnet** switch in the header moves the whole app to Arc Testnet (test USDC from [faucet.circle.com](https://faucet.circle.com)). The choice is saved in the browser.

| | Arc Mainnet | Arc Testnet |
|---|---|---|
| Chain ID | `5042` | `5042002` |
| RPC | `https://rpc.mainnet.arc.io` | `https://rpc.testnet.arc.io` |
| Explorer | [explorer.arc.io](https://explorer.arc.io) | [explorer.testnet.arc.io](https://explorer.testnet.arc.io) |
| USDC (ERC-20, 6 decimals) | `0x3600000000000000000000000000000000000000` | `0x3600000000000000000000000000000000000000` |

- **Each payment page is locked to one network.** Creators pick Arc Mainnet or Arc Testnet when creating a page; it only accepts payments on that chain, and only payments on that chain unlock its content (test USDC can't unlock a mainnet page). Pages created before network selection existed are on Testnet.
- Buyers opening a page are switched to its network automatically.
- Every payment stores the `chainId` it settled on and is always verified on that chain.
- Dashboard and Purchases show only the selected network's payments, so mainnet and testnet totals never mix.
- ENS and the unified balance follow the selected network (Ethereum, Polygon, Avalanche, Base mainnets vs. their testnets).

Code reference: `lib/constants.ts` (`NETWORKS`), `lib/chains.ts`, `components/providers/NetworkProvider.tsx`

---

## 🔗 ENS Integration

**ENS provides human-readable payment identities.**

Instead of sharing payment links like `unifiedpay.com/pay/0x1234...`, creators can use **ENS names** like:

```
unifiedpay.com/pay/creator.eth ✓
```

### What UnifiedPay Implements

✅ **Runtime ENS resolution** (forward and reverse)
- Forward: `creator.eth` → `0x1234...`
- Reverse: `0x1234...` → `creator.eth`

✅ **ENS avatar display** from on-chain records
- Fetches and displays ENS avatars via `resolver.getAvatar()`

✅ **Dynamic lookups** — No hardcoded addresses
- All ENS resolution happens at runtime via ethers.js ENS API
- Uses Ethereum mainnet for ENS lookups (Sepolia when Testnet is selected)

### Why This Matters

ENS is not cosmetic — it's the **identity layer** for payments:
- **Better UX**: Share `creator.eth` instead of `0x1234...`
- **On-chain verification**: ENS names resolve to addresses trustlessly
- **Portable identity**: ENS names work across all chains

### Implementation Details

- Uses ethers.js `provider.resolveName()` and `provider.lookupAddress()`
- Implements 5-minute in-memory cache for performance
- Gracefully falls back to hex addresses if ENS resolution fails
- Supports ENS avatars from IPFS, HTTP, and data URIs

Code reference: `lib/ens.ts`

---

## 🏗️ Architecture Overview

### System Flow

```
┌─────────────────────────────────────────────────────────────┐
│  User Wallet                                                 │
│  (USDC on Arc, Ethereum, Polygon, Avalanche, Base)          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │    Unified Balance     │
         │ (RPC + Circle Gateway) │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │  UnifiedPay Frontend   │
         │  - ENS Resolution      │
         │  - Payment UI          │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │     Arc Network        │
         │  (Settlement Layer)    │
         │  - USDC Transfer       │
         │  - Payment Recording   │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   Creator Wallet       │
         │  (Receives on Arc)     │
         └────────────────────────┘
```

### Key Components

1. **Unified balance** — Read-only USDC view across chains (on-chain + Circle Gateway deposits)
2. **Arc Network** — Settlement and coordination layer for payments
3. **ENS** — Human-readable identity resolution
4. **UnifiedPay** — Frontend + API that orchestrates all three

### Technical Architecture

- **Frontend**: Next.js 16 (App Router), React 18, Tailwind CSS
- **Wallet Connection**: thirdweb WalletConnect
- **Blockchain Interaction**: ethers.js
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Payment Settlement**: Arc Network USDC contracts
- **Balance Aggregation**: Direct RPC reads + Circle Gateway REST API
- **Identity Resolution**: ENS via ethers.js (Ethereum mainnet, or Sepolia on Testnet)

---

## ✅ What's Implemented vs ❌ What's Not

### ✅ Implemented Features

- **Arc Network Integration**
  - USDC payment settlement on Arc
  - Arc as primary coordination layer
  - Direct Arc Network RPC integration

- **Unified Balance**
  - USDC across Arc, Ethereum, Polygon, Avalanche, and Base (or their testnets)
  - Circle Gateway deposits added on top
  - Free public RPCs by default

- **ENS Integration**
  - Runtime ENS name resolution (forward + reverse)
  - ENS avatar display from on-chain records
  - Dynamic lookups via ethers.js
  - Human-readable payment URLs (`/pay/creator.eth`)

- **Payment Infrastructure**
  - Non-custodial direct wallet-to-wallet transfers
  - Zero platform fees (100% to creators)
  - On-chain verification of every payment (recipient, amount, payer)
  - Automatic content unlocking after verified payment
  - Payment history and analytics dashboard

- **User Experience**
  - Single-page payment flow
  - Arc Mainnet by default, one-click switch to Testnet
  - Each payment page locked to one network
  - ENS-based identity throughout UI

### ❌ Not Implemented

- **Cross-chain payments** — Balances on other chains are shown, but payments are made in USDC on Arc (no bridging)
- **Token swaps** — USDC-only (no DEX integration)
- **Custodial wallets** — Fully non-custodial (users control keys)
- **Fiat on/off ramps** — Crypto-native only

---

## 🏗️ Integration Highlights

### Arc Network Integration ✓

| Feature | Implementation |
|---------|----------------|
| **Uses Arc as coordination layer** | All payments settle on Arc; Arc is the single source of truth for payment state |
| **Unified balance UX** | Users see USDC across chains in one view, then pay in USDC on Arc |
| **Shows Arc's unique value** | Arc enables "one liquidity surface" by serving as the settlement layer for cross-chain USDC |
| **Technical implementation** | Direct Arc Network integration via RPC; USDC transfers on Arc; payment recording on Arc |

**Why this matters for Arc**: UnifiedPay shows Arc as the **settlement layer** for everyday USDC commerce — creators get paid on one chain, with fast, low-cost USDC transfers.

---

### ENS Integration ✓

| Feature | Implementation |
|---------|----------------|
| **Runtime ENS resolution** | Uses ethers.js `resolveName()` and `lookupAddress()` — no hardcoded addresses |
| **Human-readable identities** | Payment URLs use ENS names (`/pay/creator.eth`) instead of hex addresses |
| **ENS avatar integration** | Displays ENS avatars from on-chain records via `resolver.getAvatar()` |
| **Forward + reverse lookup** | Resolves ENS names to addresses AND addresses to ENS names |
| **Dynamic, not static** | All ENS data fetched at runtime; 5-minute cache for performance |

**Why this matters for ENS**: UnifiedPay treats ENS as the **identity layer** for Web3 payments, making payment URLs human-readable and verifiable on-chain.

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **React 18**
- **Tailwind CSS**
- **thirdweb** for wallet connection

### Backend
- **Next.js API Routes**
- **Prisma ORM**
- **PostgreSQL** (Supabase)

### Blockchain
- **Arc Network** (settlement layer)
- **Circle Gateway** (deposit balances)
- **ENS** (Ethereum mainnet / Sepolia)
- **ethers.js** (blockchain interaction)

### Database Schema
- `unifiedpay_users` — Wallet addresses of creators
- `unifiedpay_payment_pages` — Public payment pages (each locked to one Arc network via `chainId`)
- `unifiedpay_payment_items` — Individual payment items
- `unifiedpay_payments` — Record of all payments (with the `chainId` they settled on)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Circle Gateway API key (optional)
- thirdweb account for wallet connection

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

**Environment variables** (only `DATABASE_URL` and `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` are required):
```bash
# Database
DATABASE_URL="postgresql://..."

# Arc Network (optional - defaults to Arc's public RPCs)
NEXT_PUBLIC_RPC_URL_ARC_MAINNET="https://..."
NEXT_PUBLIC_RPC_URL_ARC_TESTNET="https://..."

# Circle Gateway (optional)
CIRCLE_GATEWAY_API_KEY="your-api-key"

# ENS (optional - defaults to public Ethereum RPCs)
NEXT_PUBLIC_RPC_URL_ETHEREUM_MAINNET="https://..."
NEXT_PUBLIC_RPC_URL_ETHEREUM_SEPOLIA="https://..."

# thirdweb
NEXT_PUBLIC_THIRDWEB_CLIENT_ID="your-client-id"
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

---

## 📂 Project Structure

```
/app              # Next.js App Router pages and API routes
/components       # React components
/prisma           # Prisma schema and migrations
/lib              # Core utilities
  ├── circle-gateway.ts   # Circle Gateway API client
  ├── ens.ts             # ENS resolution utilities
  ├── blockchain.ts      # Arc Network integration
  └── constants.ts       # Chain IDs, contract addresses
/public           # Static assets
```

---

## 🌐 Links

- **Live Demo**: [https://unifiedpay.birangal.com/](https://unifiedpay.birangal.com/)
- **GitHub Repository**: [https://github.com/AdityaBirangal/UnifiedPay](https://github.com/AdityaBirangal/UnifiedPay)
- **Arc Docs**: [docs.arc.io](https://docs.arc.io/)

---

## 👤 Contact

**Aditya Birangal**
- 💼 LinkedIn: [linkedin.com/in/AdityaBirangal](https://linkedin.com/in/AdityaBirangal)
- 🐙 GitHub: [@AdityaBirangal](https://github.com/AdityaBirangal)

---

## 📄 License

Copyright (c) 2026 Aditya Birangal  
Licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>One USDC Liquidity Surface</strong>
  <br />
  <em>Arc Network • Circle Gateway • ENS</em>
</div>
