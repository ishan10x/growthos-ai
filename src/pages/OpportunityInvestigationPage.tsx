import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { Page } from "../types"
import { Icons } from "../components/common/Icons"
import { Badge } from "../components/common/Badge"
import { ConfidenceMeter } from "../components/common/ConfidenceMeter"
import {
  customerSegmentData,
  investigationMetrics,
  investigationReasoning,
} from "../data/mockData"

export interface OpportunityInvestigationPageProps {
  onNav: (p: Page) => void
}

export function OpportunityInvestigationPage({
  onNav,
}: OpportunityInvestigationPageProps) {
  const [actionState, setActionState] =
    useState<"idle" | "approved" | "rejected">("idle")

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-5 text-sm">
        <button
          onClick={() => onNav("opportunities")}
          className="text-slate-500 hover:text-blue-600 transition-colors"
        >
          Opportunities
        </button>
        <span className="text-slate-300">{Icons.chevronRight}</span>
        <span className="text-slate-900 font-medium">
          Running Shoes → Running Socks
        </span>
        <span className="ml-2">
          <Badge variant="info">
            <span>{Icons.sparkle}</span> AI Investigation
          </Badge>
        </span>
      </div>

      {/* Hero header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info">
                <span>{Icons.sparkle}</span> AI Identified · Aug 31, 2026
              </Badge>
              <Badge variant="success">High Confidence · 87%</Badge>
              <Badge variant="muted">Cross-sell</Badge>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">
              Running Shoes → Running Socks
            </h1>
            <p className="text-sm text-slate-500">
              GrowthOS detected a cross-sell opportunity by analyzing
              transaction patterns, browsing behavior, and category benchmarks
              across your customer base.
            </p>
          </div>
          <div className="flex-shrink-0 ml-8 bg-blue-50 border border-blue-100 rounded-2xl px-7 py-5 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Expected Incremental Revenue
            </p>
            <p className="text-4xl font-bold text-blue-700 mono">₹42,600</p>
            <p className="text-xs text-slate-400 mt-1.5">
              Based on 31% target attach rate
            </p>
          </div>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-100">
          {investigationMetrics.map((m) => (
            <div key={m.label} className="flex flex-col gap-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider leading-tight">
                {m.label}
              </p>
              <p className="text-xl font-bold text-slate-900 mono">{m.value}</p>
              <p className="text-[10px] text-slate-400">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left: Reasoning + Chart */}
        <div className="col-span-2 flex flex-col gap-5">
          {/* Attach rate visual */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Attach Rate — Current vs. Benchmark vs. Target
            </h2>
            <div className="flex items-end gap-6 mb-4">
              {[
                { label: "Current (SoleX)", value: 16, color: "bg-slate-300" },
                { label: "Category Median", value: 29, color: "bg-amber-400" },
                {
                  label: "Target (Post-Campaign)",
                  value: 31,
                  color: "bg-blue-500",
                },
              ].map((b) => (
                <div
                  key={b.label}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span className="text-sm font-bold text-slate-900 mono">
                    {b.value}%
                  </span>
                  <div
                    className="w-full rounded-t-md"
                    style={{ height: `${b.value * 4}px` }}
                  >
                    <div className={`w-full h-full rounded-t-md ${b.color}`} />
                  </div>
                  <span className="text-[10px] text-slate-500 text-center leading-tight">
                    {b.label}
                  </span>
                </div>
              ))}
              <div className="flex-1" />
              <div className="flex-1" />
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
              <p className="text-xs text-amber-800 font-medium">
                Closing the attach rate gap from 16% → 31% unlocks ~427
                additional sock orders and ₹42,600 in incremental revenue.
              </p>
            </div>
          </div>

          {/* Why did I find this? */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                {Icons.sparkle}
              </div>
              <h2 className="text-base font-semibold text-slate-900">
                Why did I find this?
              </h2>
            </div>

            {/* Plain-language AI narrative */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 mb-5">
              <p className="text-sm text-slate-700 leading-relaxed">
                I analyzed{" "}
                <span className="font-semibold text-slate-900">
                  18,420 orders
                </span>{" "}
                over the last 90 days. Customers who purchased running shoes
                frequently purchased running socks within 14 days. Your current
                attach rate is{" "}
                <span className="font-semibold text-slate-900">16%</span>,
                compared with a{" "}
                <span className="font-semibold text-slate-900">
                  29% category benchmark
                </span>
                . This indicates a strong cross-sell opportunity.
              </p>
            </div>

            {/* Supporting evidence */}
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-3">
              Supporting Evidence
            </p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                {
                  signal: "Co-purchase correlation",
                  value: "r = 0.74",
                  note: "Well above 0.5 threshold",
                  variant: "info" as const,
                },
                {
                  signal: "Purchase frequency",
                  value: "2.3× higher LTV",
                  note: "Customers who buy both",
                  variant: "info" as const,
                },
                {
                  signal: "Recency",
                  value: "45 days",
                  note: "Avg. window post shoe purchase",
                  variant: "muted" as const,
                },
                {
                  signal: "Category benchmark",
                  value: "13pp gap",
                  note: "SoleX 16% vs. median 29%",
                  variant: "warning" as const,
                },
              ].map((e) => (
                <div
                  key={e.signal}
                  className="border border-slate-100 rounded-lg px-4 py-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {e.signal}
                    </span>
                    <Badge variant={e.variant}>{e.value}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{e.note}</p>
                </div>
              ))}
            </div>

            {/* Detailed reasoning panels */}
            <div className="flex flex-col gap-3">
              {investigationReasoning.map((r, i) => (
                <div
                  key={i}
                  className="border border-slate-100 rounded-xl overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <span className="text-base">{r.icon}</span>
                    <div className="flex-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {r.signal}
                      </span>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">
                        {r.summary}
                      </p>
                    </div>
                    <Badge variant={r.statVariant}>{r.stat}</Badge>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {r.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer pattern chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              Customer Segment Breakdown
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Orders analyzed by segment — Running segment has highest attach
              rate potential
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={customerSegmentData}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F1F5F9"
                  vertical={false}
                />
                <XAxis
                  dataKey="segment"
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #E2E8F0",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="orders"
                  name="Orders"
                  fill="#2563EB"
                  radius={[4, 4, 0, 0]}
                  opacity={0.82}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right sidebar: Confidence + Recommended Action */}
        <div className="flex flex-col gap-4">
          {/* AI Confidence */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              AI Confidence
            </h2>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="10"
                    strokeDasharray={`${87 * 2.51} ${100 * 2.51 - 87 * 2.51}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900 mono">
                    87%
                  </span>
                  <span className="text-[10px] text-slate-400">confidence</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-xs">
              {[
                { factor: "Data volume", score: 94 },
                { factor: "Signal strength", score: 88 },
                { factor: "Seasonal fit", score: 82 },
                { factor: "Historical accuracy", score: 79 },
              ].map((f) => (
                <div key={f.factor}>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>{f.factor}</span>
                    <span className="font-medium text-slate-800 mono">
                      {f.score}%
                    </span>
                  </div>
                  <ConfidenceMeter value={f.score} />
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Action */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            {/* AI recommendation header — clearly marks as AI-generated, not executed */}
            <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-slate-100">
              <span className="text-blue-500">{Icons.sparkle}</span>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                AI Recommended Action
              </span>
              <span className="ml-auto">
                <Badge variant="warning">Pending Review</Badge>
              </span>
            </div>

            {actionState === "idle" && (
              <>
                {/* Campaign name */}
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                  Recommended Campaign
                </p>
                <p className="text-sm font-bold text-slate-900 mb-4">
                  "Complete Your Run"
                </p>

                {/* Bundle pricing */}
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Bundle Pricing
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <span className="text-slate-600">Running Shoes</span>
                      <span className="text-slate-700 mono font-medium">
                        ₹2,499
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <span className="text-slate-600">Running Socks</span>
                      <span className="text-slate-700 mono font-medium">
                        ₹499
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 bg-blue-50">
                      <span className="text-sm font-semibold text-slate-900">
                        Bundle Price
                      </span>
                      <span className="text-base font-bold text-blue-700 mono">
                        ₹2,799
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5 flex justify-between items-center text-sm mb-4">
                  <span className="text-emerald-700 font-medium">
                    Expected AOV increase
                  </span>
                  <span className="font-bold text-emerald-700 mono">+₹300</span>
                </div>

                {/* Projected outcome — labelled as expected, not actual */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-5">
                  <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold mb-2">
                    Expected Outcome — AI Projection
                  </p>
                  <div className="flex flex-col gap-0 text-xs">
                    {[
                      { label: "Customers targeted", value: "2,840" },
                      { label: "Expected purchases", value: "~427" },
                      {
                        label: "Expected incremental revenue",
                        value: "₹42,600",
                      },
                      { label: "Channel", value: "Email + WhatsApp" },
                    ].map((r) => (
                      <div
                        key={r.label}
                        className="flex justify-between py-1.5 border-b border-blue-100/70 last:border-0"
                      >
                        <span className="text-slate-500">{r.label}</span>
                        <span className="font-semibold text-slate-800 mono">
                          {r.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions — Reject · Modify · Approve & Launch (primary) */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setActionState("approved")
                      onNav("campaign-create")
                    }}
                    className="w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Approve & Launch
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onNav("campaign-create")}
                      className="py-2.5 border border-slate-200 bg-white text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Modify
                    </button>
                    <button
                      onClick={() => setActionState("rejected")}
                      className="py-2.5 border border-red-100 text-red-500 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </>
            )}

            {actionState === "approved" && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  {Icons.check}
                </div>
                <p className="text-sm font-semibold text-emerald-700">
                  Approved — Campaign Launching
                </p>
                <p className="text-xs text-slate-400">
                  GrowthOS is setting up the campaign. You'll be notified when
                  it's live.
                </p>
                <button
                  onClick={() => onNav("campaign-create")}
                  className="mt-1 text-xs text-blue-600 font-medium hover:text-blue-700"
                >
                  Configure campaign →
                </button>
              </div>
            )}

            {actionState === "rejected" && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                  ✕
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  Opportunity Rejected
                </p>
                <p className="text-xs text-slate-400">
                  GrowthOS will factor this feedback into future
                  recommendations.
                </p>
                <button
                  onClick={() => setActionState("idle")}
                  className="mt-1 text-xs text-blue-600 font-medium hover:text-blue-700"
                >
                  Undo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function OpportunityDetailPage({
  onNav,
}: OpportunityInvestigationPageProps) {
  return <OpportunityInvestigationPage onNav={onNav} />
}

export default OpportunityInvestigationPage
