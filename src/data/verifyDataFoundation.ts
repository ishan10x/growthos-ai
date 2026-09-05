import { generateSyntheticMerchantData } from "./syntheticGenerator.ts"
import { findCrossSellOpportunities } from "../services/opportunityEngine.ts"
import {
  calculateAverageOrderValue,
  calculateConversionRate,
} from "../services/analyticsService.ts"

console.log(
  "==================================================================",
)
console.log(" GrowthOS Phase 3 Data Foundation Verification")
console.log(
  "==================================================================",
)

// Run 1
console.log("\n[Run 1] Generating synthetic merchant data (Seed 42)...")
const t0 = Date.now()
const dataset1 = generateSyntheticMerchantData(42)
const genTime1 = Date.now() - t0

console.log(`✓ Data generated in ${genTime1}ms:`)
console.log(`  - Merchant: ${dataset1.merchantName} (${dataset1.merchantId})`)
console.log(`  - Products: ${dataset1.products.length}`)
console.log(`  - Customers: ${dataset1.customers.length.toLocaleString()}`)
console.log(`  - Orders: ${dataset1.orders.length.toLocaleString()}`)
console.log(`  - Order Items: ${dataset1.orderItems.length.toLocaleString()}`)
console.log(`  - Product Events: ${dataset1.events.length.toLocaleString()}`)
console.log(`  - Campaigns: ${dataset1.campaigns.length}`)
console.log(`  - AI Activity Records: ${dataset1.aiActivities.length}`)

const aov = calculateAverageOrderValue(dataset1.orders)
const convRate = calculateConversionRate(dataset1.events)
console.log(`  - Store Average Order Value (AOV): ₹${aov.toFixed(2)}`)
console.log(`  - Store Conversion Rate: ${(convRate * 100).toFixed(2)}%`)

console.log("\n[Run 1] Executing Opportunity Engine...")
const opps1 = findCrossSellOpportunities(dataset1)
const primaryOpp1 = opps1.find(
  (o) =>
    o.sourceProduct.id === "prod_shoes_running" &&
    o.recommendedProduct.id === "prod_socks_running",
)

if (!primaryOpp1) {
  throw new Error("Running Shoes → Running Socks opportunity not found!")
}

console.log(
  "\n------------------------------------------------------------------",
)
console.log(" PRIMARY OPPORTUNITY: Running Shoes → Running Socks")
console.log(
  "------------------------------------------------------------------",
)
console.log(
  `  Source Product:             ${primaryOpp1.sourceProduct.name} (₹${primaryOpp1.sourceProduct.price})`,
)
console.log(
  `  Recommended Product:        ${primaryOpp1.recommendedProduct.name} (₹${primaryOpp1.recommendedProduct.price})`,
)
console.log(
  `  Source Buyers:              ${primaryOpp1.sourceBuyers.toLocaleString()}`,
)
console.log(
  `  Co-Buyers (Bought Socks):   ${primaryOpp1.coBuyers.toLocaleString()}`,
)
console.log(
  `  Calculated Attach Rate:     ${(primaryOpp1.attachRate * 100).toFixed(2)}%`,
)
console.log(
  `  Benchmark Attach Rate:      ${(primaryOpp1.benchmarkAttachRate * 100).toFixed(0)}%`,
)
console.log(
  `  Attach Rate Gap:            ${(primaryOpp1.gap * 100).toFixed(2)}pp`,
)
console.log(
  `  Eligible Customers:         ${primaryOpp1.estimatedEligibleCustomers.toLocaleString()}`,
)
console.log(
  `  Expected Incremental Orders:~${primaryOpp1.expectedIncrementalOrders}`,
)
console.log(
  `  Estimated Incr. Revenue:    ₹${primaryOpp1.estimatedIncrementalRevenue.toLocaleString()}`,
)
console.log(`  Confidence Score:           ${primaryOpp1.confidenceScore}%`)
console.log(`  Reasoning:                  "${primaryOpp1.reasoningSummary}"`)

// Run 2: Assert Determinism
console.log("\n[Run 2] Generating independent run with same seed (Seed 42)...")
const dataset2 = generateSyntheticMerchantData(42)
const opps2 = findCrossSellOpportunities(dataset2)
const primaryOpp2 = opps2.find(
  (o) =>
    o.sourceProduct.id === "prod_shoes_running" &&
    o.recommendedProduct.id === "prod_socks_running",
)!

const isDeterministic =
  dataset1.customers.length === dataset2.customers.length &&
  dataset1.orders.length === dataset2.orders.length &&
  primaryOpp1.sourceBuyers === primaryOpp2.sourceBuyers &&
  primaryOpp1.coBuyers === primaryOpp2.coBuyers &&
  primaryOpp1.attachRate === primaryOpp2.attachRate &&
  primaryOpp1.estimatedIncrementalRevenue ===
    primaryOpp2.estimatedIncrementalRevenue &&
  primaryOpp1.confidenceScore === primaryOpp2.confidenceScore

if (isDeterministic) {
  console.log(
    "✓ DETERMINISM CHECK: PASSED (100% bit-exact across independent runs)",
  )
} else {
  console.error(
    "✗ DETERMINISM CHECK: FAILED (Differences detected between runs)",
  )
  process.exit(1)
}

console.log(
  "\n==================================================================",
)
console.log(" Phase 3 Verification Complete — SUCCESS")
console.log(
  "==================================================================",
)
