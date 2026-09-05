import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { StatCard } from "../components/common/StatCard"
import { SectionHeader } from "../components/common/SectionHeader"
import {
  revenueData,
  conversionData,
  customerSegmentData,
} from "../data/mockData"

export function AnalyticsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Comprehensive performance analytics for SoleX
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard
          label="Total Revenue"
          value="₹18.4L"
          change="+12.4%"
          changeLabel="vs. last month"
          positive
        />
        <StatCard
          label="Orders Placed"
          value="6,480"
          change="+9.2%"
          changeLabel="vs. last month"
          positive
        />
        <StatCard
          label="Avg. Order Value"
          value="₹2,840"
          change="+₹340"
          changeLabel="vs. last month"
          positive
        />
        <StatCard
          label="Refund Rate"
          value="2.1%"
          change="-0.4%"
          changeLabel="vs. last month"
          positive
        />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <SectionHeader
            title="Revenue Trend"
            subtitle="Monthly revenue — Last 12 months"
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={revenueData}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
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
                formatter={(v: number) => [
                  "₹" + (v / 100000).toFixed(1) + "L",
                  "Revenue",
                ]}
                contentStyle={{
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="#2563EB"
                radius={[3, 3, 0, 0]}
                opacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <SectionHeader title="Conversion Rate" subtitle="Weekly trend" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={conversionData}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
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
                domain={[6, 10]}
                tickFormatter={(v) => v + "%"}
                tick={{ fontSize: 10, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                formatter={(v: number) => [v + "%", "Conv. Rate"]}
                contentStyle={{
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981", r: 3 }}
                name="Conv. Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <SectionHeader
          title="Segment Performance"
          subtitle="Revenue and order breakdown by customer segment"
        />
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {[
                "Segment",
                "Customers",
                "Avg. Orders",
                "Avg. AOV",
                "Total Revenue",
                "Growth",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customerSegmentData.map((s, i) => (
              <tr
                key={s.segment}
                className="border-b border-slate-50 last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full bg-blue-500"
                      style={{ opacity: 1 - i * 0.15 }}
                    />
                    <span className="text-sm font-medium text-slate-900">
                      {s.segment}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 mono">
                  {s.customers.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 mono">
                  {(s.orders / s.customers).toFixed(1)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 mono">
                  ₹{s.aov.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900 mono">
                  ₹{((s.customers * s.aov) / 100000).toFixed(1)}L
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold text-emerald-600 mono">
                    +{(8 + i * 2.3).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AnalyticsPage
