# GrowthOS — Razorpay Test Mode Integration Guide

## Overview

GrowthOS integrates with **Razorpay Test Mode** to create sandbox payment links for approved cross-sell campaigns and record verified test payments. This guide covers how to obtain test credentials, how secrets and safety gates work, how cryptographic signatures are verified, and how to reproduce the demo.

---

## 1. Safety & Architecture Rules

1. **Strictly Test Mode Only**:
   - Only keys starting with `rzp_test_` are permitted.
   - Any attempt to configure live credentials (`rzp_live_`) is immediately rejected by the server safety gate.
   - Zero real money movement or live charges can ever occur.
2. **Server-Side Boundary**:
   - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are read exclusively in the Node.js / Vite server process via `/api/razorpay/*`.
   - Keys are never bundled into client JavaScript, never exposed to the browser, and never committed to git.
3. **Demo Mode Resiliency**:
   - The application functions fully without credentials. If keys are absent, GrowthOS displays `Not configured (Demo Mode)` and safely blocks payment execution with:
     > *"Action blocked — no money movement occurred. Razorpay Test Mode credentials are not configured."*
4. **Autonomous AI Safeguards**:
   - AI recommendations cannot execute payments directly.
   - Execution requires explicit merchant authorization via the UI state machine.

---

## 2. Approval State Machine & Safety Bounds

Payment execution follows an explicit, guarded state machine:

```text
draft
  ↓
pending_approval
  ↓ (Merchant clicks authorization checkbox)
approved
  ↓ (Safety Validator executes)
validated
  ↓ (Calls Razorpay Test API with Idempotency Key)
executing
  ↓
succeeded  OR  failed
```

### Safety Bounds Enforced:
* **Minimum Bundle Price**: ₹100
* **Maximum Bundle Price**: ₹50,000 (prevents accidental runaway discounts or excessive amounts)
* **Maximum Targeted Customers**: 100,000 customers per campaign
* **Supported Currency**: Strictly `INR`
* **Single Action Per Request**: Prevents batch spamming
* **Idempotency Protection**: Deterministic idempotency key (`idemp_<sourceId>_<recommendedId>_v1`) prevents duplicate Payment Links if a merchant clicks launch multiple times or retries.

---

## 3. How to Obtain Razorpay TEST MODE Credentials

> [!WARNING]
> Never use live API keys. Always verify you are in **Test Mode** in your Razorpay Dashboard.

1. Sign in to your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Toggle the mode switch at the top to **Test Mode** (the dashboard turns to amber/sandbox theme).
3. Navigate to **Account & Settings** → **API Keys**.
4. Click **Generate Test Key**.
5. Copy your:
   * **Key ID** (format: `rzp_test_xxxxxxxxxxxxxxxx`)
   * **Key Secret** (format: random alphanumeric string)

---

## 4. Where to Place Credentials

Create or edit `.env.local` (which is git-ignored) in the project root:

```bash
# Razorpay TEST MODE Credentials (DO NOT USE LIVE KEYS)
RAZORPAY_KEY_ID=rzp_test_yourTestKeyIdHere
RAZORPAY_KEY_SECRET=yourTestKeySecretHere
```

Or set them in your terminal session before starting the server:

```powershell
# PowerShell (Windows)
$env:RAZORPAY_KEY_ID="rzp_test_yourTestKeyIdHere"
$env:RAZORPAY_KEY_SECRET="yourTestKeySecretHere"
npm run dev
```

```bash
# Bash (Linux/macOS)
export RAZORPAY_KEY_ID="rzp_test_yourTestKeyIdHere"
export RAZORPAY_KEY_SECRET="yourTestKeySecretHere"
npm run dev
```

---

## 5. Cryptographic Payment Verification (HMAC-SHA256)

When a test payment occurs, Razorpay sends payment parameters back to the application. GrowthOS **never trusts client-reported payment events**.

The server validates payment authenticity using Razorpay's documented HMAC-SHA256 signature verification:

$$\text{payload} = \text{payment\_link\_id} \mathbin{\Vert} \text{"|"} \mathbin{\Vert} \text{payment\_id}$$

$$\text{expected\_signature} = \operatorname{HMAC-SHA256}(\text{payload}, \text{RAZORPAY\_KEY\_SECRET})$$

$$\operatorname{crypto.timingSafeEqual}(\text{signatureBuffer}, \text{expectedBuffer})$$

* If the signature matches: The transaction is confirmed authentic, recorded with `verificationStatus: "verified"`, and attributed to **Actual Test Revenue Captured**.
* If the signature is tampered or invalid: The payment is rejected with an audit error and no revenue is attributed.

---

## 6. How to Reproduce the Demo

### Scenario A: Running Without Credentials (Demo Mode)
1. Start the application: `npm run dev`.
2. Open `http://localhost:8443`.
3. Go to **Opportunities** → **Running Shoes → Running Socks** → click **Investigate Opportunity**.
4. Click **Create Campaign** → proceed through Steps 1, 2, and 3.
5. In **Step 4 (Review & Launch)**:
   * Notice the Razorpay Integration badge displays **Not configured (Demo Mode)**.
   * Notice the AI Pre-Launch Checks display `Merchant approval pending`.
   * Check the **Merchant Authorization Gate** checkbox.
   * Click **Launch Campaign (Razorpay Test Mode)**.
   * **Result**: The safety gate safely blocks execution with:
     > *"Action blocked — no money movement occurred. Razorpay Test Mode credentials are not configured."*
   * The AI audit log records `action blocked by safety gate`.

### Scenario B: Running With Test Mode Credentials
1. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in your environment.
2. Open `http://localhost:8443` and navigate to Step 4.
3. Notice the Razorpay badge displays **Connected (Test Mode)** with your key prefix.
4. Authorize the campaign and click **Launch Campaign**.
5. **Result**:
   * GrowthOS creates a real Razorpay Test Mode Payment Link (`plink_test_...`).
   * The campaign is marked live.
   * Use the **Sandbox Payment Simulator** button on the launched screen to trigger an HMAC-SHA256 verified payment.
   * Click **View Results** to see the payment in the **Razorpay Test Mode Verified Transactions** table, contributing to **Actual Test Revenue Captured**.

---

## 7. Automated Test Suite

Run the full automated test suite anytime:

```bash
npm run test:razorpay
```

Or run all project tests:

```bash
npm test
```
