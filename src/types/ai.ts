import type { Page } from "./index"
import type { CrossSellOpportunity } from "./dataFoundation"

export interface OpportunityExplanation {
  summary: string
  evidence: string[]
  reasoning: string
  caveats: string[]
  recommendation: string
}

export interface CampaignRecommendation {
  campaignName: string
  campaignType: "cross-sell" | "upsell" | "bundle"
  targetAudience: string
  offerDescription: string
  suggestedBundlePrice: number
  channels: string[]
  headline: string
  body: string
  expectedGoal: string
  rationale: string
}

export interface MerchantQueryMetric {
  label: string
  value: string | number
}

export interface MerchantQueryResponse {
  answer: string
  queryType: "opportunity" | "audience" | "revenue" | "bundle" | "explanation" | "unsupported"
  relevantMetrics?: MerchantQueryMetric[]
  suggestedAction?: {
    label: string
    page: Page
  }
  source: "verified_engine" | "ai_reasoning"
  confidenceScore?: number
}

export interface AIActivityEvent {
  id: string
  time: string
  type: "opportunity" | "analysis" | "recommendation" | "pending" | "result" | "fallback" | "error"
  title: string
  detail: string
  meta: string
  status: "completed" | "pending" | "success" | "warning" | "error"
  model?: string
  confidencePercent?: number
  opportunityId?: string
}

export interface MerchantQueryContext {
  primaryOpportunity?: CrossSellOpportunity
  allOpportunities?: CrossSellOpportunity[]
  selectedOpportunityId?: string
}

export interface AIProvider {
  name: string
  generateOpportunityExplanation(
    opportunity: CrossSellOpportunity,
  ): Promise<OpportunityExplanation>
  generateCampaignRecommendation(
    opportunity: CrossSellOpportunity,
  ): Promise<CampaignRecommendation>
  answerMerchantQuery(
    query: string,
    context?: MerchantQueryContext,
  ): Promise<MerchantQueryResponse>
}
