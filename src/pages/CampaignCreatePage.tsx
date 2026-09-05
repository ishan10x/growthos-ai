import { useState, useEffect } from "react"
import type { Page } from "../types"
import type { CrossSellOpportunity } from "../types/dataFoundation"
import type { CampaignRecommendation } from "../types/ai"
import { getPrimaryOpportunity } from "../services/opportunityService"
import { aiService } from "../services/aiService"
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
  const [channel, setChannel] = useState("email")
  const [launched, setLaunched] = useState(false)
  const opp = opportunity ?? getPrimaryOpportunity()
  const [recommendation, setRecommendation] = useState<CampaignRecommendation>(
    () => aiService.getCampaignRecommendationSync(opp),
  )

  useEffect(() => {
    let isMounted = true
    aiService.getCampaignRecommendation(opp).then((rec) => {
      if (isMounted) setRecommendation(rec)
    })
    return () => {
      isMounted = false
    }
  }, [opp])

  if (launched) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="bg-white border border-slate-200 rounded-2xl p-12 max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
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
          <p className="text-sm text-slate-500 mb-6">
            "{recommendation.campaignName}" is now live.{" "}
            {opp.estimatedEligibleCustomers.toLocaleString()} customers will
            receive the campaign over the next 24 hours.
          </p>
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
                  key={recommendation.campaignName}
                  defaultValue={recommendation.campaignName}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Offer Type
                </label>
                <select
                  defaultValue={
                    recommendation.campaignType === "bundle"
                      ? "Cross-sell Bundle"
                      : recommendation.campaignType === "upsell"
                        ? "Upsell"
                        : "Discount"
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
                    key={recommendation.suggestedBundlePrice}
                    defaultValue={`₹${recommendation.suggestedBundlePrice.toLocaleString()}`}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                    Offer Validity
                  </label>
                  <input
                    defaultValue="7 days"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Channel
                </label>
                <div className="flex gap-2">
                  {["email", "whatsapp", "sms"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setChannel(c)}
                      className={`px-4 py-2 rounded-lg border text-xs font-medium capitalize transition-colors ${
                        channel === c
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {c === "whatsapp"
                        ? "WhatsApp"
                        : c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                  ))}
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
                  value: opp.estimatedEligibleCustomers.toLocaleString(),
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
                  <span>{recommendation.offerDescription}</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-600 uppercase tracking-wider block font-semibold">
                    Target Channels
                  </span>
                  <span>{recommendation.channels.join(", ")}</span>
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
                  Email Preview — {recommendation.campaignName}
                </span>
              </div>
              <div className="p-6 bg-slate-50">
                <div className="max-w-sm mx-auto bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <p className="text-xs font-medium text-blue-200 mb-1">
                      SOLEX × GROWTHOS
                    </p>
                    <h3 className="text-lg font-bold">
                      {recommendation.headline}
                    </h3>
                    <p className="text-sm text-blue-100 mt-1">
                      You're one step away from your perfect kit.
                    </p>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {recommendation.body}
                    </p>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-center">
                      <p className="text-xs text-slate-500 line-through mono">
                        ₹
                        {(
                          opp.sourceProduct.price + opp.recommendedProduct.price
                        ).toLocaleString()}
                      </p>
                      <p className="text-xl font-bold text-blue-700 mono">
                        ₹{recommendation.suggestedBundlePrice.toLocaleString()}
                      </p>
                      <p className="text-xs text-emerald-600 font-medium">
                        Save ₹
                        {(
                          opp.sourceProduct.price +
                          opp.recommendedProduct.price -
                          recommendation.suggestedBundlePrice
                        ).toLocaleString()}{" "}
                        — Limited offer
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
            <div className="flex flex-col gap-0 mb-5 border border-slate-100 rounded-xl overflow-hidden">
              {[
                {
                  label: "Campaign",
                  value: `"${recommendation.campaignName}"`,
                },
                {
                  label: "Type",
                  value:
                    recommendation.campaignType === "bundle"
                      ? "Cross-sell Bundle"
                      : recommendation.campaignType.charAt(0).toUpperCase() +
                        recommendation.campaignType.slice(1),
                },
                {
                  label: "Bundle Price",
                  value: `₹${recommendation.suggestedBundlePrice.toLocaleString()}`,
                },
                {
                  label: "Channels",
                  value: recommendation.channels.join(" + "),
                },
                {
                  label: "Audience Size",
                  value: `${opp.estimatedEligibleCustomers.toLocaleString()} customers`,
                },
                {
                  label: "Expected Incremental Revenue",
                  value: `₹${opp.estimatedIncrementalRevenue.toLocaleString()}`,
                },
                { label: "AI Confidence", value: `${opp.confidenceScore}%` },
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

            {/* AI Pre-Launch Checks */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-5">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <span className="text-blue-500">{Icons.sparkle}</span>
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  AI Pre-Launch Checks
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  "Merchant approval pending",
                  "Target audience validated",
                  "Bundle price validated",
                  "Expected revenue calculated",
                  "Razorpay integration connected",
                ].map((check) => (
                  <div
                    key={check}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      {Icons.check}
                    </span>
                    <span className="text-sm text-slate-600">{check}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setLaunched(true)}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Launch Campaign
            </button>
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
