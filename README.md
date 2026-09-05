# GrowthOS AI — Autonomous Merchant Growth Engine

> **AI-powered cross-sell intelligence & Razorpay sandbox payment automation for high-growth D2C brands.**

---

## Overview

**GrowthOS** bridges the gap between passive e-commerce analytics and direct revenue capture. While traditional dashboards leave merchants to manually identify cross-sell opportunities, calculate margins, draft copy, and configure payment links, GrowthOS automates the entire loop:

1. **Deterministic Opportunity Engine:** Mines order co-purchase graphs to identify attach-rate gaps with 100% bit-exact mathematical precision (zero numerical hallucinations).
2. **AI Reasoning & Strategy Layer:** Translates raw opportunity data into clear merchant narratives, pricing recommendations, and production-ready marketing copy.
3. **In-Session Campaign Draft Store:** Supports seamless multi-step wizard customization (pricing, channels, copy) with instant cross-step synchronization.
4. **Guarded Razorpay Test Mode Execution:** Enforces an explicit human **Merchant Authorization Gate** and parameter safety bounds before creating Razorpay Payment Links.
5. **Cryptographic Payment Verification:** Verifies sandbox payments using server-side HMAC-SHA256 signatures and attributes captured test revenue in real time.

---

## System Architecture

```text
┌────────────────────────────────────────────────────────┐
│              Data Foundation & Graph Engine            │
│  18,420 orders · 12,840 customers · Seed 42 Determinism │
│  Attach Rate Gap: 16.0% vs 29% benchmark → 2,772 cohort│
│  Deterministic Incremental Revenue: ₹41,602           │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               AI Reasoning & Strategy Layer            │
│  Dynamic Rationale · Copywriting · Strategic Guidance  │
│  Recommended Bundle: SoleX Shoes + Socks at ₹2,799     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               Campaign Wizard & Draft Store            │
│  Step 1: Setup (Editable Price/Name/Validity/Channels) │
│  Step 2: Audience (Segment Filters & Deliverability)   │
│  Step 3: Message (Interactive Email Preview & Savings) │
│  Step 4: Review (Safety Bounds & Table Summary)        │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│           Safety Validator & Merchant Gate             │
│  ✓ Explicit Merchant Approval Gate                     │
│  ✓ Price Bounds (₹100 to ₹50,000)                      │
│  ✓ Audience Cap (≤ 100,000 customers)                  │
│  ✓ Currency Lock (Strictly INR)                        │
│  ✓ Reference ID Bounds (<= 40 chars sanitization)      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│           Razorpay Test Mode Payment Action            │
│  Sandbox Payment Link Generated (Short URL & ID)       │
│  Cryptographic HMAC-SHA256 Signature Verification      │
│  Closed-Loop Attribution (Projected ₹41.6k vs Captured)│
└────────────────────────────────────────────────────────┘
```

---

## Key Features

- **Zero-Hallucination Math**: Financial projections and customer counts are calculated deterministically by the opportunity engine, preventing AI hallucination of key metrics.
- **Merchant Authorization Gate**: AI cannot move funds or create payment links autonomously. Human approval is strictly enforced via the UI state machine.
- **Compact Reference IDs**: Algorithmic generation (`GOS-{slug}-{timestamp}`) guaranteed $\le 40$ characters to comply with Razorpay API specifications.
- **HMAC-SHA256 Cryptographic Verification**: Payments are verified using secret-key HMAC hashing on the server, rejecting spoofed client events.
- **Synchronized Session State**: Real-time reactivity across Dashboard, Campaign Wizard, and Campaign Results using React 19 external store synchronization.
- **Server Credential Isolation**: `RAZORPAY_KEY_SECRET` is strictly isolated server-side and never exposed to the client bundle.

---

## Quickstart

### Prerequisites
- Node.js 20+ (Node.js 22 recommended)
- pnpm or npm

### Installation
```bash
git clone https://github.com/ishan10x/growthos-ai.git
cd growthos-ai
npm install
```

### Configure Razorpay Test Mode (Optional)
GrowthOS includes a complete sandbox payment simulator and runs in **Demo Mode** out of the box. To connect your real Razorpay Test Mode sandbox:

1. Create a `.env` file in the root directory:
   ```env
   RAZORPAY_KEY_ID=rzp_test_yourKeyHere
   RAZORPAY_KEY_SECRET=yourSecretHere
   ```
   *(Note: Live keys starting with `rzp_live_` are strictly rejected by the server safety gate).*

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:8443](http://localhost:8443) in your browser.

---

## Verification & Automated Test Suites

GrowthOS includes automated test suites covering data determinism, AI reasoning, and Razorpay sandbox security:

```bash
# 1. Razorpay Test Mode & Safety Gates (130 automated checks)
npm run test:razorpay

# 2. AI Reasoning & Natural Language Query Routing (29 automated checks)
npm run test:ai

# 3. Data Foundation & Opportunity Engine Determinism (100% bit-exact check)
npm run test:data

# 4. Production TypeScript & Vite Build
npm run build
```

---

## Project Structure

```text
growthos-ai/
├── src/
│   ├── components/       # Reusable UI components, icons, badges, topbar, sidebar
│   ├── data/             # Synthetic merchant data generator & deterministic seed engine
│   ├── hooks/            # React external store synchronization hooks (useCampaignDraft, useCampaignExecution)
│   ├── pages/            # Application views:
│   │   ├── DashboardPage.tsx              # Executive metrics & top opportunity spotlight
│   │   ├── OpportunityInvestigationPage.tsx # Deep-dive attach rate gap analysis
│   │   ├── CampaignCreatePage.tsx         # 4-step wizard with real-time draft store
│   │   └── CampaignResultsPage.tsx        # Closed-loop attribution & payment timeline
│   ├── services/         # Core business logic:
│   │   ├── opportunityService.ts          # Co-purchase graph & attach rate engine
│   │   ├── aiService.ts                   # Strategic reasoning & copy generation
│   │   ├── campaignDraftStore.ts          # In-session multi-step wizard state
│   │   ├── campaignExecutionStore.ts      # Verified payment & launch tracker
│   │   ├── razorpayServerService.ts       # Server-side safety gate, HMAC verification & API client
│   │   └── razorpayClientService.ts       # Client API wrapper
│   └── types/            # TypeScript schemas for data, AI, and Razorpay
├── RAZORPAY_INTEGRATION.md # Detailed integration specification & security architecture
└── vite.config.ts        # Vite config with Tailwind CSS v4 & server API routes
```

---

## License

MIT License. Built for merchant growth.
