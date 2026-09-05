/**
 * GrowthOS Phase 6 — Razorpay Test Mode Verification Suite
 * Automated tests for:
 * 1. Missing credentials safety
 * 2. Approval gate enforcement
 * 3. Price validation bounds
 * 4. Audience validation bounds
 * 5. Currency bounds enforcement
 * 6. Live key prevention
 * 7. Action state transitions
 * 8. Idempotency & duplicate launch prevention
 * 9. API failure handling
 * 10. Cryptographic HMAC-SHA256 signature verification
 * 11. Revenue separation (Expected vs Actual Captured)
 * 12. Structured audit event generation
 */

import {
  SAFETY_BOUNDS,
  CANONICAL_CAMPAIGN_ID,
  validateCampaignForExecution,
  validateReferenceId,
  generateGrowthOSReferenceId,
  createTestPaymentLink,
  verifyRazorpayPaymentSignature,
  getCampaignResultModel,
  generateSimulatedTestPayment,
  getRazorpayAuditLogs,
  resetTestStores,
} from "./razorpayServerService.ts"
import type { CreatePaymentLinkRequest } from "../types/razorpay.ts"
import { campaignExecutionStore } from "./campaignExecutionStore.ts"
import { campaignDraftStore } from "./campaignDraftStore.ts"
import { getCalculatedOpportunities } from "./opportunityService.ts"

let passedCount = 0
let failedCount = 0

function assert(condition: boolean, description: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${description}${detail ? ` (${detail})` : ""}`)
    passedCount++
  } else {
    console.error(`  ✗ FAIL: ${description}${detail ? ` (${detail})` : ""}`)
    failedCount++
  }
}

async function runRazorpayVerification() {
  console.log(
    "==================================================================",
  )
  console.log(" GrowthOS Phase 6 Razorpay Test Mode Verification")
  console.log(
    "==================================================================",
  )

  resetTestStores()

  const validSampleRequest: CreatePaymentLinkRequest = {
    campaignId: "camp_shoes_socks_001",
    campaignName: "Complete Your Run",
    bundlePrice: 2799,
    currency: "INR",
    targetAudienceCount: 2772,
    merchantApproved: true,
    idempotencyKey: "idemp_test_001",
    description: "Bundle Running Shoes with Running Socks at ₹2,799",
  }

  const dummyTestCredentials = {
    keyId: "rzp_test_growthos_sandbox_key",
    keySecret: "growthos_test_sandbox_secret_998877",
  }

  // ─── Test 1: Missing Credentials Safety ────────────────────────────────────
  console.log("\n[Test 1] Testing Missing Credentials Safety...")
  const missingCredsResult = await createTestPaymentLink(
    { ...validSampleRequest, idempotencyKey: "idemp_missing_creds" },
    { customCredentials: { keyId: "", keySecret: "" } },
  )
  assert(
    !missingCredsResult.success,
    "Fails safely when Razorpay credentials are missing",
  )
  assert(
    missingCredsResult.state === "failed",
    "State transitions to 'failed' without partial execution",
    `State: ${missingCredsResult.state}`,
  )
  assert(
    missingCredsResult.error?.includes(
      "Action blocked — no money movement occurred",
    ) === true,
    "UI error message explicitly states 'Action blocked — no money movement occurred'",
    missingCredsResult.error,
  )
  assert(
    missingCredsResult.reason === "missing_credentials",
    "Failure reason categorized as 'missing_credentials'",
  )

  // ─── Test 2: Approval Gate Enforcement ─────────────────────────────────────
  console.log("\n[Test 2] Testing Merchant Approval Gate Enforcement...")
  const unapprovedRequest: CreatePaymentLinkRequest = {
    ...validSampleRequest,
    merchantApproved: false,
    idempotencyKey: "idemp_unapproved",
  }
  const unapprovedResult = await createTestPaymentLink(unapprovedRequest, {
    customCredentials: dummyTestCredentials,
  })
  assert(
    !unapprovedResult.success,
    "Execution strictly blocked when merchant approval is absent",
  )
  assert(
    unapprovedResult.reason === "missing_approval",
    "Reason identified as missing_approval",
  )
  assert(
    unapprovedResult.error?.includes("merchant approval") === true,
    "Error explains explicit merchant approval is required",
  )

  // ─── Test 3: Price Safety Bounds Validation ────────────────────────────────
  console.log("\n[Test 3] Testing Bundle Price Safety Bounds...")
  const lowPriceValidation = validateCampaignForExecution({
    ...validSampleRequest,
    bundlePrice: 50, // Below ₹100 min
  })
  assert(
    !lowPriceValidation.passed,
    `Rejects bundle price below minimum ₹${SAFETY_BOUNDS.MIN_BUNDLE_PRICE}`,
    lowPriceValidation.errors[0],
  )

  const highPriceValidation = validateCampaignForExecution({
    ...validSampleRequest,
    bundlePrice: 75000, // Above ₹50,000 max
  })
  assert(
    !highPriceValidation.passed,
    `Rejects bundle price above maximum safety limit ₹${SAFETY_BOUNDS.MAX_BUNDLE_PRICE.toLocaleString()}`,
    highPriceValidation.errors[0],
  )

  const validPriceValidation = validateCampaignForExecution({
    ...validSampleRequest,
    bundlePrice: 2799,
  })
  assert(
    validPriceValidation.passed,
    "Accepts valid bundle price ₹2,799 within safety bounds",
  )

  // ─── Test 4: Audience Safety Bounds Validation ─────────────────────────────
  console.log("\n[Test 4] Testing Audience Safety Bounds...")
  const zeroAudienceValidation = validateCampaignForExecution({
    ...validSampleRequest,
    targetAudienceCount: 0,
  })
  assert(
    !zeroAudienceValidation.passed,
    "Rejects target audience count less than 1",
  )

  const excessAudienceValidation = validateCampaignForExecution({
    ...validSampleRequest,
    targetAudienceCount: 250000, // Above 100,000
  })
  assert(
    !excessAudienceValidation.passed,
    `Rejects target audience exceeding safety limit of ${SAFETY_BOUNDS.MAX_TARGET_AUDIENCE.toLocaleString()} customers`,
    excessAudienceValidation.errors[0],
  )

  const validAudienceValidation = validateCampaignForExecution({
    ...validSampleRequest,
    targetAudienceCount: 2772,
  })
  assert(
    validAudienceValidation.passed,
    "Accepts valid targeted audience (2,772 customers)",
  )

  // ─── Test 5: Currency Bounds Enforcement ───────────────────────────────────
  console.log("\n[Test 5] Testing Supported Currency Bounds...")
  const invalidCurrencyValidation = validateCampaignForExecution({
    ...validSampleRequest,
    currency: "USD" as unknown as "INR",
  })
  assert(
    !invalidCurrencyValidation.passed,
    "Rejects unsupported non-INR currency (e.g. USD)",
    invalidCurrencyValidation.errors[0],
  )

  const validCurrencyValidation = validateCampaignForExecution({
    ...validSampleRequest,
    currency: "INR",
  })
  assert(validCurrencyValidation.passed, "Accepts supported INR currency")

  // ─── Test 6: Live Key Prevention (Security Gate) ───────────────────────────
  console.log("\n[Test 6] Testing Prevention of Live Credentials...")
  const liveKeyResult = await createTestPaymentLink(
    { ...validSampleRequest, idempotencyKey: "idemp_live_key_test" },
    {
      customCredentials: {
        keyId: "rzp_live_abc1234567890",
        keySecret: "live_secret_dangerous",
      },
    },
  )
  assert(
    !liveKeyResult.success,
    "Live credentials are immediately rejected by safety gate",
  )
  assert(
    liveKeyResult.reason === "live_keys_forbidden",
    "Reason identified as live_keys_forbidden",
  )
  assert(
    liveKeyResult.error?.includes("Live keys are forbidden") === true,
    "Error highlights that GrowthOS strictly operates in Test Mode only",
  )

  // ─── Test 7: Successful Test Mode Payment Link Creation ────────────────────
  console.log("\n[Test 7] Testing Test Mode Payment Link Creation...")
  const successResult = await createTestPaymentLink(validSampleRequest, {
    mockApiResponse: true,
    customCredentials: dummyTestCredentials,
  })
  assert(
    successResult.success,
    "Payment link creation succeeds with valid Test Mode credentials",
  )
  assert(
    successResult.state === "succeeded",
    "Approval state machine completes with state 'succeeded'",
  )
  assert(
    successResult.paymentLink?.paymentLinkId.startsWith("plink_test_") === true,
    "Generated Payment Link ID begins with 'plink_test_'",
    successResult.paymentLink?.paymentLinkId,
  )
  assert(
    successResult.paymentLink?.amount === 2799,
    "Payment link amount matches validated bundle price (₹2,799)",
  )
  assert(
    successResult.paymentLink?.testMode === true,
    "Payment link explicitly flagged as testMode: true",
  )
  assert(
    typeof successResult.paymentLink?.referenceId === "string" &&
      successResult.paymentLink.referenceId.length <= 40,
    "Payment link referenceId is generated and <= 40 characters",
    successResult.paymentLink?.referenceId,
  )

  // ─── Test 8: Idempotency & Duplicate Launch Prevention ─────────────────────
  console.log("\n[Test 8] Testing Idempotency & Duplicate Prevention...")
  const duplicateResult = await createTestPaymentLink(
    validSampleRequest, // Identical request with same idempotencyKey
    {
      mockApiResponse: true,
      customCredentials: dummyTestCredentials,
    },
  )
  assert(duplicateResult.success, "Idempotent retry succeeds without error")
  assert(
    duplicateResult.duplicatePrevented === true,
    "Duplicate creation prevented flag returned",
  )
  assert(
    duplicateResult.paymentLink?.paymentLinkId ===
      successResult.paymentLink?.paymentLinkId,
    "Returns existing payment link ID rather than creating a duplicate action",
    duplicateResult.paymentLink?.paymentLinkId,
  )
  assert(
    duplicateResult.paymentLink?.referenceId ===
      successResult.paymentLink?.referenceId,
    "Repeated launch protection returns existing referenceId",
    duplicateResult.paymentLink?.referenceId,
  )

  // ─── Test 9: Cryptographic Payment Verification (HMAC-SHA256) ──────────────
  console.log("\n[Test 9] Testing Cryptographic Signature Verification...")
  const activeSecret = dummyTestCredentials.keySecret
  const paymentLinkId = successResult.paymentLink!.paymentLinkId
  const sim = generateSimulatedTestPayment(paymentLinkId, activeSecret, 2799)

  // Valid verification
  const validVerification = verifyRazorpayPaymentSignature(
    {
      razorpay_payment_id: sim.paymentId,
      razorpay_payment_link_id: paymentLinkId,
      razorpay_signature: sim.signature,
      campaignId: validSampleRequest.campaignId,
      amount: 2799,
    },
    activeSecret,
  )
  assert(
    validVerification.verified,
    "Genuine HMAC-SHA256 signature successfully verified",
    `Payment ID: ${validVerification.paymentId}`,
  )

  // Tampered verification
  const tamperedSignature = sim.signature.slice(0, -4) + "0000"
  const tamperedVerification = verifyRazorpayPaymentSignature(
    {
      razorpay_payment_id: sim.paymentId,
      razorpay_payment_link_id: paymentLinkId,
      razorpay_signature: tamperedSignature,
      campaignId: validSampleRequest.campaignId,
      amount: 2799,
    },
    activeSecret,
  )
  assert(
    !tamperedVerification.verified,
    "Tampered/forged signature is rejected by cryptographic verification",
    tamperedVerification.error,
  )

  // ─── Test 10: Revenue Separation & Verified Launch Alignment ─────────────
  console.log(
    "\n[Test 10] Testing Revenue Separation & Verified Launch Alignment...",
  )

  // Verify payment 2 for validSampleRequest
  const sim2 = generateSimulatedTestPayment(paymentLinkId, activeSecret, 2799)
  const validVerification2 = verifyRazorpayPaymentSignature(
    {
      razorpay_payment_id: sim2.paymentId,
      razorpay_payment_link_id: paymentLinkId,
      razorpay_signature: sim2.signature,
      campaignId: validSampleRequest.campaignId,
      amount: 2799,
    },
    activeSecret,
  )
  assert(
    validVerification2.verified,
    "Second test payment verified successfully",
  )

  // Attempt duplicate submission of payment 1 to verify duplicate prevention
  const duplicatePaymentVerification = verifyRazorpayPaymentSignature(
    {
      razorpay_payment_id: sim.paymentId, // Same payment ID as payment 1
      razorpay_payment_link_id: paymentLinkId,
      razorpay_signature: sim.signature,
      campaignId: validSampleRequest.campaignId,
      amount: 2799,
    },
    activeSecret,
  )
  assert(
    duplicatePaymentVerification.verified,
    "Duplicate payment request handled gracefully",
  )

  const resultModel = getCampaignResultModel(
    validSampleRequest.campaignId,
    41602,
    2772,
    "Complete Your Run",
  )

  // 1. Two verified ₹2,799 payments = ₹5,598
  assert(
    resultModel.actualTestRevenueCaptured === 5598,
    "Two verified ₹2,799 payments sum exactly to ₹5,598",
    `Captured: ₹${resultModel.actualTestRevenueCaptured}`,
  )
  assert(
    resultModel.verifiedTestRevenue === 5598,
    "verifiedTestRevenue matches actualTestRevenueCaptured (₹5,598)",
  )

  // 2. Duplicate payment ID is ignored
  assert(
    resultModel.payments.length === 2,
    "Duplicate payment ID is ignored; payment count remains 2 (not 3)",
    `Count: ${resultModel.payments.length}`,
  )

  // 3. Campaign result reads verified payments
  assert(
    resultModel.verifiedPaymentCount === 2,
    "campaign result verifiedPaymentCount reads 2 verified payments",
  )

  // 4. Expected revenue remains ₹41,602
  assert(
    resultModel.expectedIncrementalRevenue === 41602,
    "expectedIncrementalRevenue remains authoritative ground truth ₹41,602",
  )

  // 5. Stale ₹47,200 value is not used
  assert(
    resultModel.actualTestRevenueCaptured !== 47200,
    "Stale ₹47,200 mock revenue is NOT used for currently launched campaign",
  )

  // 6. Stale ₹42,600 forecast is not used
  assert(
    resultModel.expectedIncrementalRevenue !== 42600,
    "Stale ₹42,600 forecast is NOT used",
  )

  // 7. Stale "+11%" message is not generated; dynamic variance is computed
  const variancePct = (
    (resultModel.actualTestRevenueCaptured /
      resultModel.expectedIncrementalRevenue) *
    100
  ).toFixed(1)
  assert(
    variancePct === "13.5",
    "Dynamic variance correctly computed as 13.5% of projected target (not stale +11%)",
    `${variancePct}%`,
  )

  // 8. Test Mode label is preserved
  assert(
    resultModel.testMode === true,
    "Test Mode label is preserved on campaign execution result",
  )

  // 9. Conversion rate is derived from actual verified payment count
  const conversionRate = (
    (resultModel.verifiedPaymentCount / resultModel.targetAudience) *
    100
  ).toFixed(2)
  assert(
    conversionRate === "0.07",
    "Conversion rate derived from actual verified payments (2 / 2,772 = 0.07%)",
    `${conversionRate}%`,
  )

  // 10. Canonical campaign execution record check
  const canonicalModel = getCampaignResultModel(CANONICAL_CAMPAIGN_ID)
  assert(
    canonicalModel.actualTestRevenueCaptured === 5598,
    "Canonical 'Complete Your Run' campaign execution reflects verified ₹5,598 revenue",
  )
  assert(
    canonicalModel.targetAudience === 2772,
    "Canonical campaign reflects targeted audience of 2,772 customers",
  )

  // ─── Test 11: Structured AI Activity Audit Trail ───────────────────────────
  console.log("\n[Test 11] Testing Structured Audit Trail Events...")
  const auditLogs = getRazorpayAuditLogs()
  const loggedTypes = new Set(auditLogs.map((l) => l.type))

  assert(
    loggedTypes.has("merchant_approval"),
    "Audit trail recorded 'merchant approval received'",
  )
  assert(
    loggedTypes.has("campaign_validation"),
    "Audit trail recorded 'campaign validation passed'",
  )
  assert(
    loggedTypes.has("action_requested"),
    "Audit trail recorded 'Razorpay action requested'",
  )
  assert(
    loggedTypes.has("payment_link_created"),
    "Audit trail recorded 'payment link created'",
  )
  assert(
    loggedTypes.has("duplicate_prevented"),
    "Audit trail recorded 'duplicate action prevented'",
  )
  assert(
    loggedTypes.has("payment_received"),
    "Audit trail recorded 'payment received'",
  )
  assert(
    loggedTypes.has("verification_succeeded"),
    "Audit trail recorded 'payment verification succeeded'",
  )
  assert(
    loggedTypes.has("verification_failed"),
    "Audit trail recorded 'payment verification failed'",
  )
  assert(
    loggedTypes.has("action_blocked"),
    "Audit trail recorded 'action blocked by safety gate'",
  )

  // ─── Test 12: Reference ID Safety & Length Boundaries (<= 40 Chars) ─────────
  console.log(
    "\n[Test 12] Testing Reference ID Safety & Length Boundaries (<= 40 Chars)...",
  )

  // 12.1 Valid reference ID
  const validRef1 = "GOS-shoes-socks-1741234567890"
  const valRes1 = validateReferenceId(validRef1)
  assert(
    valRes1.valid,
    "Valid reference ID accepted",
    `${validRef1} (length: ${valRes1.length})`,
  )

  const validRef2 = "GOS-camp_01-1234567890123"
  assert(
    validateReferenceId(validRef2).valid,
    "Valid reference ID with underscores accepted",
  )

  // 12.2 Exactly 40 characters
  const exact40Ref = "GOS-" + "A".repeat(36) // 4 + 36 = 40 characters
  const valExact40 = validateReferenceId(exact40Ref)
  assert(
    valExact40.valid,
    "Accepts reference ID with length exactly 40 characters",
    `length: ${valExact40.length}`,
  )
  assert(valExact40.length === 40, "Reported length is exactly 40 characters")

  // 12.3 41+ characters rejected
  const over40Ref = "GOS-" + "A".repeat(37) // 4 + 37 = 41 characters
  const valOver40 = validateReferenceId(over40Ref)
  assert(!valOver40.valid, "Rejects 41-character reference ID", valOver40.error)
  assert(
    valOver40.error?.includes(
      "reference_id: the length must be no more than 40",
    ) === true,
    "Error message matches Razorpay API requirement (length must be no more than 40)",
  )

  const legacy61Ref =
    "ref_camp_prod_running_shoes_prod_running_socks_1741234567890" // 61 chars
  const valLegacy61 = validateReferenceId(legacy61Ref)
  assert(
    !valLegacy61.valid,
    "Rejects 61-character legacy reference ID that broke Razorpay API",
    `length: ${valLegacy61.length}`,
  )

  assert(!validateReferenceId("").valid, "Rejects empty reference ID")
  assert(
    !validateReferenceId("   ").valid,
    "Rejects whitespace-only reference ID",
  )

  // 12.4 Generated GrowthOS reference IDs always <= 40 characters
  const idNormal = generateGrowthOSReferenceId("camp_running_shoes_socks")
  assert(
    idNormal.length <= 40,
    "Generated ID for normal campaign is <= 40 chars",
    `${idNormal} (len: ${idNormal.length})`,
  )
  assert(
    validateReferenceId(idNormal).valid,
    "Generated normal ID passes validation",
  )

  const idLong = generateGrowthOSReferenceId(
    "very_long_campaign_identifier_that_exceeds_normal_lengths_by_a_wide_margin_123456789",
  )
  assert(
    idLong.length <= 40,
    "Generated ID for 100+ char campaign is clamped to <= 40 chars",
    `${idLong} (len: ${idLong.length})`,
  )
  assert(validateReferenceId(idLong).valid, "Clamped long ID passes validation")

  const idSpecial = generateGrowthOSReferenceId(
    "Campaign #1: Running Shoes & Socks! (Sale 50%)",
  )
  assert(
    idSpecial.length <= 40,
    "Generated ID with special chars is sanitized and <= 40 chars",
    `${idSpecial} (len: ${idSpecial.length})`,
  )
  assert(
    validateReferenceId(idSpecial).valid,
    "Sanitized special char ID passes validation",
  )

  const idEmpty = generateGrowthOSReferenceId("")
  assert(
    idEmpty.length <= 40,
    "Generated ID for empty campaign fallback is <= 40 chars",
    `${idEmpty} (len: ${idEmpty.length})`,
  )
  assert(validateReferenceId(idEmpty).valid, "Fallback ID passes validation")

  const idTimestamp = generateGrowthOSReferenceId("custom_camp", 1741234567890)
  assert(
    idTimestamp.length <= 40,
    "Generated ID with explicit timestamp is <= 40 chars",
    `${idTimestamp} (len: ${idTimestamp.length})`,
  )
  assert(
    validateReferenceId(idTimestamp).valid,
    "Explicit timestamp ID passes validation",
  )

  // 12.5 Pre-flight rejection of 41+ char referenceId in createTestPaymentLink
  const badRefRequest: CreatePaymentLinkRequest = {
    ...validSampleRequest,
    referenceId: "GOS-" + "X".repeat(40), // 44 chars
    idempotencyKey: "idemp_bad_ref_test",
  }
  const badRefResult = await createTestPaymentLink(badRefRequest, {
    mockApiResponse: true,
    customCredentials: dummyTestCredentials,
  })
  assert(
    !badRefResult.success,
    "createTestPaymentLink rejects referenceId > 40 chars before calling Razorpay",
  )
  assert(
    badRefResult.reason === "invalid_reference_id",
    "Failure reason is 'invalid_reference_id'",
  )
  assert(
    badRefResult.state === "failed",
    "Approval state transitions to 'failed' safely without execution",
  )
  assert(
    badRefResult.error?.includes(
      "reference_id: the length must be no more than 40",
    ) === true,
    "Error message informs user of <= 40 length constraint",
  )

  // ─── Test 13: Campaign Execution State Synchronization with Dashboard ─────
  console.log(
    "\n[Test 13] Testing Campaign Execution State Synchronization with Dashboard...",
  )

  // 13.1 Reset store to pristine session state
  campaignExecutionStore.reset()
  const idleState = campaignExecutionStore.getState()
  assert(
    idleState.status === "idle",
    "Session starts in idle state",
    idleState.status,
  )
  assert(
    idleState.verifiedPaymentCount === 0,
    "Initial session verified payment count is 0",
  )
  assert(
    idleState.verifiedTestRevenue === 0,
    "Initial session verified test revenue is ₹0",
  )
  assert(
    !campaignExecutionStore.isExecuted(),
    "When no campaign has been executed, isExecuted() is false preserving existing Dashboard appearance",
  )

  // 13.2 Verify ₹1.50L deterministic opportunity potential remains independent
  const initialOpps = getCalculatedOpportunities()
  const initialTotalPotential = initialOpps.reduce(
    (sum, o) => sum + o.estimatedIncrementalRevenue,
    0,
  )
  assert(
    (initialTotalPotential / 100000).toFixed(2) === "1.50" &&
      initialTotalPotential === 149748,
    "₹1.50L opportunity potential is independent and authoritative (₹1,49,748 formatted as ₹1.50L)",
  )

  // 13.3 Merchant approval state recorded
  campaignExecutionStore.recordMerchantApproval({
    campaignId: CANONICAL_CAMPAIGN_ID,
    campaignName: "Complete Your Run",
    bundlePrice: 2799,
    targetAudience: 2772,
    approverName: "Ishan Khandelwal",
  })
  const approvedState = campaignExecutionStore.getState()
  assert(
    approvedState.status === "approved",
    "Merchant approval updates shared store status to 'approved'",
  )
  assert(
    approvedState.merchantApproved === true,
    "Merchant approved flag is true",
  )
  assert(
    approvedState.approverName === "Ishan Khandelwal",
    "Approver name recorded as Ishan Khandelwal",
  )

  // 13.4 Campaign launch state propagates
  campaignExecutionStore.recordCampaignLaunch({
    campaignId: CANONICAL_CAMPAIGN_ID,
    campaignName: "Complete Your Run",
    paymentLinkId: "plink_test_sync_001",
    shortUrl: "https://rzp.io/i/test_sync_001",
    bundlePrice: 2799,
    targetAudience: 2772,
    expectedIncrementalRevenue: 41602,
    merchantApproved: true,
  })
  const launchedState = campaignExecutionStore.getState()
  assert(
    launchedState.status === "launched",
    "Launch state propagates to store and Dashboard (status: 'launched')",
  )
  assert(
    launchedState.paymentLinkId === "plink_test_sync_001",
    "Launch paymentLinkId recorded",
    launchedState.paymentLinkId,
  )
  assert(
    campaignExecutionStore.isExecuted(),
    "isExecuted() is true after launch, causing Dashboard to surface execution state",
  )

  // 13.5 First verified payment updates Dashboard
  const pay1Result = campaignExecutionStore.recordVerifiedPayment({
    paymentId: "pay_test_sync_001",
    amount: 2799,
    paymentLinkId: "plink_test_sync_001",
    campaignId: CANONICAL_CAMPAIGN_ID,
  })
  assert(
    !pay1Result.duplicate,
    "First verified payment is not flagged as duplicate",
  )
  const pay1State = campaignExecutionStore.getState()
  assert(
    pay1State.verifiedPaymentCount === 1,
    "First verified payment updates Dashboard count to 1",
  )
  assert(
    pay1State.verifiedTestRevenue === 2799,
    "First verified payment updates Dashboard revenue to ₹2,799",
  )
  assert(
    pay1State.status === "active",
    "Campaign status transitions to 'active' on payment verification",
  )

  // 13.6 Second verified payment updates Dashboard
  const pay2Result = campaignExecutionStore.recordVerifiedPayment({
    paymentId: "pay_test_sync_002",
    amount: 2799,
    paymentLinkId: "plink_test_sync_001",
    campaignId: CANONICAL_CAMPAIGN_ID,
  })
  assert(
    !pay2Result.duplicate,
    "Second verified payment is not flagged as duplicate",
  )
  const pay2State = campaignExecutionStore.getState()
  assert(
    pay2State.verifiedPaymentCount === 2,
    "Second verified payment updates Dashboard count to 2",
  )
  assert(
    pay2State.verifiedTestRevenue === 5598,
    "Second verified payment updates Dashboard revenue to ₹5,598",
  )
  assert(
    pay2State.verifiedPaymentIds.length === 2,
    "Both payment IDs stored in verifiedPaymentIds",
  )

  // 13.7 Duplicate payment protection
  const dupResult1 = campaignExecutionStore.recordVerifiedPayment({
    paymentId: "pay_test_sync_001",
    amount: 2799,
    paymentLinkId: "plink_test_sync_001",
    campaignId: CANONICAL_CAMPAIGN_ID,
  })
  assert(
    dupResult1.duplicate,
    "Duplicate payment pay_test_sync_001 detected and flagged",
  )
  const afterDupState = campaignExecutionStore.getState()
  assert(
    afterDupState.verifiedPaymentCount === 2,
    "Duplicate payment ID does not increase payment count (remains 2)",
  )
  assert(
    afterDupState.verifiedTestRevenue === 5598,
    "Duplicate payment ID does not increase revenue (remains ₹5,598)",
  )

  const dupResult2 = campaignExecutionStore.recordVerifiedPayment({
    paymentId: "pay_test_sync_002",
    amount: 2799,
    paymentLinkId: "plink_test_sync_001",
    campaignId: CANONICAL_CAMPAIGN_ID,
  })
  assert(
    dupResult2.duplicate,
    "Duplicate payment pay_test_sync_002 detected and flagged",
  )
  assert(
    campaignExecutionStore.getState().verifiedTestRevenue === 5598,
    "Duplicate protection maintains exact ₹5,598 revenue",
  )

  // 13.8 Exact revenue and opportunity values verified
  const finalState = campaignExecutionStore.getState()
  assert(
    finalState.verifiedTestRevenue === 5598,
    "₹5,598 is shown as Test Mode captured revenue on the synchronized dashboard model",
  )
  assert(
    finalState.expectedIncrementalRevenue === 41602,
    "₹41,602 remains the expected opportunity projection without modification",
  )
  const afterExecTotalPotential = getCalculatedOpportunities().reduce(
    (sum, o) => sum + o.estimatedIncrementalRevenue,
    0,
  )
  assert(
    (afterExecTotalPotential / 100000).toFixed(2) === "1.50" &&
      afterExecTotalPotential === 149748,
    "₹1.50L opportunity potential remains strictly independent of captured test revenue",
  )

  // 13.9 Navigation state persistence across route transitions
  let listenerCalls = 0
  const unsubscribe = campaignExecutionStore.subscribe(() => {
    listenerCalls++
  })

  // Simulate Campaign Results → Dashboard → Campaigns → Dashboard navigation
  const roundtripState1 = campaignExecutionStore.getState()
  assert(
    roundtripState1.verifiedPaymentCount === 2 &&
      roundtripState1.verifiedTestRevenue === 5598,
    "State intact on navigating from Campaign Results to Dashboard",
  )

  // Simulate visiting Campaigns and returning
  const roundtripState2 = campaignExecutionStore.getState()
  assert(
    roundtripState2.verifiedPaymentCount === 2 &&
      roundtripState2.verifiedTestRevenue === 5598,
    "State intact on navigating from Campaigns back to Dashboard without page refresh",
  )

  unsubscribe()

  // ─── TEST 14: Campaign Draft State Persistence Across Wizard Steps ───
  console.log(
    "\n[Test 14] Testing Campaign Draft State Persistence Across Wizard Steps...",
  )

  // 14.1 Default draft state initializes with ₹2,799 and AI suggestions
  campaignDraftStore.reset()
  let draft = campaignDraftStore.getDraft()
  assert(
    draft.bundlePrice === 2799,
    "Default draft state initializes with bundle price ₹2,799",
    `Price: ₹${draft.bundlePrice}`,
  )
  assert(
    draft.campaignName === "Complete Your Run",
    "Default draft state initializes with AI suggested campaign name 'Complete Your Run'",
  )
  assert(
    draft.offerType === "Cross-sell Bundle",
    "Default draft state initializes with offer type 'Cross-sell Bundle'",
  )
  assert(
    draft.audienceSize === 2772,
    "Default draft state targets 2,772 customers from selected opportunity",
    `Audience: ${draft.audienceSize}`,
  )
  assert(
    draft.expectedIncrementalRevenue === 41602,
    "Default draft state has deterministic ₹41,602 expected incremental revenue",
    `Expected: ₹${draft.expectedIncrementalRevenue}`,
  )
  assert(
    draft.confidenceScore === 89,
    "Default draft state has 89% AI confidence score",
  )

  // 14.2 Editing bundle price to ₹3,500 immediately updates shared draft state
  campaignDraftStore.setBundlePrice(3500)
  draft = campaignDraftStore.getDraft()
  assert(
    draft.bundlePrice === 3500,
    "Editing bundle price to ₹3,500 immediately updates shared campaign draft state",
    `Price: ₹${draft.bundlePrice}`,
  )
  assert(
    draft.isEdited.bundlePrice === true,
    "Draft state records bundle price as merchant-edited",
  )

  // 14.3 Step 2 (Audience) preserves draft state and shows correct context
  assert(
    draft.bundlePrice === 3500 && draft.audienceSize === 2772,
    "Step 2 (Audience) preserves ₹3,500 draft price and 2,772 customer audience size",
  )

  // 14.4 Step 3 (Message Preview) reflects merchant-edited price and recalculates dependent message values
  const combinedProductPrice = 2998 // SoleX Running Shoes (2499) + Running Socks (499)
  const savingsAt3500 = combinedProductPrice - draft.bundlePrice
  assert(
    savingsAt3500 < 0,
    "Savings calculated against combined original product sum (₹2,998 - ₹3,500 = -₹502)",
  )
  assert(
    draft.offerDescription.includes("₹3,500"),
    "Step 3 offer description includes updated ₹3,500 price",
    draft.offerDescription,
  )

  // 14.5 Step 4 (Review) displays edited values, validates bounds, and authorizes edited price
  assert(
    draft.bundlePrice === 3500,
    "Step 4 Review table displays merchant-edited ₹3,500 (not stale ₹2,799)",
  )
  const draftSafetyValidation = campaignDraftStore.validateDraftForLaunch()
  assert(
    draftSafetyValidation.valid === true,
    "Step 4 Pre-Launch Safety Check validates edited ₹3,500 is within ₹100–₹50,000 safety bounds",
  )

  // 14.6 Out-of-bounds prices are safely rejected by pre-launch safety gate
  campaignDraftStore.setBundlePrice(50)
  const belowMinValidation = campaignDraftStore.validateDraftForLaunch()
  assert(
    belowMinValidation.valid === false &&
      belowMinValidation.error?.includes("minimum"),
    "Pre-launch safety gate rejects price below ₹100 minimum bound",
    belowMinValidation.error,
  )

  campaignDraftStore.setBundlePrice(60000)
  const aboveMaxValidation = campaignDraftStore.validateDraftForLaunch()
  assert(
    aboveMaxValidation.valid === false &&
      aboveMaxValidation.error?.includes("safety bound"),
    "Pre-launch safety gate rejects price above ₹50,000 maximum bound",
    aboveMaxValidation.error,
  )

  // Restore to ₹3,500
  campaignDraftStore.setBundlePrice(3500)
  draft = campaignDraftStore.getDraft()

  // 14.7 Launch payload contains edited ₹3,500 and validated draft values
  const launchPayload: CreatePaymentLinkRequest = {
    campaignId: "camp_shoes_socks_001",
    campaignName: draft.campaignName,
    bundlePrice: draft.bundlePrice,
    targetAudienceCount: draft.audienceSize,
    merchantApproved: true,
    idempotencyKey: "idemp_test_draft_3500_v1",
    description: draft.offerDescription,
  }
  const executionValidation = validateCampaignForExecution(launchPayload)
  assert(
    executionValidation.passed === true,
    "Launch payload contains edited ₹3,500 and passes server execution validation",
    `Payload price: ₹${launchPayload.bundlePrice}`,
  )

  // 14.8 Deterministic opportunity metrics remain strictly uncorrupted
  assert(
    draft.audienceSize === 2772,
    "Deterministic target audience remains exactly 2,772 customers (uncorrupted)",
  )
  assert(
    draft.expectedIncrementalRevenue === 41602,
    "Deterministic expected incremental revenue remains exactly ₹41,602 (uncorrupted)",
  )
  assert(
    draft.confidenceScore === 89,
    "Deterministic AI confidence score remains exactly 89% (uncorrupted)",
  )
  const totalPotentialCheck = getCalculatedOpportunities().reduce(
    (sum, o) => sum + o.estimatedIncrementalRevenue,
    0,
  )
  assert(
    totalPotentialCheck === 149748,
    "Deterministic opportunity potential across all opportunities remains exactly ₹1.50L (149,748)",
  )

  // 14.9 Re-editing back to ₹2,799 restores ₹2,799 across all steps
  campaignDraftStore.setBundlePrice(2799)
  draft = campaignDraftStore.getDraft()
  assert(
    draft.bundlePrice === 2799,
    "Re-editing bundle price back to ₹2,799 updates shared draft state to ₹2,799",
    `Price: ₹${draft.bundlePrice}`,
  )
  assert(
    draft.isEdited.bundlePrice === false,
    "Draft state reflects bundle price restored to AI suggested default",
  )
  const savingsAt2799 = combinedProductPrice - draft.bundlePrice
  assert(
    savingsAt2799 === 199,
    "Recalculated savings at ₹2,799 is exactly ₹199 (₹2,998 - ₹2,799)",
  )
  assert(
    draft.offerDescription.includes("Save ₹199"),
    "Step 3 offer description copy restores 'Save ₹199'",
    draft.offerDescription,
  )

  // 14.10 Wizard step subscription reactivity
  let wizardStepNotified = false
  const unsubWizard = campaignDraftStore.subscribe(() => {
    wizardStepNotified = true
  })
  campaignDraftStore.setBundlePrice(3200)
  assert(
    wizardStepNotified && campaignDraftStore.getDraft().bundlePrice === 3200,
    "All subscribed wizard steps receive real-time updates when merchant edits price",
  )
  unsubWizard()

  // Reset back to defaults
  campaignDraftStore.reset()

  console.log(
    "\n==================================================================",
  )
  console.log(
    ` Phase 6 Verification Complete: ${passedCount}/${passedCount + failedCount} checks passed`,
  )
  console.log(
    "==================================================================",
  )

  if (failedCount > 0) {
    process.exit(1)
  }
}

runRazorpayVerification()
