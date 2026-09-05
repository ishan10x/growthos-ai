/**
 * GrowthOS — Razorpay Test Mode Domain Types
 * Strict Test Mode Only integration models
 */

export type RazorpayIntegrationStatus = "Connected" | "Not configured" | "Error"

export type ApprovalState = "draft" | "pending_approval" | "approved" | "validated" | "executing" | "succeeded" | "failed"

export interface RazorpayStatusResponse {
  status: RazorpayIntegrationStatus
  mode: "test"
  keyIdPrefix: string | null
  message?: string
}

export interface SafetyValidationResult {
  passed: boolean
  errors: string[]
  checkedAt: string
  bounds: {
    minPrice: number
    maxPrice: number
    maxAudience: number
    currency: "INR"
  }
}

export interface ReferenceIdValidationResult {
  valid: boolean
  referenceId: string
  length: number
  error?: string
}

export interface CreatePaymentLinkRequest {
  campaignId: string
  campaignName: string
  bundlePrice: number
  currency?: "INR"
  targetAudienceCount: number
  merchantApproved: boolean
  idempotencyKey: string
  description?: string
  referenceId?: string
}

export interface TestPaymentLink {
  paymentLinkId: string
  shortUrl: string
  amount: number
  currency: "INR"
  status: "created" | "paid" | "partially_paid" | "expired" | "cancelled"
  campaignId: string
  referenceId?: string
  idempotencyKey: string
  createdAt: string
  testMode: true
}

export interface CreatePaymentLinkResponse {
  success: boolean
  state: ApprovalState
  paymentLink?: TestPaymentLink
  duplicatePrevented?: boolean
  error?: string
  reason?: "missing_approval" | "invalid_price" | "invalid_audience" | "invalid_currency" | "invalid_reference_id" | "missing_credentials" | "live_keys_forbidden" | "api_error" | "state_error"
}

export interface VerifyPaymentRequest {
  razorpay_payment_id: string
  razorpay_payment_link_id: string
  razorpay_payment_link_reference_id?: string
  razorpay_payment_link_status?: string
  razorpay_signature: string
  campaignId: string
  amount?: number
}

export interface VerifyPaymentResponse {
  verified: boolean
  paymentId?: string
  paymentLinkId?: string
  campaignId?: string
  amount?: number
  currency?: "INR"
  status?: string
  timestamp?: string
  error?: string
}

export interface CampaignPaymentRecord {
  campaignId: string
  paymentLinkId: string
  paymentId: string
  amount: number
  currency: "INR"
  status: "captured" | "failed"
  timestamp: string
  verificationStatus: "verified" | "failed" | "unverified"
  testMode: true
}

export interface CampaignExecutionResult {
  campaignId: string
  campaignName: string
  expectedIncrementalRevenue: number
  targetAudience: number
  verifiedPaymentCount: number
  verifiedTestRevenue: number
  paymentLinkId: string | null
  paymentIds: string[]
  lastPaymentAt: string | null
  verificationStatus: "verified" | "failed" | "unverified" | "none"
  testMode: true
}

export interface CampaignResultModel extends CampaignExecutionResult {
  actualTestRevenueCaptured: number
  payments: CampaignPaymentRecord[]
}
