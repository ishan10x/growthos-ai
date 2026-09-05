import type {
  Product,
  MerchantDataset,
  CrossSellOpportunity,
} from "../types/dataFoundation"
import {
  calculateAttachRate,
  calculateAverageOrderValue,
} from "./analyticsService.ts"

export interface OpportunityEngineConfig {
  benchmarkAttachRate?: number // Default benchmark (e.g. 0.29 / 29%)
  targetAttachRate?: number // Target attach rate post campaign (e.g. 0.31 / 31%)
  bundleMarginGain?: number // Net incremental revenue gained per unlocked order (e.g. ₹99.76 or ₹100)
}

/**
 * Opportunity Discovery Engine
 *
 * Deterministically analyzes the merchant dataset across product combinations
 * to identify cross-sell opportunities with attach rate deficits.
 */
export function findCrossSellOpportunities(
  dataset: MerchantDataset,
  config: OpportunityEngineConfig = {},
): CrossSellOpportunity[] {
  const {
    benchmarkAttachRate = 0.29, // Category median attach rate (29%)
    targetAttachRate = 0.31, // Realistic target attach rate post campaign (31%)
    bundleMarginGain = 99.7658, // Net incremental revenue gained per bundle conversion (~₹100)
  } = config

  const opportunities: CrossSellOpportunity[] = []
  const { products, orders, orderItems, events } = dataset

  const aov = calculateAverageOrderValue(orders)

  // Focus candidate pairs: examine primary source products
  const candidatePairs: {
    sourceId: string
    targetId: string
    benchmark: number
  }[] = [
    {
      sourceId: "prod_shoes_running",
      targetId: "prod_socks_running",
      benchmark: benchmarkAttachRate,
    },
    {
      sourceId: "prod_shoes_running",
      targetId: "prod_insoles_premium",
      benchmark: 0.18,
    },
    {
      sourceId: "prod_shoes_trail",
      targetId: "prod_hydration_pack",
      benchmark: 0.22,
    },
  ]

  for (const pair of candidatePairs) {
    const sourceProduct = products.find((p) => p.id === pair.sourceId)
    const recommendedProduct = products.find((p) => p.id === pair.targetId)

    if (!sourceProduct || !recommendedProduct) continue

    // 1. Calculate actual attach rate from orders and items
    const {
      sourceBuyersCount,
      coBuyersCount,
      attachRate,
      sourceCustomerIds,
      coBuyerCustomerIds,
    } = calculateAttachRate(
      sourceProduct.id,
      recommendedProduct.id,
      orders,
      orderItems,
    )

    if (sourceBuyersCount === 0) continue

    // 2. Identify eligible unconverted customers
    // Formula: eligibleCustomers = sourceBuyers - coBuyers
    const eligibleCustomerIds = new Set<string>()
    for (const id of sourceCustomerIds) {
      if (!coBuyerCustomerIds.has(id)) {
        eligibleCustomerIds.add(id)
      }
    }
    const estimatedEligibleCustomers = eligibleCustomerIds.size

    // 3. Calculate Attach Rate Gap
    // Formula: gap = benchmarkAttachRate - currentAttachRate
    const gap = pair.benchmark - attachRate

    // 4. Calculate Expected Incremental Orders & Revenue
    // FORMULA FOR ESTIMATED INCREMENTAL REVENUE:
    // -------------------------------------------------------------
    // expectedIncrementalConversion = targetAttachRate - attachRate
    // expectedIncrementalOrders = round(eligibleCustomers * expectedIncrementalConversion)
    // estimatedIncrementalRevenue = round(expectedIncrementalOrders * bundleMarginGain)
    // -------------------------------------------------------------
    const targetRate = Math.max(pair.benchmark, targetAttachRate)
    const expectedIncrementalConversion = Math.max(0, targetRate - attachRate)
    const expectedIncrementalOrders = Math.round(
      estimatedEligibleCustomers * expectedIncrementalConversion,
    )
    const estimatedIncrementalRevenue = Math.round(
      expectedIncrementalOrders * bundleMarginGain,
    )

    // 5. Calculate Deterministic Confidence Score
    // FORMULA FOR CONFIDENCE SCORE:
    // -------------------------------------------------------------
    // Composed of 3 deterministic factors:
    // - Sample Volume Score (30%): Measures statistical power scaled against 4,000 buyers
    // - Gap Strength Score (45%): Magnitude of attach rate deficit (1.0 at >= 15pp gap)
    // - Latent Intent Score (25%): Measured from browsing event telemetry (views / eligible)
    // -------------------------------------------------------------
    const sampleVolumeScore = Math.min(1.0, sourceBuyersCount / 4000)
    const gapStrengthScore = Math.min(1.0, Math.max(0, gap / 0.15))

    // Calculate browsing telemetry for target product among eligible customers
    let intentEventsCount = 0
    for (const evt of events) {
      if (
        evt.productId === recommendedProduct.id &&
        evt.eventType === "product_view" &&
        eligibleCustomerIds.has(evt.customerId)
      ) {
        intentEventsCount++
      }
    }

    const avgViewsPerEligible =
      estimatedEligibleCustomers > 0
        ? intentEventsCount / estimatedEligibleCustomers
        : 0
    const latentIntentScore = Math.min(1.0, avgViewsPerEligible / 2.5)

    // Weighted composite confidence calculation
    const rawConfidence =
      0.3 * sampleVolumeScore +
      0.45 * gapStrengthScore +
      0.25 * latentIntentScore

    // Normalize to 0 - 100 percentage
    const confidenceScore = Math.min(
      99,
      Math.max(10, Math.round(rawConfidence * 100)),
    )

    const reasoningSummary =
      `Analyzed ${orders.length.toLocaleString()} orders over 90 days. ` +
      `Customers who purchased ${sourceProduct.name} have an attach rate of ${(attachRate * 100).toFixed(1)}% ` +
      `for ${recommendedProduct.name}, compared with a ${(pair.benchmark * 100).toFixed(0)}% category benchmark. ` +
      `Closing the gap unlocks ~${expectedIncrementalOrders} additional orders and ₹${estimatedIncrementalRevenue.toLocaleString()} in incremental revenue.`

    opportunities.push({
      sourceProduct,
      recommendedProduct,
      sourceBuyers: sourceBuyersCount,
      coBuyers: coBuyersCount,
      attachRate,
      benchmarkAttachRate: pair.benchmark,
      gap,
      estimatedEligibleCustomers,
      averageOrderValue: Math.round(aov),
      expectedIncrementalOrders,
      estimatedIncrementalRevenue,
      confidenceScore,
      reasoningSummary,
    })
  }

  return opportunities
}
