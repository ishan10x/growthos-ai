import {
  AreaChart,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { Page } from "../types"
import { Icons } from "../components/common/Icons"
import { Badge } from "../components/common/Badge"
import { StatCard } from "../components/common/StatCard"
import { SectionHeader } from "../components/common/SectionHeader"
import { campaignsList, campaignResultsTimeline } from "../data/mockData"

export interface CampaignResultsPageProps {
  onNav: (p: Page) => void
}

export function CampaignResultsPage({ onNav }: CampaignResultsPageProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track performance across all AI-generated campaigns
          </p>
        </div>
        <button
          onClick={() => onNav("campaign-create")}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          {Icons.plus} New Campaign
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatCard label="Total Revenue Before" value="₹18.4L" />
        <StatCard
          label="Revenue After"
          value="₹21.3L"
          change="+₹2.9L"
          changeLabel="incremental"
          positive
        />
        <StatCard
          label="AOV Increase"
          value="+₹300"
          change="+10.5%"
          changeLabel="vs. baseline"
          positive
        />
        <StatCard
          label="Conversion Uplift"
          value="+3.5%"
          change="+1.8pp"
          changeLabel="vs. baseline"
          positive
        />
      </div>

      {/* Expected vs Actual callout */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-4 bg-blue-50/60 border border-blue-100 rounded-xl px-5 py-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center flex-shrink-0">
            {Icons.sparkle}
          </div>
          <div>
            <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold mb-0.5">
              Expected Result
            </p>
            <p className="text-[10px] text-slate-400 mb-1">
              Expected Incremental Revenue
            </p>
            <p className="text-2xl font-bold text-blue-700 mono">₹42,600</p>
            <p className="text-xs text-slate-400 mt-0.5">
              AI projection before launch
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            {Icons.check}
          </div>
          <div>
            <p className="text-[10px] text-emerald-600 uppercase tracking-wider font-semibold mb-0.5">
              Actual Result
            </p>
            <p className="text-[10px] text-slate-400 mb-1">
              Actual Incremental Revenue
            </p>
            <p className="text-2xl font-bold text-emerald-700 mono">₹47,200</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified · attributable to campaign
            </p>
          </div>
        </div>
      </div>

      {/* AI result message */}
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 mb-6">
        <span className="text-emerald-500 flex-shrink-0">{Icons.sparkle}</span>
        <p className="text-sm text-emerald-800 font-medium">
          Campaign performed{" "}
          <span className="font-bold">11% better than predicted.</span> GrowthOS
          has updated its model based on these results.
        </p>
      </div>

      {/* Campaigns table */}
      <div className="bg-white border border-slate-200 rounded-xl mb-5 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            All Campaigns
          </h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-xs text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              {Icons.filter} Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-xs text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              {Icons.export} Export
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {[
                "Campaign",
                "Status",
                "Customers Targeted",
                "Purchases",
                "Actual Incr. Revenue",
                "Conv. Uplift",
                "ROI",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaignsList.map((c) => (
              <tr
                key={c.name}
                className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-5 py-4 text-sm font-medium text-slate-900">
                  {c.name}
                </td>
                <td className="px-5 py-4">
                  <Badge
                    variant={
                      c.status === "active"
                        ? "success"
                        : c.status === "completed"
                          ? "muted"
                          : "warning"
                    }
                  >
                    {c.status}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-sm text-slate-700 mono">
                  {c.customers.toLocaleString()}
                </td>
                <td className="px-5 py-4 text-sm text-slate-700 mono">
                  {c.purchases || "—"}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-900 mono">
                  {c.revenue}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-emerald-600 mono">
                  {c.uplift}
                </td>
                <td className="px-5 py-4 text-sm font-bold text-blue-700 mono">
                  {c.roi}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Active campaign details */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <SectionHeader
            title='"Complete Your Run" — Performance'
            subtitle="Active campaign · Launched Aug 31, 2026"
          />
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Customers Targeted", value: "2,840" },
              { label: "Purchases Made", value: "184" },
              { label: "Conversion Rate", value: "6.5%" },
            ].map((m) => (
              <div
                key={m.label}
                className="border border-slate-200 rounded-lg px-3 py-2.5 text-center"
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
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={campaignResultsTimeline}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="afterGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F1F5F9"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => "₹" + (v / 1000).toFixed(0) + "K"}
                tick={{ fontSize: 10, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="before"
                stroke="#CBD5E1"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                name="Before"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="after"
                stroke="#10B981"
                strokeWidth={2}
                name="After Campaign"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <SectionHeader
            title="Revenue Impact Breakdown"
            subtitle='"Complete Your Run" — verified results'
          />

          {/* Key campaign outcomes */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Customers Targeted", value: "2,840" },
              { label: "Purchases", value: "184" },
              { label: "Conversion Uplift", value: "+3.5%" },
            ].map((m) => (
              <div
                key={m.label}
                className="border border-slate-200 rounded-lg px-3 py-2.5 text-center"
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

          <div className="flex flex-col gap-0 mb-4 border border-slate-100 rounded-xl overflow-hidden">
            {[
              {
                label: "Revenue Before Campaign",
                value: "₹18.4L",
                color: "text-slate-700",
                note: "Baseline (30d pre-campaign)",
              },
              {
                label: "Actual Incremental Revenue",
                value: "+₹47,200",
                color: "text-emerald-600",
                note: "Verified · attributable to campaign",
              },
              {
                label: "Revenue After Campaign",
                value: "₹18.87L",
                color: "text-blue-700",
                note: "Total (post-campaign)",
              },
            ].map((r, i) => (
              <div
                key={r.label}
                className={`flex justify-between items-center px-4 py-3 ${
                  i < 2 ? "border-b border-slate-100" : ""
                } ${i % 2 === 1 ? "bg-slate-50/50" : "bg-white"}`}
              >
                <div>
                  <span className="text-sm text-slate-700 font-medium">
                    {r.label}
                  </span>
                  <p className="text-[10px] text-slate-400">{r.note}</p>
                </div>
                <span className={`text-lg font-bold mono ${r.color}`}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>

          {/* AI Forecast vs Actual */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-3">
              AI Forecast vs. Actual
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">
                  Expected
                </p>
                <p className="text-lg font-bold text-blue-600 mono">₹42,600</p>
                <p className="text-[10px] text-slate-400">AI projection</p>
              </div>
              <div className="text-center border-l border-slate-200">
                <p className="text-[10px] text-emerald-600 uppercase tracking-wider mb-1">
                  Actual
                </p>
                <p className="text-lg font-bold text-emerald-600 mono">
                  ₹47,200
                </p>
                <p className="text-[10px] text-emerald-500 font-medium">
                  +11% vs. forecast
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "AOV Increase", value: "+₹300" },
              { label: "Campaign ROI", value: "4.7×" },
            ].map((m) => (
              <div
                key={m.label}
                className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2.5"
              >
                <p className="text-[10px] text-emerald-500 uppercase tracking-wider mb-1">
                  {m.label}
                </p>
                <p className="text-base font-bold text-slate-900 mono">
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignResultsPage
