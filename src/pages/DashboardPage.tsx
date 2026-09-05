import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { Page } from "../types"
import type { CrossSellOpportunity } from "../types/dataFoundation"
import { Icons } from "../components/common/Icons"
import { Badge } from "../components/common/Badge"
import { StatCard } from "../components/common/StatCard"
import { SectionHeader } from "../components/common/SectionHeader"
import { ConfidenceMeter } from "../components/common/ConfidenceMeter"
import { AICommandBar } from "../components/layout/AICommandBar"
import { revenueData, customerSegmentData } from "../data/mockData"
import { formatRevenue } from "../utils/formatters"
import {
  getCalculatedOpportunities,
  getPrimaryOpportunity,
} from "../services/opportunityService"

export interface DashboardPageProps {
  onNav: (p: Page) => void
  onSelectOpportunity?: (opp: CrossSellOpportunity) => void
}

export function DashboardPage({
  onNav,
  onSelectOpportunity,
}: DashboardPageProps) {
  const opportunities = getCalculatedOpportunities()
  const primaryOpp = getPrimaryOpportunity()
  const secondaryOpps = opportunities.filter(
    (o) =>
      !(
        o.sourceProduct.id === primaryOpp.sourceProduct.id &&
        o.recommendedProduct.id === primaryOpp.recommendedProduct.id
      ),
  )

  const totalCalculatedRevenue = opportunities.reduce(
    (sum, o) => sum + o.estimatedIncrementalRevenue,
    0,
  )

  const aiActivities = [
    {
      time: "2m ago",
      icon: Icons.sparkle,
      text: "New cross-sell opportunity identified",
      label: `${primaryOpp.sourceProduct.name} → ${primaryOpp.recommendedProduct.name}`,
      status: "new",
    },
    {
      time: "15m ago",
      icon: Icons.info,
      text: "Customer segment analyzed",
      label: `${primaryOpp.estimatedEligibleCustomers.toLocaleString()} eligible customers`,
      status: "info",
    },
    {
      time: "1h ago",
      icon: Icons.check,
      text: "Campaign recommendation generated",
      label: '"Complete Your Run"',
      status: "success",
    },
    {
      time: "3h ago",
      icon: Icons.bell,
      text: "Merchant approval required",
      label: "Review & Launch",
      status: "warning",
    },
  ]

  const handleInvestigate = (opp: CrossSellOpportunity) => {
    onSelectOpportunity?.(opp)
    onNav("opportunity-investigate")
  }

  const handleLaunch = (opp: CrossSellOpportunity) => {
    onSelectOpportunity?.(opp)
    onNav("campaign-create")
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          AI-powered growth insights for SoleX · Last updated 2 minutes ago
        </p>
      </div>

      {/* AI Command Bar */}
      <AICommandBar onNav={onNav} />

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Revenue"
          value="₹18.4L"
          change="+12.4%"
          changeLabel="vs last month"
          positive
        />
        <StatCard
          label="Average Order Value"
          value="₹2,840"
          change="+₹340"
          changeLabel="vs last month"
          positive
        />
        <StatCard
          label="Conversion Rate"
          value="8.7%"
          change="+1.8%"
          changeLabel="vs last month"
          positive
        />
        <div className="bg-blue-600 border border-blue-700 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-blue-200 uppercase tracking-wider">
              Estimated Revenue Potential
            </p>
            <span className="text-blue-300">{Icons.sparkle}</span>
          </div>
          <p className="text-2xl font-semibold text-white mono">
            ₹{(totalCalculatedRevenue / 100000).toFixed(2)}L
          </p>
          <p className="text-xs text-blue-200">
            Across {opportunities.length} identified opportunities
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <SectionHeader
            title="Revenue — Last 30 Days"
            subtitle="Daily revenue vs. previous period"
            action={
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  30D
                </button>
                <button className="px-3 py-1.5 text-xs bg-blue-600 text-white border border-blue-700 rounded-lg">
                  MTD
                </button>
              </div>
            }
          />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={revenueData}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="prevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F1F5F9"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => "₹" + (v / 100000).toFixed(1) + "L"}
                tick={{ fontSize: 10, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                formatter={(value: number) => [formatRevenue(value), ""]}
                contentStyle={{
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: "JetBrains Mono",
                }}
                labelStyle={{ color: "#64748B", fontSize: 11 }}
              />
              <Area
                type="monotone"
                dataKey="prev"
                stroke="#CBD5E1"
                strokeWidth={1.5}
                fill="url(#prevGrad)"
                name="Prev Period"
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563EB"
                strokeWidth={2}
                fill="url(#revGrad)"
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <SectionHeader
            title="AI Activity"
            subtitle="Recent decisions"
            action={
              <button
                onClick={() => onNav("ai-activity")}
                className="text-xs text-blue-600 font-medium hover:text-blue-700"
              >
                View all
              </button>
            }
          />
          <div className="flex flex-col gap-3">
            {aiActivities.map((a, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div
                  className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    a.status === "new"
                      ? "bg-blue-100 text-blue-600"
                      : a.status === "success"
                        ? "bg-emerald-100 text-emerald-600"
                        : a.status === "warning"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 font-medium leading-snug">
                    {a.text}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.label}</p>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0">
                  {a.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Opportunity Card */}
        <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <SectionHeader
            title="AI Opportunities"
            subtitle="Revenue opportunities identified by AI"
            action={
              <Badge variant="info">
                <span>{Icons.sparkle}</span> {opportunities.length} active
              </Badge>
            }
          />
          {/* Primary opportunity */}
          <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-5 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="info">
                    <span>{Icons.sparkle}</span> AI Identified
                  </Badge>
                  <Badge variant="success">High Confidence</Badge>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mt-2">
                  {primaryOpp.sourceProduct.name} →{" "}
                  {primaryOpp.recommendedProduct.name}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Cross-sell opportunity based on purchase pattern analysis
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-700 mono">
                  ₹{primaryOpp.estimatedIncrementalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Expected incremental revenue
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              {[
                {
                  label: "Potential Customers",
                  value: primaryOpp.estimatedEligibleCustomers.toLocaleString(),
                },
                {
                  label: "Current Attach Rate",
                  value: `${(primaryOpp.attachRate * 100).toFixed(0)}%`,
                },
                {
                  label: "Target Attach Rate",
                  value: "31%",
                },
                {
                  label: "AI Confidence",
                  value: `${primaryOpp.confidenceScore}%`,
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2.5"
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

            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>AI Confidence Score</span>
                <span className="font-medium text-slate-700">
                  {primaryOpp.confidenceScore}%
                </span>
              </div>
              <ConfidenceMeter value={primaryOpp.confidenceScore} />
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => handleInvestigate(primaryOpp)}
                className="flex-1 px-4 py-2.5 border border-slate-200 bg-white text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Investigate
              </button>
              <button
                onClick={() => handleLaunch(primaryOpp)}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-sm font-semibold text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Launch Campaign
              </button>
            </div>
          </div>

          {/* Other opportunities */}
          <div className="grid grid-cols-2 gap-3">
            {secondaryOpps.map((o) => (
              <div
                key={`${o.sourceProduct.id}:${o.recommendedProduct.id}`}
                onClick={() => handleInvestigate(o)}
                className="border border-slate-200 rounded-lg p-3.5 hover:border-blue-200 hover:bg-blue-50/20 transition-colors cursor-pointer"
              >
                <p className="text-sm font-medium text-slate-800 mb-2">
                  {o.sourceProduct.name} → {o.recommendedProduct.name}
                </p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-500">
                    {o.estimatedEligibleCustomers.toLocaleString()} customers
                  </span>
                  <span className="text-sm font-semibold text-blue-700 mono">
                    ₹{o.estimatedIncrementalRevenue.toLocaleString()}
                  </span>
                </div>
                <ConfidenceMeter value={o.confidenceScore} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <SectionHeader
            title="Top Segments"
            subtitle="By revenue contribution"
          />
          <div className="flex flex-col gap-3">
            {customerSegmentData.map((s, i) => (
              <div key={s.segment} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-300 mono w-4">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">
                      {s.segment}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 mono">
                      ₹{((s.customers * s.aov) / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(s.customers / 3200) * 100}%`,
                        opacity: 1 - i * 0.12,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
