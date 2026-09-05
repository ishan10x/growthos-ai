import type { CrossSellOpportunity } from "../types/dataFoundation.ts"
import { getMerchantDataset } from "../data/syntheticGenerator.ts"
import { findCrossSellOpportunities } from "./opportunityEngine.ts"

// Singleton cache for calculated opportunities
let cachedOpportunities: CrossSellOpportunity[] | null = null

/**
 * Returns all calculated opportunities from the deterministic merchant dataset.
 */
export function getCalculatedOpportunities(): CrossSellOpportunity[] {
  if (!cachedOpportunities) {
    const dataset = getMerchantDataset(42)
    cachedOpportunities = findCrossSellOpportunities(dataset, {
      benchmarkAttachRate: 0.29,
      targetAttachRate: 0.31,
      bundleMarginGain: 99.7658,
    })
  }
  return cachedOpportunities
}

/**
 * Returns the primary demo opportunity: Running Shoes → Running Socks.
 */
export function getPrimaryOpportunity(): CrossSellOpportunity {
  const opps = getCalculatedOpportunities()
  const primary = opps.find(
    (o) =>
      o.sourceProduct.id === "prod_shoes_running" &&
      o.recommendedProduct.id === "prod_socks_running",
  )
  if (!primary) {
    return opps[0]
  }
  return primary
}

/**
 * Finds a specific opportunity by source and recommended product IDs.
 */
export function getOpportunityById(
  sourceId: string,
  recommendedId: string,
): CrossSellOpportunity | undefined {
  const opps = getCalculatedOpportunities()
  return opps.find(
    (o) =>
      o.sourceProduct.id === sourceId &&
      o.recommendedProduct.id === recommendedId,
  )
}

/**
 * Returns the sum of estimated incremental revenue across all discovered opportunities.
 */
export function getTotalOpportunityRevenue(): number {
  const opps = getCalculatedOpportunities()
  return opps.reduce((sum, o) => sum + o.estimatedIncrementalRevenue, 0)
}
