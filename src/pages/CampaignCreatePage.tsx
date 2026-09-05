import { useState } from "react"
import type { Page } from "../types"
import type { CrossSellOpportunity } from "../types/dataFoundation"
import { getPrimaryOpportunity } from "../services/opportunityService"
import { Icons } from "../components/common/Icons"

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
            "Complete Your Run" is now live.{" "}
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
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Campaign Name
                </label>
                <input
                  defaultValue='"Complete Your Run"'
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Offer Type
                </label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                    defaultValue="₹2,799"
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
              </div>
              <p className="text-xs text-blue-700">
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
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
              <div className="bg-slate-900 px-5 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-slate-400 text-xs">
                  Email Preview — Complete Your Run
                </span>
              </div>
              <div className="p-6 bg-slate-50">
                <div className="max-w-sm mx-auto bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <p className="text-xs font-medium text-blue-200 mb-1">
                      SOLEX × GROWTHOS
                    </p>
                    <h3 className="text-lg font-bold">Complete Your Run 🏃</h3>
                    <p className="text-sm text-blue-100 mt-1">
                      You're one step away from your perfect kit.
                    </p>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      You recently grabbed a pair of running shoes from us —
                      great choice! Pair them with our performance running socks
                      for the ultimate comfort.
                    </p>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-center">
                      <p className="text-xs text-slate-500 line-through mono">
                        ₹3,199
                      </p>
                      <p className="text-xl font-bold text-blue-700 mono">
                        ₹2,799
                      </p>
                      <p className="text-xs text-emerald-600 font-medium">
                        Save ₹400 — Today only
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
            <div className="flex flex-col gap-0 mb-6 border border-slate-100 rounded-xl overflow-hidden">
              {[
                { label: "Campaign", value: '"Complete Your Run"' },
                { label: "Type", value: "Cross-sell Bundle" },
                {
                  label: "Bundle Price",
                  value: `₹${(opp.sourceProduct.price + Math.round(opp.recommendedProduct.price * 0.6)).toLocaleString()}`,
                },
                { label: "Channel", value: "Email + WhatsApp" },
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
