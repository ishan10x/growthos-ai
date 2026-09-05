import type {
  AIActivityEvent,
  AIProvider,
  CampaignRecommendation,
  MerchantQueryContext,
  MerchantQueryResponse,
  OpportunityExplanation,
} from "../types/ai.ts"
import type { CrossSellOpportunity } from "../types/dataFoundation.ts"
import {
  getCalculatedOpportunities,
  getPrimaryOpportunity,
} from "./opportunityService.ts"
import { aiActivityLogs } from "../data/mockData.ts"

// ─── Deterministic AI Provider (Zero-API Key Fallback) ─────────────────────────

export class DeterministicAIProvider implements AIProvider {
  name = "growthos-deterministic-v1"

  async generateOpportunityExplanation(
    opportunity: CrossSellOpportunity,
  ): Promise<OpportunityExplanation> {
    if (
      !opportunity ||
      !opportunity.sourceProduct ||
      !opportunity.recommendedProduct
    ) {
      throw new Error(
        "Invalid opportunity: missing source or recommended product",
      )
    }

    const sourceName = opportunity.sourceProduct.name
    const recName = opportunity.recommendedProduct.name
    const currentAttachPct = (opportunity.attachRate * 100).toFixed(1)
    const benchmarkAttachPct = Math.round(opportunity.benchmarkAttachRate * 100)
    const gapPct = (opportunity.gap * 100).toFixed(1)
    const eligibleCount =
      opportunity.estimatedEligibleCustomers.toLocaleString()
    const expectedOrders = opportunity.expectedIncrementalOrders
    const revenueStr = `₹${opportunity.estimatedIncrementalRevenue.toLocaleString()}`

    return {
      summary: `Analyzed 18,420 orders for SoleX over the last 90 days. Customers purchasing ${sourceName} have an attach rate of ${currentAttachPct}% for ${recName}, trailing the category benchmark of ${benchmarkAttachPct}% by ${gapPct}pp. Closing this gap activates ${eligibleCount} eligible customers to unlock ~${expectedOrders} incremental orders and ${revenueStr} in revenue.`,
      evidence: [
        `Co-purchase correlation r = 0.74 between ${sourceName} and ${recName} exceeds the 0.50 detection threshold`,
        `SoleX attach rate (${currentAttachPct}%) sits ${gapPct}pp below the sportswear category median (${benchmarkAttachPct}%)`,
        `${eligibleCount} customers purchased ${sourceName} in the last 90 days without buying ${recName}`,
        `Co-purchasers exhibit 2.3× higher customer lifetime value and 41% lower return rates`,
      ],
      reasoning: `Customers purchasing performance ${sourceName.toLowerCase()} exhibit latent intent for compatible ${recName.toLowerCase()} within their first 14–45 days. When no targeted incentive is offered, over 80% of these customers either purchase socks from third-party retailers or defer replacement. A timely bundle offer reactivates high-intent buyers before their intent window lapses.`,
      caveats: [
        `Projection assumes campaign dispatch within the active 45-day post-shoe purchase window`,
        `Bundle discount must not exceed 25% to preserve target margin contributions`,
        `Email and WhatsApp channels must achieve minimum 90% deliverability to capture expected volume`,
      ],
      recommendation: `Launch a targeted multi-channel campaign ("Complete Your Run") offering ${recName} bundled with ${sourceName} at ₹${(opportunity.sourceProduct.price + Math.round(opportunity.recommendedProduct.price * 0.6)).toLocaleString()} to the ${eligibleCount} eligible customers.`,
    }
  }

  generateCampaignRecommendationSync(
    opportunity: CrossSellOpportunity,
  ): CampaignRecommendation {
    if (
      !opportunity ||
      !opportunity.sourceProduct ||
      !opportunity.recommendedProduct
    ) {
      throw new Error(
        "Invalid opportunity: missing source or recommended product",
      )
    }

    const sourcePrice = opportunity.sourceProduct.price
    const recPrice = opportunity.recommendedProduct.price
    // Recommended bundle: source product + accessory discounted (e.g. ₹2,499 + ₹300 = ₹2,799)
    const accessoryDiscounted =
      opportunity.sourceProduct.id === "prod_shoes_running" &&
      opportunity.recommendedProduct.id === "prod_socks_running"
        ? 300
        : Math.round(recPrice * 0.6)
    const bundlePrice = sourcePrice + accessoryDiscounted
    const savings = sourcePrice + recPrice - bundlePrice

    return {
      campaignName: "Complete Your Run",
      campaignType: "bundle",
      targetAudience: `${opportunity.estimatedEligibleCustomers.toLocaleString()} customers who bought ${opportunity.sourceProduct.name} in the last 45 days without buying ${opportunity.recommendedProduct.name}`,
      offerDescription: `Bundle ${opportunity.sourceProduct.name} with ${opportunity.recommendedProduct.name} at ₹${bundlePrice.toLocaleString()} (Save ₹${savings.toLocaleString()})`,
      suggestedBundlePrice: bundlePrice,
      channels: ["Email", "WhatsApp"],
      headline: "Complete Your Run 🏃",
      body: `You recently grabbed a pair of ${opportunity.sourceProduct.name} from us — great choice! Pair them with our performance ${opportunity.recommendedProduct.name.toLowerCase()} for the ultimate comfort and blister protection. Save ₹${savings.toLocaleString()} on your bundle today.`,
      expectedGoal: `Close the attach rate gap from ${(opportunity.attachRate * 100).toFixed(0)}% to 31%, unlocking ~${opportunity.expectedIncrementalOrders} orders and ₹${opportunity.estimatedIncrementalRevenue.toLocaleString()} in incremental revenue.`,
      rationale: `Footwear buyers show peak accessory interest during their active break-in period. A bundled discount removes price resistance and drives immediate basket uplift.`,
    }
  }

  async generateCampaignRecommendation(
    opportunity: CrossSellOpportunity,
  ): Promise<CampaignRecommendation> {
    return this.generateCampaignRecommendationSync(opportunity)
  }

  async answerMerchantQuery(
    query: string,
    context?: MerchantQueryContext,
  ): Promise<MerchantQueryResponse> {
    const q = query.toLowerCase().trim()
    const primary = context?.primaryOpportunity ?? getPrimaryOpportunity()
    const opportunities =
      context?.allOpportunities ?? getCalculatedOpportunities()

    // 1. Biggest Revenue Opportunity
    if (
      q.includes("biggest") ||
      q.includes("top opportunity") ||
      q.includes("most revenue") ||
      q.includes("highest") ||
      q.includes("best opportunity")
    ) {
      return {
        queryType: "opportunity",
        source: "verified_engine",
        answer: `Your single highest-confidence opportunity is ${primary.sourceProduct.name} → ${primary.recommendedProduct.name}. It represents ₹${primary.estimatedIncrementalRevenue.toLocaleString()} in verified expected incremental revenue across ${primary.estimatedEligibleCustomers.toLocaleString()} eligible customers with ${primary.confidenceScore}% AI confidence.`,
        relevantMetrics: [
          {
            label: "Top Opportunity",
            value: `${primary.sourceProduct.name} → ${primary.recommendedProduct.name}`,
          },
          {
            label: "Expected Revenue",
            value: `₹${primary.estimatedIncrementalRevenue.toLocaleString()}`,
          },
          {
            label: "Eligible Customers",
            value: primary.estimatedEligibleCustomers.toLocaleString(),
          },
          { label: "AI Confidence", value: `${primary.confidenceScore}%` },
        ],
        suggestedAction: {
          label: "Investigate Opportunity",
          page: "opportunity-investigate",
        },
        confidenceScore: primary.confidenceScore,
      }
    }

    // 2. Why did you find Running Shoes opportunity?
    if (
      (q.includes("why") &&
        (q.includes("find") ||
          q.includes("running") ||
          q.includes("shoes") ||
          q.includes("opportunity"))) ||
      q.includes("reasoning") ||
      q.includes("evidence")
    ) {
      return {
        queryType: "explanation",
        source: "verified_engine",
        answer: `GrowthOS flagged ${primary.sourceProduct.name} → ${primary.recommendedProduct.name} because your current attach rate is ${(primary.attachRate * 100).toFixed(1)}%, which is ${(primary.gap * 100).toFixed(1)}pp below the ${Math.round(primary.benchmarkAttachRate * 100)}% category benchmark. A strong basket affinity correlation of r = 0.74 confirms customers naturally co-purchase these products, but ${primary.estimatedEligibleCustomers.toLocaleString()} customers left without buying socks.`,
        relevantMetrics: [
          {
            label: "Current Attach Rate",
            value: `${(primary.attachRate * 100).toFixed(1)}%`,
          },
          {
            label: "Benchmark Attach Rate",
            value: `${Math.round(primary.benchmarkAttachRate * 100)}%`,
          },
          {
            label: "Attach Rate Gap",
            value: `${(primary.gap * 100).toFixed(1)}pp`,
          },
          { label: "Correlation", value: "r = 0.74" },
        ],
        suggestedAction: {
          label: "View Full Investigation",
          page: "opportunity-investigate",
        },
        confidenceScore: primary.confidenceScore,
      }
    }

    // 3. How many customers are eligible?
    if (
      q.includes("how many") ||
      q.includes("eligible") ||
      q.includes("audience") ||
      q.includes("target size") ||
      q.includes("customers eligible")
    ) {
      return {
        queryType: "audience",
        source: "verified_engine",
        answer: `There are exactly ${primary.estimatedEligibleCustomers.toLocaleString()} verified eligible customers in this cohort. These are merchants' customers who purchased ${primary.sourceProduct.name} in the last 90 days but have not yet purchased ${primary.recommendedProduct.name}.`,
        relevantMetrics: [
          {
            label: "Eligible Customers",
            value: primary.estimatedEligibleCustomers.toLocaleString(),
          },
          {
            label: "Source Product Buyers",
            value: primary.sourceBuyers.toLocaleString(),
          },
          {
            label: "Current Co-Buyers",
            value: primary.coBuyers.toLocaleString(),
          },
          { label: "Conversion Window", value: "45 days" },
        ],
        suggestedAction: {
          label: "Configure Audience",
          page: "campaign-create",
        },
        confidenceScore: primary.confidenceScore,
      }
    }

    // 4. What should I offer these customers?
    if (
      q.includes("what should i offer") ||
      q.includes("bundle") ||
      q.includes("offer") ||
      q.includes("what price") ||
      q.includes("pricing") ||
      q.includes("discount")
    ) {
      const accessoryDiscounted =
        primary.sourceProduct.id === "prod_shoes_running" &&
        primary.recommendedProduct.id === "prod_socks_running"
          ? 300
          : Math.round(primary.recommendedProduct.price * 0.6)
      const bundlePrice = primary.sourceProduct.price + accessoryDiscounted
      const savings =
        primary.sourceProduct.price +
        primary.recommendedProduct.price -
        bundlePrice

      return {
        queryType: "bundle",
        source: "ai_reasoning",
        answer: `We recommend the "Complete Your Run" cross-sell bundle: pair ${primary.sourceProduct.name} (₹${primary.sourceProduct.price.toLocaleString()}) with ${primary.recommendedProduct.name} (₹${primary.recommendedProduct.price.toLocaleString()}) at a bundled price of ₹${bundlePrice.toLocaleString()}, saving customers ₹${savings.toLocaleString()}. This provides an average order value uplift of +₹${accessoryDiscounted} per converted order.`,
        relevantMetrics: [
          {
            label: "Suggested Bundle Price",
            value: `₹${bundlePrice.toLocaleString()}`,
          },
          { label: "Customer Savings", value: `₹${savings.toLocaleString()}` },
          { label: "Expected AOV Lift", value: `+₹${accessoryDiscounted}` },
          { label: "Channels", value: "Email + WhatsApp" },
        ],
        suggestedAction: {
          label: "Review Bundle Campaign",
          page: "campaign-create",
        },
        confidenceScore: primary.confidenceScore,
      }
    }

    // 5. What is the expected incremental revenue?
    if (
      q.includes("revenue") ||
      q.includes("incremental") ||
      q.includes("financial impact") ||
      q.includes("how much") ||
      q.includes("expected orders")
    ) {
      const totalPotential = opportunities.reduce(
        (sum, o) => sum + o.estimatedIncrementalRevenue,
        0,
      )

      return {
        queryType: "revenue",
        source: "verified_engine",
        answer: `The primary ${primary.sourceProduct.name} → ${primary.recommendedProduct.name} opportunity has an expected incremental revenue of ₹${primary.estimatedIncrementalRevenue.toLocaleString()} from ~${primary.expectedIncrementalOrders} unlocked orders. Across all ${opportunities.length} discovered opportunities, your store has ₹${(totalPotential / 100000).toFixed(2)}L in verified incremental revenue potential.`,
        relevantMetrics: [
          {
            label: "Primary Opp Revenue",
            value: `₹${primary.estimatedIncrementalRevenue.toLocaleString()}`,
          },
          {
            label: "Incremental Orders",
            value: `~${primary.expectedIncrementalOrders}`,
          },
          {
            label: "Total Store Potential",
            value: `₹${(totalPotential / 100000).toFixed(2)}L`,
          },
          { label: "Total Opportunities", value: opportunities.length },
        ],
        suggestedAction: {
          label: "View Opportunities",
          page: "opportunities",
        },
        confidenceScore: primary.confidenceScore,
      }
    }

    // 6. Attach rate specifics
    if (
      q.includes("attach rate") ||
      q.includes("gap") ||
      q.includes("benchmark")
    ) {
      return {
        queryType: "explanation",
        source: "verified_engine",
        answer: `SoleX's current ${primary.recommendedProduct.name.toLowerCase()} attach rate is ${(primary.attachRate * 100).toFixed(1)}%, compared to the ${Math.round(primary.benchmarkAttachRate * 100)}% median across peer sportswear merchants on Razorpay. Closing this ${(primary.gap * 100).toFixed(1)}pp deficit to the 31% target unlocks ~${primary.expectedIncrementalOrders} orders and ₹${primary.estimatedIncrementalRevenue.toLocaleString()}.`,
        relevantMetrics: [
          {
            label: "Current Attach Rate",
            value: `${(primary.attachRate * 100).toFixed(1)}%`,
          },
          {
            label: "Peer Benchmark",
            value: `${Math.round(primary.benchmarkAttachRate * 100)}%`,
          },
          { label: "Target Attach Rate", value: "31.0%" },
          {
            label: "Deficit to Close",
            value: `${(primary.gap * 100).toFixed(1)}pp`,
          },
        ],
        suggestedAction: {
          label: "Investigate Gap",
          page: "opportunity-investigate",
        },
        confidenceScore: primary.confidenceScore,
      }
    }

    // 7. Unsupported / Out of Scope Query
    return {
      queryType: "unsupported",
      source: "verified_engine",
      answer: `Data not available for "${query}". GrowthOS currently monitors verified transaction patterns, cross-sell opportunities, customer segments, and category benchmarks for SoleX. Try asking about your biggest revenue opportunity, eligible customers, bundle recommendations, or incremental revenue.`,
      relevantMetrics: [
        { label: "Monitored Orders", value: "18,420" },
        { label: "Active Opportunities", value: opportunities.length },
      ],
      suggestedAction: {
        label: "View Dashboard Insights",
        page: "dashboard",
      },
    }
  }
}

// ─── External Server AI Provider ───────────────────────────────────────────────

export class ServerAIProvider implements AIProvider {
  name = "growthos-server-llm"
  private fallbackProvider = new DeterministicAIProvider()

  async generateOpportunityExplanation(
    opportunity: CrossSellOpportunity,
  ): Promise<OpportunityExplanation> {
    if (typeof window === "undefined") {
      return this.fallbackProvider.generateOpportunityExplanation(opportunity)
    }

    try {
      const res = await fetch("/api/ai/explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity }),
      })

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`)
      }

      const data = await res.json()
      if (
        data &&
        typeof data.summary === "string" &&
        Array.isArray(data.evidence) &&
        typeof data.reasoning === "string" &&
        Array.isArray(data.caveats) &&
        typeof data.recommendation === "string"
      ) {
        return data as OpportunityExplanation
      }
      throw new Error("Invalid schema received from server AI")
    } catch {
      // Graceful fallback to deterministic provider
      return this.fallbackProvider.generateOpportunityExplanation(opportunity)
    }
  }

  async generateCampaignRecommendation(
    opportunity: CrossSellOpportunity,
  ): Promise<CampaignRecommendation> {
    if (typeof window === "undefined") {
      return this.fallbackProvider.generateCampaignRecommendation(opportunity)
    }

    try {
      const res = await fetch("/api/ai/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity }),
      })

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`)
      }

      const data = await res.json()
      if (
        data &&
        typeof data.campaignName === "string" &&
        typeof data.headline === "string" &&
        typeof data.body === "string"
      ) {
        // Enforce verified business constraints on price
        const safePrice =
          data.suggestedBundlePrice > opportunity.sourceProduct.price &&
          data.suggestedBundlePrice <
            opportunity.sourceProduct.price +
              opportunity.recommendedProduct.price
            ? data.suggestedBundlePrice
            : opportunity.sourceProduct.price +
              Math.round(opportunity.recommendedProduct.price * 0.6)

        return {
          ...data,
          suggestedBundlePrice: safePrice,
        }
      }
      throw new Error("Invalid schema received from server AI")
    } catch {
      return this.fallbackProvider.generateCampaignRecommendation(opportunity)
    }
  }

  async answerMerchantQuery(
    query: string,
    context?: MerchantQueryContext,
  ): Promise<MerchantQueryResponse> {
    if (typeof window === "undefined") {
      return this.fallbackProvider.answerMerchantQuery(query, context)
    }

    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, context }),
      })

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`)
      }

      const data = await res.json()
      if (data && typeof data.answer === "string") {
        return data as MerchantQueryResponse
      }
      throw new Error("Invalid schema received from server AI")
    } catch {
      return this.fallbackProvider.answerMerchantQuery(query, context)
    }
  }
}

// ─── GrowthOS AI Service Orchestrator ──────────────────────────────────────────

class GrowthOSAIService {
  private primaryProvider: AIProvider
  private fallbackProvider: DeterministicAIProvider
  private activityLogs: AIActivityEvent[] = []

  constructor() {
    this.fallbackProvider = new DeterministicAIProvider()
    this.primaryProvider = new ServerAIProvider()
    this.initActivityLogs()
  }

  private initActivityLogs() {
    // Seed initial activity logs with structured AIActivityEvent schema
    this.activityLogs = aiActivityLogs.map((log, index) => ({
      id: `ai_init_${index + 1}`,
      time: log.time,
      type: log.type as AIActivityEvent["type"] || "analysis",
      title: log.title,
      detail: log.detail,
      meta: log.meta,
      status: log.status as AIActivityEvent["status"] || "completed",
      model: "growthos-deterministic-v1",
      confidencePercent: 89,
      opportunityId: "opp_shoes_socks",
    }))
  }

  public getAIActivityLogs(): AIActivityEvent[] {
    return [...this.activityLogs]
  }

  public logAIEvent(
    event: Omit<AIActivityEvent, "id" | "time">,
  ): AIActivityEvent {
    const newEvent: AIActivityEvent = {
      ...event,
      id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      time: "Just now",
    }
    this.activityLogs.unshift(newEvent)
    return newEvent
  }

  async getOpportunityExplanation(
    opportunity: CrossSellOpportunity,
  ): Promise<OpportunityExplanation> {
    try {
      const explanation =
        await this.primaryProvider.generateOpportunityExplanation(opportunity)
      this.logAIEvent({
        type: "opportunity",
        title: "Opportunity Explanation Generated",
        detail: `AI generated natural-language reasoning for ${opportunity.sourceProduct.name} → ${opportunity.recommendedProduct.name}`,
        meta: `Model: ${this.primaryProvider.name} · Verified Orders: 18,420 · Confidence: ${opportunity.confidenceScore}%`,
        status: "completed",
        model: this.primaryProvider.name,
        confidencePercent: opportunity.confidenceScore,
        opportunityId: `${opportunity.sourceProduct.id}:${opportunity.recommendedProduct.id}`,
      })
      return explanation
    } catch {
      // Fallback
      const explanation =
        await this.fallbackProvider.generateOpportunityExplanation(opportunity)
      this.logAIEvent({
        type: "fallback",
        title: "Deterministic AI Fallback Engaged",
        detail: `Generated verified explanation for ${opportunity.sourceProduct.name} → ${opportunity.recommendedProduct.name} using deterministic engine`,
        meta: `Fallback Provider: ${this.fallbackProvider.name} · Zero API dependencies`,
        status: "completed",
        model: this.fallbackProvider.name,
        confidencePercent: opportunity.confidenceScore,
        opportunityId: `${opportunity.sourceProduct.id}:${opportunity.recommendedProduct.id}`,
      })
      return explanation
    }
  }

  public getCampaignRecommendationSync(
    opportunity: CrossSellOpportunity,
  ): CampaignRecommendation {
    return this.fallbackProvider.generateCampaignRecommendationSync(opportunity)
  }

  async getCampaignRecommendation(
    opportunity: CrossSellOpportunity,
  ): Promise<CampaignRecommendation> {
    try {
      const rec =
        await this.primaryProvider.generateCampaignRecommendation(opportunity)
      this.logAIEvent({
        type: "recommendation",
        title: "Campaign Recommendation Generated",
        detail: `AI crafted "${rec.campaignName}" offer at ₹${rec.suggestedBundlePrice.toLocaleString()} for ${opportunity.estimatedEligibleCustomers.toLocaleString()} customers`,
        meta: `Model: ${this.primaryProvider.name} · Channels: ${rec.channels.join(", ")}`,
        status: "completed",
        model: this.primaryProvider.name,
        confidencePercent: opportunity.confidenceScore,
        opportunityId: `${opportunity.sourceProduct.id}:${opportunity.recommendedProduct.id}`,
      })
      return rec
    } catch {
      const rec =
        await this.fallbackProvider.generateCampaignRecommendation(opportunity)
      this.logAIEvent({
        type: "fallback",
        title: "Deterministic Campaign Recommendation",
        detail: `Created campaign "${rec.campaignName}" via deterministic rules`,
        meta: `Fallback Provider: ${this.fallbackProvider.name} · Bundle Margin: Safe`,
        status: "completed",
        model: this.fallbackProvider.name,
        confidencePercent: opportunity.confidenceScore,
        opportunityId: `${opportunity.sourceProduct.id}:${opportunity.recommendedProduct.id}`,
      })
      return rec
    }
  }

  async askGrowthOS(
    query: string,
    context?: MerchantQueryContext,
  ): Promise<MerchantQueryResponse> {
    try {
      const res = await this.primaryProvider.answerMerchantQuery(query, context)
      this.logAIEvent({
        type: "analysis",
        title: "Merchant Query Answered",
        detail: `Processed query: "${query.slice(0, 45)}${
          query.length > 45 ? "..." : ""
        }"`,
        meta: `Query Type: ${res.queryType} · Source: ${res.source} · Model: ${this.primaryProvider.name}`,
        status: "completed",
        model: this.primaryProvider.name,
        confidencePercent: res.confidenceScore ?? 89,
      })
      return res
    } catch {
      const res = await this.fallbackProvider.answerMerchantQuery(
        query,
        context,
      )
      this.logAIEvent({
        type: "fallback",
        title: "Merchant Query Answered via Fallback",
        detail: `Resolved query: "${query.slice(0, 45)}${
          query.length > 45 ? "..." : ""
        }"`,
        meta: `Query Type: ${res.queryType} · Source: ${res.source} · Provider: ${this.fallbackProvider.name}`,
        status: "completed",
        model: this.fallbackProvider.name,
        confidencePercent: res.confidenceScore ?? 89,
      })
      return res
    }
  }
}

// Singleton instance
export const aiService = new GrowthOSAIService()
