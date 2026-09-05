/**
 * GrowthOS — In-Session Campaign Draft Shared Store
 * Single source of truth across all 4 Campaign Creation wizard steps:
 * - Step 1: Campaign Setup (Editable fields)
 * - Step 2: Audience
 * - Step 3: Message Preview
 * - Step 4: Review & Launch
 *
 * Ensures merchant-edited values (e.g. bundlePrice, campaignName, channels)
 * take authoritative precedence over initial AI suggestions across all steps
 * and in final Razorpay Payment Link creation.
 */

import type { CrossSellOpportunity } from "../types/dataFoundation"
import type { CampaignRecommendation } from "../types/ai"
import { getPrimaryOpportunity } from "./opportunityService.ts"
import { aiService } from "./aiService.ts"
import { SAFETY_BOUNDS } from "./razorpayServerService.ts"

export interface CampaignDraftState {
  // Step 1: Editable Campaign Setup values
  campaignName: string
  offerType: string
  bundlePrice: number
  offerValidity: string
  channels: string[]

  // Step 2: Audience metadata
  audienceSize: number
  selectedOpportunityId: string
  sourceProductName: string
  recommendedProductName: string

  // Step 3 & 4: AI recommendation & copy preview metadata
  aiSuggestedPrice: number
  headline: string
  body: string
  offerDescription: string
  rationale: string
  expectedGoal: string
  targetAudienceText: string

  // Deterministic ground-truth metrics (immutable from price edits)
  expectedIncrementalRevenue: number
  confidenceScore: number

  // Field edit tracking
  isEdited: {
    bundlePrice?: boolean
    campaignName?: boolean
    offerType?: boolean
    offerValidity?: boolean
    channels?: boolean
  }
}

export function createDefaultCampaignDraft(
  opportunity?: CrossSellOpportunity,
  recommendation?: CampaignRecommendation,
): CampaignDraftState {
  const opp = opportunity ?? getPrimaryOpportunity()
  const rec = recommendation ?? aiService.getCampaignRecommendationSync(opp)

  return {
    campaignName: rec.campaignName || "Complete Your Run",
    offerType:
      rec.campaignType === "bundle"
        ? "Cross-sell Bundle"
        : rec.campaignType === "upsell"
          ? "Upsell"
          : "Discount",
    bundlePrice: rec.suggestedBundlePrice || 2799,
    offerValidity: "7 days",
    channels: rec.channels && rec.channels.length > 0 ? [...rec.channels] : ["email"],
    audienceSize: opp.estimatedEligibleCustomers,
    selectedOpportunityId: `${opp.sourceProduct.id}:${opp.recommendedProduct.id}`,
    sourceProductName: opp.sourceProduct.name,
    recommendedProductName: opp.recommendedProduct.name,
    aiSuggestedPrice: rec.suggestedBundlePrice || 2799,
    headline: rec.headline,
    body: rec.body,
    offerDescription: rec.offerDescription,
    rationale: rec.rationale,
    expectedGoal: rec.expectedGoal,
    targetAudienceText: rec.targetAudience,
    expectedIncrementalRevenue: opp.estimatedIncrementalRevenue,
    confidenceScore: opp.confidenceScore,
    isEdited: {},
  }
}

type Listener = () => void

class CampaignDraftStore {
  private draft: CampaignDraftState
  private listeners: Set<Listener> = new Set()

  constructor() {
    this.draft = createDefaultCampaignDraft()
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener()
      } catch (err) {
        console.error("Error in campaign draft listener:", err)
      }
    }
  }

  public getDraft = (): CampaignDraftState => {
    return this.draft
  }

  public subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Initialize or re-seed the draft with an opportunity & recommendation
   * Preserves user edits if the opportunity is unchanged.
   */
  public initDraft(
    opportunity?: CrossSellOpportunity,
    recommendation?: CampaignRecommendation,
  ): CampaignDraftState {
    const opp = opportunity ?? getPrimaryOpportunity()
    const oppId = `${opp.sourceProduct.id}:${opp.recommendedProduct.id}`

    // If draft already matches this opportunity and has user edits, preserve them
    if (
      this.draft.selectedOpportunityId === oppId &&
      Object.keys(this.draft.isEdited).length > 0
    ) {
      return this.getDraft()
    }

    const newDraft = createDefaultCampaignDraft(opportunity, recommendation)
    if (
      this.draft.bundlePrice === newDraft.bundlePrice &&
      this.draft.campaignName === newDraft.campaignName &&
      this.draft.offerType === newDraft.offerType &&
      this.draft.audienceSize === newDraft.audienceSize
    ) {
      return this.getDraft()
    }

    this.draft = newDraft
    this.notify()
    return this.getDraft()
  }

  /**
   * Update bundle price (authoritative merchant value)
   * Recalculates dependent copy/offer description while preserving opportunity ground truth
   */
  public setBundlePrice(price: number): CampaignDraftState {
    const validPrice = Math.max(0, Math.round(price))
    const isCustom = validPrice !== this.draft.aiSuggestedPrice
    const combinedOriginal = 2998 // SoleX Shoes (2499) + Running Socks (499)
    const savings = combinedOriginal - validPrice

    const offerDescription =
      savings > 0
        ? `Bundle ${this.draft.sourceProductName} with ${this.draft.recommendedProductName} at ₹${validPrice.toLocaleString()} (Save ₹${savings.toLocaleString()})`
        : `Bundle ${this.draft.sourceProductName} with ${this.draft.recommendedProductName} at ₹${validPrice.toLocaleString()}`

    const body =
      savings > 0
        ? `You recently grabbed a pair of ${this.draft.sourceProductName} from us — great choice! Pair them with our performance ${this.draft.recommendedProductName.toLowerCase()} for the ultimate comfort and blister protection. Save ₹${savings.toLocaleString()} on your bundle today.`
        : `You recently grabbed a pair of ${this.draft.sourceProductName} from us — great choice! Pair them with our performance ${this.draft.recommendedProductName.toLowerCase()} for the ultimate comfort and blister protection. Get your exclusive bundle today.`

    this.draft = {
      ...this.draft,
      bundlePrice: validPrice,
      offerDescription,
      body,
      isEdited: {
        ...this.draft.isEdited,
        bundlePrice: isCustom,
      },
    }
    this.notify()
    return this.getDraft()
  }

  /**
   * Update campaign name
   */
  public setCampaignName(name: string): CampaignDraftState {
    const cleanName = name.trim()
    this.draft = {
      ...this.draft,
      campaignName: name,
      headline: cleanName ? `${cleanName} 🏃` : this.draft.headline,
      isEdited: {
        ...this.draft.isEdited,
        campaignName: cleanName !== "Complete Your Run",
      },
    }
    this.notify()
    return this.getDraft()
  }

  /**
   * Update offer type
   */
  public setOfferType(type: string): CampaignDraftState {
    this.draft = {
      ...this.draft,
      offerType: type,
      isEdited: {
        ...this.draft.isEdited,
        offerType: true,
      },
    }
    this.notify()
    return this.getDraft()
  }

  /**
   * Update offer validity
   */
  public setOfferValidity(validity: string): CampaignDraftState {
    this.draft = {
      ...this.draft,
      offerValidity: validity,
      isEdited: {
        ...this.draft.isEdited,
        offerValidity: true,
      },
    }
    this.notify()
    return this.getDraft()
  }

  /**
   * Update channels list
   */
  public setChannels(channels: string[]): CampaignDraftState {
    this.draft = {
      ...this.draft,
      channels: channels.length > 0 ? [...channels] : ["email"],
      isEdited: {
        ...this.draft.isEdited,
        channels: true,
      },
    }
    this.notify()
    return this.getDraft()
  }

  /**
   * Validate current draft against safety bounds for launch
   */
  public validateDraftForLaunch(): { valid: boolean; error?: string } {
    if (this.draft.bundlePrice < SAFETY_BOUNDS.MIN_BUNDLE_PRICE) {
      return {
        valid: false,
        error: `Action blocked: Bundle price (₹${this.draft.bundlePrice}) is below minimum allowed price of ₹${SAFETY_BOUNDS.MIN_BUNDLE_PRICE}.`,
      }
    }
    if (this.draft.bundlePrice > SAFETY_BOUNDS.MAX_BUNDLE_PRICE) {
      return {
        valid: false,
        error: `Action blocked: Bundle price (₹${this.draft.bundlePrice}) exceeds maximum safety bound of ₹${SAFETY_BOUNDS.MAX_BUNDLE_PRICE}.`,
      }
    }
    if (this.draft.audienceSize <= 0) {
      return {
        valid: false,
        error: "Action blocked: Target audience must be greater than 0.",
      }
    }
    if (this.draft.audienceSize > SAFETY_BOUNDS.MAX_TARGET_AUDIENCE) {
      return {
        valid: false,
        error: `Action blocked: Target audience exceeds safety limit of ${SAFETY_BOUNDS.MAX_TARGET_AUDIENCE.toLocaleString()} customers.`,
      }
    }
    return { valid: true }
  }

  /**
   * Reset the draft back to defaults (for testing & resetting wizard)
   */
  public reset(
    opportunity?: CrossSellOpportunity,
    recommendation?: CampaignRecommendation,
  ): CampaignDraftState {
    this.draft = createDefaultCampaignDraft(opportunity, recommendation)
    this.notify()
    return this.getDraft()
  }
}

export const campaignDraftStore = new CampaignDraftStore()
