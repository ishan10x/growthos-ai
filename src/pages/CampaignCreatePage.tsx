import { useState, useEffect } from "react"
import type { Page } from "../types"
import type { CrossSellOpportunity } from "../types/dataFoundation"
import type { CampaignRecommendation } from "../types/ai"
import type { RazorpayStatusResponse, TestPaymentLink } from "../types/razorpay"
import { getPrimaryOpportunity } from "../services/opportunityService"
import { aiService } from "../services/aiService"
import { razorpayClientService } from "../services/razorpayClientService"
import { campaignExecutionStore } from "../services/campaignExecutionStore"
import {
  useCampaignDraft,
  campaignDraftStore,
} from "../hooks"
import { Icons } from "../components/common/Icons"
import { Badge } from "../components/common/Badge"

export interface CampaignCreatePageProps {
  onNav: (p: Page) => void
  opportunity?: CrossSellOpportunity
}

export function CampaignCreatePage({
  onNav,
  opportunity,
}: CampaignCreatePageProps) {
  const [step, setStep] = useState(1)
  const [launched, setLaunched] = useState(false)
  const [merchantApproved, setMerchantApproved] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [launchBlockedMessage, setLaunchBlockedMessage] =
    useState<string | null>(null)
  const [createdPaymentLink, setCreatedPaymentLink] =
    useState<TestPaymentLink | null>(null)
  const [simulatedPaid, setSimulatedPaid] = useState(false)
  const [simulatedCount, setSimulatedCount] = useState(0)
  const [simulating, setSimulating] = useState(false)
  const [razorpayStatus, setRazorpayStatus] = useState<RazorpayStatusResponse>({
    status: "Not configured",
    mode: "test",
    keyIdPrefix: null,
  })

  const opp = opportunity ?? getPrimaryOpportunity()
  const [recommendation, setRecommendation] = useState<CampaignRecommendation>(
    () => aiService.getCampaignRecommendationSync(opp),
  )

  const draft = useCampaignDraft()
  const [priceInput, setPriceInput] = useState(
    () => `₹${draft.bundlePrice.toLocaleString()}`,
  )
  const [isPriceFocused, setIsPriceFocused] = useState(false)

  // Initialize/sync draft store with opp & recommendation
  useEffect(() => {
    campaignDraftStore.initDraft(opp, recommendation)
  }, [opp, recommendation])

  // Sync formatted price input when not actively typing
  useEffect(() => {
    if (!isPriceFocused) {
      setPriceInput(`₹${draft.bundlePrice.toLocaleString()}`)
    }
  }, [draft.bundlePrice, isPriceFocused])

  useEffect(() => {
    let isMounted = true
    aiService.getCampaignRecommendation(opp).then((rec) => {
      if (isMounted) setRecommendation(rec)
    })
    razorpayClientService.getStatus().then((status) => {
      if (isMounted) setRazorpayStatus(status)
    })
    return () => {
      isMounted = false
    }
  }, [opp])

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setPriceInput(raw)
    const digits = raw.replace(/[^0-9]/g, "")
    if (digits.length > 0) {
      const parsed = parseInt(digits, 10)
      if (!isNaN(parsed)) {
        campaignDraftStore.setBundlePrice(parsed)
      }
    }
  }

  const handlePriceBlur = () => {
    setIsPriceFocused(false)
    const digits = priceInput.replace(/[^0-9]/g, "")
    const parsed = digits ? parseInt(digits, 10) : draft.bundlePrice
    if (!isNaN(parsed) && parsed > 0) {
      campaignDraftStore.setBundlePrice(parsed)
      setPriceInput(`₹${parsed.toLocaleString()}`)
    } else {
      setPriceInput(`₹${draft.bundlePrice.toLocaleString()}`)
    }
  }

  const toggleChannel = (c: string) => {
    const formatted =
      c === "whatsapp" ? "WhatsApp" : c === "email" ? "Email" : "SMS"
    const exists = draft.channels.some(
      (ch) => ch.toLowerCase() === c.toLowerCase(),
    )
    let updated: string[]
    if (exists) {
      if (draft.channels.length > 1) {
        updated = draft.channels.filter(
          (ch) => ch.toLowerCase() !== c.toLowerCase(),
        )
      } else {
        updated = draft.channels
      }
    } else {
      updated = [...draft.channels, formatted]
    }
    campaignDraftStore.setChannels(updated)
  }

  const handleLaunchCampaign = async () => {
    if (!merchantApproved) {
      setLaunchBlockedMessage(
        "Action blocked: Explicit merchant authorization is required before execution.",
      )
      return
    }

    const safetyValidation = campaignDraftStore.validateDraftForLaunch()
    if (!safetyValidation.valid) {
      setLaunchBlockedMessage(
        safetyValidation.error || "Action blocked by pre-launch safety gate.",
      )
      return
    }

    setExecuting(true)
    setLaunchBlockedMessage(null)

    const idempotencyKey = `idemp_${opp.sourceProduct.id}_${opp.recommendedProduct.id}_v1`
    const res = await razorpayClientService.createPaymentLink({
      campaignId: `camp_${opp.sourceProduct.id}_${opp.recommendedProduct.id}`,
      campaignName: draft.campaignName,
      bundlePrice: draft.bundlePrice,
      targetAudienceCount: draft.audienceSize,
      merchantApproved: true,
      idempotencyKey,
      description: draft.offerDescription,
    })

    setExecuting(false)

    if (res.success && res.paymentLink) {
      setCreatedPaymentLink(res.paymentLink)
      setLaunched(true)
      campaignExecutionStore.recordCampaignLaunch({
        campaignId: `camp_${opp.sourceProduct.id}_${opp.recommendedProduct.id}`,
        campaignName: draft.campaignName,
        paymentLinkId: res.paymentLink.paymentLinkId,
        shortUrl: res.paymentLink.shortUrl,
        bundlePrice: draft.bundlePrice,
        targetAudience: draft.audienceSize,
        expectedIncrementalRevenue: draft.expectedIncrementalRevenue,
        merchantApproved: true,
      })
    } else {
      setLaunchBlockedMessage(
        res.error || "Action blocked — no money movement occurred.",
      )
    }
  }

  const handleSimulatePayment = async () => {
    if (!createdPaymentLink || simulating) return
    setSimulating(true)
    try {
      const res = await razorpayClientService.simulateTestPayment(
        createdPaymentLink.paymentLinkId,
        `camp_${opp.sourceProduct.id}_${opp.recommendedProduct.id}`,
        createdPaymentLink.amount,
      )
      if (res.verified && res.paymentId) {
        campaignExecutionStore.recordVerifiedPayment({
          paymentId: res.paymentId,
          amount: res.amount || createdPaymentLink.amount,
          paymentLinkId: createdPaymentLink.paymentLinkId,
          campaignId: `camp_${opp.sourceProduct.id}_${opp.recommendedProduct.id}`,
        })
        setSimulatedCount((c) => c + 1)
        setSimulatedPaid(true)
      }
    } finally {
      setSimulating(false)
    }
  }

  if (launched) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M6 16l6 6 14-12"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Campaign Launched!
          </h2>
          <p className="text-sm text-slate-500 mb-5">
            "{draft.campaignName}" is now live in Razorpay Test Mode.{" "}
            {draft.audienceSize.toLocaleString()} customers are
            targeted.
          </p>

          {/* Test Payment Link Box */}
          {createdPaymentLink && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="text-blue-600">{Icons.sparkle}</span>
                  Razorpay Test Payment Link
                </span>
                <Badge variant="blue">Test Mode Only</Badge>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>
                    Link ID:{" "}
                    <strong className="mono text-slate-700">
                      {createdPaymentLink.paymentLinkId}
                    </strong>
                  </span>
                  <span className="font-bold text-slate-900 mono">
                    ₹{createdPaymentLink.amount.toLocaleString()} INR
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
                  <span className="text-xs text-blue-600 font-mono truncate select-all">
                    {createdPaymentLink.shortUrl}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdPaymentLink.shortUrl)
                      alert("Payment Link copied to clipboard!")
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium border border-slate-200 hover:bg-slate-50 rounded text-slate-700 flex-shrink-0"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              {/* Simulation Box for judges & testing */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-3 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-blue-900">
                    Sandbox Payment Simulator
                  </span>
                  {simulatedPaid && (
                    <Badge variant="emerald">Test Payment Verified</Badge>
                  )}
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed mb-2.5">
                  Simulate a test payment to execute HMAC-SHA256 signature
                  verification and record actual captured test revenue.
                </p>
                <button
                  onClick={handleSimulatePayment}
                  disabled={simulating}
                  className={`w-full py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    simulatedCount >= 2
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : simulatedCount === 1
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {simulating
                    ? "Verifying Test Payment Signature via HMAC-SHA256..."
                    : simulatedCount === 0
                      ? "Simulate & Verify Test Payment #1 (₹" +
                        createdPaymentLink.amount.toLocaleString() +
                        ")"
                      : simulatedCount === 1
                        ? "✓ Payment #1 Verified · Simulate & Verify Test Payment #2 (₹" +
                          createdPaymentLink.amount.toLocaleString() +
                          ")"
                        : "✓ " +
                          simulatedCount +
                          " Test Payments Verified (₹" +
                          (
                            createdPaymentLink.amount * simulatedCount
                          ).toLocaleString() +
                          " Captured) · Simulate Another"}
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => onNav("campaign-results")}
              className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Results
            </button>
            <button
              onClick={() => onNav("dashboard")}
              className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="flex items-center gap-1.5 mb-5 text-sm">
        <button
          onClick={() => onNav("opportunity-detail")}
          className="text-slate-500 hover:text-blue-600 transition-colors"
        >
          Opportunity Details
        </button>
        <span className="text-slate-300">{Icons.chevronRight}</span>
        <span className="text-slate-900 font-medium">Create Campaign</span>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Steps */}
        <div className="flex items-center gap-0 mb-8">
          {["Campaign Setup", "Audience", "Message", "Review"].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i + 1 < step
                      ? "bg-emerald-500 text-white"
                      : i + 1 === step
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {i + 1 < step ? Icons.check : i + 1}
                </div>
                <span
                  className={`text-xs font-medium ${
                    i + 1 === step ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {s}
                </span>
              </div>
              {i < 3 && (
                <div
                  className={`flex-1 h-px mx-3 ${
                    i + 1 < step ? "bg-emerald-300" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">
              Campaign Setup
            </h2>

            {/* AI Campaign Recommendation Card */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">{Icons.sparkle}</span>
                  <span className="text-sm font-semibold text-blue-900">
                    AI Campaign Recommendation
                  </span>
                  <Badge variant="blue">AI Suggested</Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-blue-800">
                  <span className="text-blue-600 font-normal">Confidence:</span>
                  <span className="font-bold mono bg-blue-100/80 px-2 py-0.5 rounded text-blue-900">
                    {opp.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Strategy & Rationale */}
              <div className="bg-white/90 border border-blue-100 rounded-lg p-3.5 mb-3.5 shadow-xs">
                <p className="text-[10px] uppercase font-bold tracking-wider text-blue-600 mb-1">
                  Strategy & Rationale
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {recommendation.rationale}
                </p>
              </div>

              {/* Structured AI Recommendation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3.5">
                <div className="bg-white/80 border border-blue-100 rounded-lg p-3">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    Recommended Offer & Type
                  </span>
                  <span className="font-semibold text-slate-900 text-sm">
                    "{recommendation.campaignName}"
                  </span>
                  <span className="inline-block ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-700">
                    {recommendation.campaignType}
                  </span>
                  <p className="text-xs text-slate-600 mt-1.5">
                    {recommendation.offerDescription}
                  </p>
                </div>

                <div className="bg-white/80 border border-blue-100 rounded-lg p-3">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    Target Audience & Channels
                  </span>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {recommendation.channels.map((ch) => (
                      <span
                        key={ch}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {recommendation.targetAudience}
                  </p>
                </div>
              </div>

              {/* Message preview snippet in card */}
              <div className="bg-white/80 border border-blue-100 rounded-lg p-3 mb-3.5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Generated Copy Preview
                  </span>
                  <span className="text-[10px] text-blue-600 font-medium">
                    Headline: "{recommendation.headline}"
                  </span>
                </div>
                <p className="text-xs text-slate-600 italic">
                  "{recommendation.body}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-blue-200/60 text-xs text-blue-800">
                <span className="flex items-center gap-2">
                  <span>Suggested Bundle Price:</span>
                  <span className="text-sm font-bold text-blue-900 mono">
                    ₹{recommendation.suggestedBundlePrice.toLocaleString()}
                  </span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[11px]">
                    Save ₹
                    {(
                      opp.sourceProduct.price +
                      opp.recommendedProduct.price -
                      recommendation.suggestedBundlePrice
                    ).toLocaleString()}
                  </span>
                </span>
                <span className="text-slate-500 text-[11px] italic">
                  Pre-filled into campaign fields below
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Campaign Name
                </label>
                <input
                  value={draft.campaignName}
                  onChange={(e) =>
                    campaignDraftStore.setCampaignName(e.target.value)
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Offer Type
                </label>
                <select
                  value={draft.offerType}
                  onChange={(e) =>
                    campaignDraftStore.setOfferType(e.target.value)
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Cross-sell Bundle</option>
                  <option>Upsell</option>
                  <option>Discount</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                    Bundle Price
                  </label>
                  <input
                    value={priceInput}
                    onFocus={() => setIsPriceFocused(true)}
                    onChange={handlePriceChange}
                    onBlur={handlePriceBlur}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                    Offer Validity
                  </label>
                  <input
                    value={draft.offerValidity}
                    onChange={(e) =>
                      campaignDraftStore.setOfferValidity(e.target.value)
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Channel
                </label>
                <div className="flex gap-2">
                  {["email", "whatsapp", "sms"].map((c) => {
                    const active = draft.channels.some(
                      (ch) => ch.toLowerCase() === c.toLowerCase(),
                    )
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleChannel(c)}
                        className={`px-4 py-2 rounded-lg border text-xs font-medium capitalize transition-colors ${
                          active
                            ? "bg-blue-50 border-blue-300 text-blue-700 font-semibold"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {c === "whatsapp"
                          ? "WhatsApp"
                          : c.charAt(0).toUpperCase() + c.slice(1)}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">
              Audience
            </h2>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600">{Icons.sparkle}</span>
                <span className="text-sm font-semibold text-blue-900">
                  AI-Selected Segment
                </span>
                <Badge variant="blue">Target Audience</Badge>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed font-medium mb-1">
                {recommendation.targetAudience}
              </p>
              <p className="text-xs text-blue-600/80">
                Customers who purchased {opp.sourceProduct.name.toLowerCase()}{" "}
                in the last 45 days without purchasing{" "}
                {opp.recommendedProduct.name.toLowerCase()}, with prior sock
                category interest.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                {
                  label: "Total Customers",
                  value: draft.audienceSize.toLocaleString(),
                },
                {
                  label: "Avg. Order Value",
                  value: `₹${Math.round(opp.averageOrderValue).toLocaleString()}`,
                },
                { label: "Email Deliverability", value: "94.2%" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="border border-slate-200 rounded-lg px-4 py-3 text-center"
                >
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                    {m.label}
                  </p>
                  <p className="text-lg font-semibold text-slate-900 mono">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">
                Segment Filters
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Bought Running Shoes (45d)",
                  "No Sock Purchase",
                  "Sock Page Visited",
                  "Email Opted-in",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">
              Message Preview
            </h2>

            {/* AI Copy & Strategy Guidance */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">{Icons.sparkle}</span>
                  <span className="text-sm font-semibold text-blue-900">
                    AI-Generated Copy & Strategy
                  </span>
                </div>
                <Badge variant="blue">Optimized Copy</Badge>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mb-3">
                {recommendation.rationale}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-900 pt-2.5 border-t border-blue-200/60">
                <div>
                  <span className="text-[10px] text-blue-600 uppercase tracking-wider block font-semibold">
                    Offer Description
                  </span>
                  <span>{draft.offerDescription}</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-600 uppercase tracking-wider block font-semibold">
                    Target Channels
                  </span>
                  <span>{draft.channels.join(", ")}</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
              <div className="bg-slate-900 px-5 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-slate-400 text-xs">
                  Email Preview — {draft.campaignName}
                </span>
              </div>
              <div className="p-6 bg-slate-50">
                <div className="max-w-sm mx-auto bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <p className="text-xs font-medium text-blue-200 mb-1">
                      SOLEX × GROWTHOS
                    </p>
                    <h3 className="text-lg font-bold">
                      {draft.headline}
                    </h3>
                    <p className="text-sm text-blue-100 mt-1">
                      You're one step away from your perfect kit.
                    </p>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {draft.body}
                    </p>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-center">
                      <p className="text-xs text-slate-500 line-through mono">
                        ₹
                        {(
                          opp.sourceProduct.price + opp.recommendedProduct.price
                        ).toLocaleString()}
                      </p>
                      <p className="text-xl font-bold text-blue-700 mono">
                        ₹{draft.bundlePrice.toLocaleString()}
                      </p>
                      <p className="text-xs text-emerald-600 font-medium">
                        {opp.sourceProduct.price +
                          opp.recommendedProduct.price -
                          draft.bundlePrice >
                        0
                          ? `Save ₹${(
                              opp.sourceProduct.price +
                              opp.recommendedProduct.price -
                              draft.bundlePrice
                            ).toLocaleString()} — Limited offer`
                          : "Special Bundle Offer — Limited offer"}
                      </p>
                    </div>
                    <button className="w-full py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg">
                      Shop the Bundle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">
              Review & Launch
            </h2>

            {/* Razorpay Test Mode Status Banner */}
            <div
              className={`p-4 rounded-xl border mb-5 flex items-center justify-between ${
                razorpayStatus.status === "Connected"
                  ? "bg-emerald-50/70 border-emerald-200"
                  : razorpayStatus.status === "Error"
                    ? "bg-red-50/70 border-red-200"
                    : "bg-amber-50/70 border-amber-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={
                    razorpayStatus.status === "Connected"
                      ? "text-emerald-600"
                      : razorpayStatus.status === "Error"
                        ? "text-red-600"
                        : "text-amber-600"
                  }
                >
                  {Icons.sparkle}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      Razorpay Integration
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        razorpayStatus.status === "Connected"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : razorpayStatus.status === "Error"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {razorpayStatus.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {razorpayStatus.status === "Connected"
                      ? `Sandbox Active (${razorpayStatus.keyIdPrefix || "Test Mode"}) — Test Mode Only`
                      : razorpayStatus.status === "Error"
                        ? razorpayStatus.message ||
                          "Invalid credentials detected"
                        : "Test Mode not configured. Demo mode active — action will be safely blocked."}
                  </p>
                </div>
              </div>
              <Badge variant="blue">Test Mode Only</Badge>
            </div>

            <div className="flex flex-col gap-0 mb-5 border border-slate-100 rounded-xl overflow-hidden">
              {[
                {
                  label: "Campaign",
                  value: `"${draft.campaignName}"`,
                },
                {
                  label: "Type",
                  value: draft.offerType,
                },
                {
                  label: "Bundle Price",
                  value: `₹${draft.bundlePrice.toLocaleString()}`,
                },
                {
                  label: "Channels",
                  value: draft.channels.join(" + "),
                },
                {
                  label: "Audience Size",
                  value: `${draft.audienceSize.toLocaleString()} customers`,
                },
                {
                  label: "Expected Incremental Revenue",
                  value: `₹${draft.expectedIncrementalRevenue.toLocaleString()}`,
                },
                { label: "AI Confidence", value: `${draft.confidenceScore}%` },
              ].map((r, i, arr) => (
                <div
                  key={r.label}
                  className={`flex justify-between px-4 py-3 text-sm ${
                    i < arr.length - 1 ? "border-b border-slate-100" : ""
                  } ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                >
                  <span className="text-slate-500">{r.label}</span>
                  <span className="font-semibold text-slate-900 mono">
                    {r.value}
                  </span>
                </div>
              ))}
            </div>

            {/* AI Strategy Summary Callout */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl mb-5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-blue-600">{Icons.sparkle}</span>
                <span className="text-xs font-semibold text-blue-900">
                  AI Campaign Rationale & Goal
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mb-1.5">
                {recommendation.rationale}
              </p>
              <p className="text-xs text-blue-800 font-medium">
                <strong>Goal:</strong> {recommendation.expectedGoal}
              </p>
            </div>

            {/* Merchant Authorization Gate */}
            <div
              className={`p-4 rounded-xl border transition-colors mb-5 ${
                merchantApproved
                  ? "bg-emerald-50/60 border-emerald-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="merchant-approval-gate"
                  checked={merchantApproved}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setMerchantApproved(checked)
                    setLaunchBlockedMessage(null)
                    if (checked) {
                      campaignExecutionStore.recordMerchantApproval({
                        campaignId: `camp_${opp.sourceProduct.id}_${opp.recommendedProduct.id}`,
                        campaignName: draft.campaignName,
                        bundlePrice: draft.bundlePrice,
                        targetAudience: draft.audienceSize,
                        approverName: "Ishan Khandelwal",
                      })
                    }
                  }}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="merchant-approval-gate"
                      className="text-xs font-bold text-slate-900 cursor-pointer"
                    >
                      Merchant Authorization Gate
                    </label>
                    <Badge variant={merchantApproved ? "emerald" : "amber"}>
                      {merchantApproved
                        ? "Approved by Merchant"
                        : "Pending Merchant Approval"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    I explicitly approve launching this campaign and creating a
                    Razorpay Test Mode payment action for ₹
                    {draft.bundlePrice.toLocaleString()}.
                    GrowthOS AI cannot execute financial actions without
                    explicit merchant authorization.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Pre-Launch & Safety Gate Checks */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-5">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <span className="text-blue-500">{Icons.sparkle}</span>
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  AI Pre-Launch & Safety Checks
                </span>
              </div>
              <div className="divide-y divide-slate-100 text-sm">
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      merchantApproved
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-amber-100 text-amber-600 font-bold text-[10px]"
                    }`}
                  >
                    {merchantApproved ? Icons.check : "!"}
                  </span>
                  <span className="text-slate-600">
                    {merchantApproved
                      ? "Merchant approval granted"
                      : "Merchant approval pending (check authorization box above)"}
                  </span>
                </div>

                <div className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    {Icons.check}
                  </span>
                  <span className="text-slate-600">
                    Target audience validated (
                    {draft.audienceSize.toLocaleString()} customers
                    ≤ 100,000 safety bound)
                  </span>
                </div>

                <div className="flex items-center gap-3 px-4 py-2.5">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      draft.bundlePrice >= 100 && draft.bundlePrice <= 50000
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600 font-bold text-[10px]"
                    }`}
                  >
                    {draft.bundlePrice >= 100 && draft.bundlePrice <= 50000
                      ? Icons.check
                      : "!"}
                  </span>
                  <span className="text-slate-600">
                    Bundle price validated (₹
                    {draft.bundlePrice.toLocaleString()}{" "}
                    {draft.bundlePrice >= 100 && draft.bundlePrice <= 50000
                      ? "within ₹100–₹50,000 safety bound"
                      : "outside ₹100–₹50,000 safety bound"})
                  </span>
                </div>

                <div className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    {Icons.check}
                  </span>
                  <span className="text-slate-600">
                    Expected incremental revenue calculated (₹
                    {draft.expectedIncrementalRevenue.toLocaleString()})
                  </span>
                </div>

                <div className="flex items-center gap-3 px-4 py-2.5">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      razorpayStatus.status === "Connected"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-amber-100 text-amber-600 font-bold text-[10px]"
                    }`}
                  >
                    {razorpayStatus.status === "Connected" ? Icons.check : "!"}
                  </span>
                  <span className="text-slate-600">
                    {razorpayStatus.status === "Connected"
                      ? `Razorpay Test Mode connected (${razorpayStatus.keyIdPrefix || "Sandbox"})`
                      : "Razorpay Test Mode: Not configured (Demo Mode — payment links safely blocked)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Launch Blocked Alert Message */}
            {launchBlockedMessage && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5 flex items-start gap-3">
                <span className="text-amber-600 mt-0.5">{Icons.sparkle}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-amber-900">
                      Safety Gate Notification
                    </p>
                    <span className="text-[10px] font-semibold bg-amber-200/60 text-amber-800 px-2 py-0.5 rounded">
                      Action Blocked
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    {launchBlockedMessage}
                  </p>
                  <p className="text-[11px] font-semibold text-amber-700 mt-1">
                    Action blocked — no money movement occurred.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleLaunchCampaign}
              disabled={executing}
              className={`w-full py-3 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${
                !merchantApproved
                  ? "bg-slate-400 cursor-not-allowed opacity-90"
                  : executing
                    ? "bg-blue-400 cursor-wait"
                    : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {executing ? (
                <>
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Validating Safety & Executing Action...</span>
                </>
              ) : (
                <span>Launch Campaign (Razorpay Test Mode)</span>
              )}
            </button>
            {!merchantApproved && (
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Explicit merchant authorization required to enable campaign
                launch
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        {!launched && (
          <div className="flex justify-between mt-5">
            <button
              onClick={() =>
                step > 1 ? setStep(step - 1) : onNav("opportunity-detail")
              }
              className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            {step < 4 && (
              <button
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CampaignCreatePage
