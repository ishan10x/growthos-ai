import {
  DeterministicAIProvider,
  ServerAIProvider,
  aiService,
} from "./aiService.ts"
import {
  getPrimaryOpportunity,
  getCalculatedOpportunities,
} from "./opportunityService.ts"
import type { CrossSellOpportunity } from "../types/dataFoundation.ts"

interface TestResult {
  name: string
  passed: boolean
  detail?: string
}

const results: TestResult[] = []

function assert(condition: boolean, name: string, detail?: string) {
  results.push({
    name,
    passed: !!condition,
    detail,
  })
  if (!condition) {
    console.error(`  ✗ FAIL: ${name} - ${detail ?? "Condition not met"}`)
  } else {
    console.log(`  ✓ PASS: ${name}`)
  }
}

async function runAITests() {
  console.log(
    "==================================================================",
  )
  console.log(" GrowthOS Phase 5 AI Reasoning Layer Verification")
  console.log(
    "==================================================================\n",
  )

  const primaryOpp = getPrimaryOpportunity()
  const provider = new DeterministicAIProvider()

  // ─── Test 1: Input Validation ───────────────────────────────────────────────
  console.log("[Test 1] Testing AI service input validation...")
  try {
    // @ts-expect-error testing invalid input
    await provider.generateOpportunityExplanation(null)
    assert(false, "Throws on null opportunity")
  } catch (err) {
    assert(true, "Throws on null opportunity", String(err))
  }

  try {
    // @ts-expect-error testing invalid opportunity object
    await provider.generateCampaignRecommendation({})
    assert(false, "Throws on empty opportunity object")
  } catch (err) {
    assert(true, "Throws on empty opportunity object", String(err))
  }

  // ─── Test 2: Deterministic Fallback Explanation Schema ───────────────────────
  console.log("\n[Test 2] Testing Deterministic Fallback Explanation schema...")
  const explanation = await provider.generateOpportunityExplanation(primaryOpp)
  assert(
    typeof explanation.summary === "string" && explanation.summary.length > 50,
    "Explanation contains comprehensive summary",
    explanation.summary.slice(0, 60) + "...",
  )
  assert(
    Array.isArray(explanation.evidence) && explanation.evidence.length >= 3,
    "Explanation contains at least 3 evidence items",
    `Count: ${explanation.evidence.length}`,
  )
  assert(
    typeof explanation.reasoning === "string" &&
      explanation.reasoning.length > 50,
    "Explanation contains rich reasoning",
  )
  assert(
    Array.isArray(explanation.caveats) && explanation.caveats.length >= 2,
    "Explanation contains realistic risk caveats",
    `Caveats: ${explanation.caveats.length}`,
  )
  assert(
    typeof explanation.recommendation === "string" &&
      explanation.recommendation.includes("Complete Your Run"),
    "Explanation contains actionable next step",
  )

  // ─── Test 3: Campaign Recommendation Schema Validation ──────────────────────
  console.log("\n[Test 3] Testing Campaign Recommendation schema...")
  const syncRec = aiService.getCampaignRecommendationSync(primaryOpp)
  assert(
    syncRec && syncRec.campaignName === "Complete Your Run",
    "Synchronous campaign recommendation immediately returns valid object",
    syncRec.campaignName,
  )

  const recommendation =
    await provider.generateCampaignRecommendation(primaryOpp)
  assert(
    recommendation.campaignName === "Complete Your Run",
    "Recommendation specifies campaign name",
    recommendation.campaignName,
  )
  assert(recommendation.campaignType === "bundle", "Campaign type is bundle")
  assert(
    typeof recommendation.targetAudience === "string" &&
      recommendation.targetAudience.includes("2,772"),
    "Recommendation specifies structured target audience",
    recommendation.targetAudience.slice(0, 45) + "...",
  )
  assert(
    typeof recommendation.offerDescription === "string" &&
      recommendation.offerDescription.includes("₹2,799"),
    "Recommendation specifies offer description with bundle price",
    recommendation.offerDescription,
  )
  assert(
    recommendation.suggestedBundlePrice > primaryOpp.sourceProduct.price &&
      recommendation.suggestedBundlePrice <
        primaryOpp.sourceProduct.price + primaryOpp.recommendedProduct.price,
    "Bundle price obeys business margin bounds (between single product and total sum)",
    `₹${recommendation.suggestedBundlePrice} (Single: ₹${primaryOpp.sourceProduct.price}, Sum: ₹${primaryOpp.sourceProduct.price + primaryOpp.recommendedProduct.price})`,
  )
  assert(
    Array.isArray(recommendation.channels) &&
      recommendation.channels.length >= 2 &&
      recommendation.channels.includes("Email"),
    "Recommendation specifies channels (Email, WhatsApp)",
    recommendation.channels.join(", "),
  )
  assert(
    recommendation.headline.length > 5 && recommendation.body.length > 20,
    "Recommendation contains marketing copy headline and body",
  )
  assert(
    typeof recommendation.rationale === "string" &&
      recommendation.rationale.length > 30,
    "Recommendation specifies strategic rationale",
    recommendation.rationale.slice(0, 50) + "...",
  )

  // ─── Test 4: Numerical Protection from AI Hallucination ──────────────────────
  console.log(
    "\n[Test 4] Verifying Numerical Values Protection from Hallucination...",
  )
  assert(
    primaryOpp.estimatedIncrementalRevenue === 41602,
    "Primary opportunity revenue matches Phase 3 ground truth exactly (₹41,602)",
    `Actual: ₹${primaryOpp.estimatedIncrementalRevenue}`,
  )
  assert(
    primaryOpp.estimatedEligibleCustomers === 2772,
    "Eligible customers count matches Phase 3 ground truth exactly (2,772)",
    `Actual: ${primaryOpp.estimatedEligibleCustomers}`,
  )
  assert(
    primaryOpp.confidenceScore === 89,
    "AI confidence score matches Phase 3 ground truth exactly (89%)",
    `Actual: ${primaryOpp.confidenceScore}%`,
  )
  assert(
    primaryOpp.expectedIncrementalOrders === 417,
    "Expected incremental orders matches Phase 3 ground truth (~417)",
    `Actual: ${primaryOpp.expectedIncrementalOrders}`,
  )

  // ─── Test 5: Fallback Resiliency ─────────────────────────────────────────────
  console.log("\n[Test 5] Testing External Provider Fallback Resiliency...")
  const serverProvider = new ServerAIProvider()
  // In Node environment without window/server, serverProvider must gracefully delegate to deterministic fallback
  const fallbackExplanation =
    await serverProvider.generateOpportunityExplanation(primaryOpp)
  assert(
    fallbackExplanation && fallbackExplanation.summary.length > 0,
    "Server provider gracefully falls back without crashing",
  )

  // ─── Test 6: Natural Language Command Routing ────────────────────────────────
  console.log("\n[Test 6] Testing Natural Language Command Routing...")

  // Query 1: Find biggest revenue opportunity
  const q1 = await provider.answerMerchantQuery(
    "Find my biggest revenue opportunity",
  )
  assert(
    q1.queryType === "opportunity" && q1.answer.includes("₹41,602"),
    "Route 1: 'Find my biggest revenue opportunity' returns verified ₹41,602 revenue",
  )

  // Query 2: Why did you find Running Shoes opportunity?
  const q2 = await provider.answerMerchantQuery(
    "Why did you find the Running Shoes opportunity?",
  )
  assert(
    q2.queryType === "explanation" &&
      q2.answer.includes("16.0%") &&
      q2.answer.includes("29%"),
    "Route 2: 'Why did you find Running Shoes' returns 16.0% attach rate and 29% benchmark",
  )

  // Query 3: How many customers are eligible?
  const q3 = await provider.answerMerchantQuery(
    "How many customers are eligible?",
  )
  assert(
    q3.queryType === "audience" && q3.answer.includes("2,772"),
    "Route 3: 'How many customers are eligible' returns authoritative 2,772 count",
  )

  // Query 4: What should I offer these customers?
  const q4 = await provider.answerMerchantQuery(
    "What should I offer these customers?",
  )
  assert(
    q4.queryType === "bundle" && q4.answer.includes("₹2,799"),
    "Route 4: 'What should I offer' returns bundle price ₹2,799 with savings",
  )

  // Query 5: What is the expected incremental revenue?
  const q5 = await provider.answerMerchantQuery(
    "What is the expected incremental revenue?",
  )
  assert(
    q5.queryType === "revenue" && q5.answer.includes("₹41,602"),
    "Route 5: 'What is expected incremental revenue' returns ₹41,602",
  )

  // Query 6: Unsupported query
  const q6 = await provider.answerMerchantQuery(
    "What is the stock price of Tesla?",
  )
  assert(
    q6.queryType === "unsupported" && q6.answer.includes("Data not available"),
    "Route 6: Unsupported query politely indicates data is not available",
  )

  // ─── Test 7: AI Activity Event Logging ───────────────────────────────────────
  console.log("\n[Test 7] Testing Structured AI Activity Event Logging...")
  const initialLogsCount = aiService.getAIActivityLogs().length
  await aiService.askGrowthOS("Find my biggest revenue opportunity")
  const updatedLogs = aiService.getAIActivityLogs()
  assert(
    updatedLogs.length === initialLogsCount + 1,
    "Query execution adds a structured activity event to audit log",
    `Initial: ${initialLogsCount}, Current: ${updatedLogs.length}`,
  )
  assert(
    updatedLogs[0].title.includes("Merchant Query"),
    "Logged event records accurate title and metadata",
    updatedLogs[0].title,
  )

  // ─── Summary ────────────────────────────────────────────────────────────────
  const total = results.length
  const passed = results.filter((r) => r.passed).length
  console.log(
    "\n==================================================================",
  )
  console.log(
    ` Phase 5 Verification Complete: ${passed}/${total} checks passed`,
  )
  console.log(
    "==================================================================",
  )

  if (passed !== total) {
    process.exit(1)
  }
}

runAITests().catch((err) => {
  console.error("Test execution failed:", err)
  process.exit(1)
})
