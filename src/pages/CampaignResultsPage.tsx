import { useState, useEffect } from "react"
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
import type { CampaignResultModel } from "../types/razorpay"
import { razorpayClientService } from "../services/razorpayClientService"
import { Icons } from "../components/common/Icons"
import { Badge } from "../components/common/Badge"
import { StatCard } from "../components/common/StatCard"
import { SectionHeader } from "../components/common/SectionHeader"
import { campaignsList, campaignResultsTimeline } from "../data/mockData"
import { campaignExecutionStore } from "../services/campaignExecutionStore"

export interface CampaignResultsPageProps {
  onNav: (p: Page) => void
}

export function CampaignResultsPage({ onNav }: CampaignResultsPageProps) {
  const [razorpayModel, setRazorpayModel] = useState<CampaignResultModel>(
    () => {
      const store = campaignExecutionStore.getState()
      if (store.status !== "idle") {
        return {
          campaignId: store.campaignId,
          campaignName: store.campaignName,
          expectedIncrementalRevenue: store.expectedIncrementalRevenue,
          targetAudience: store.targetAudience,
          verifiedPaymentCount: store.verifiedPaymentCount,
          verifiedTestRevenue: store.verifiedTestRevenue,
          actualTestRevenueCaptured: store.verifiedTestRevenue,
          paymentLinkId:
            store.paymentLinkId || "plink_test_complete_your_run_01",
          paymentIds: store.verifiedPaymentIds,
          lastPaymentAt:
            store.lastVerifiedPaymentTimestamp || "2026-08-31T15:10:00.000Z",
          verificationStatus: "verified",
          testMode: true,
          payments: store.verifiedPaymentIds.map((pid) => ({
            campaignId: store.campaignId,
            paymentLinkId:
              store.paymentLinkId || "plink_test_complete_your_run_01",
            paymentId: pid,
            amount: store.bundlePrice,
            currency: "INR",
            status: "captured",
            timestamp:
              store.lastVerifiedPaymentTimestamp || new Date().toISOString(),
            verificationStatus: "verified",
            testMode: true,
          })),
        }
      }
      return {
        campaignId: "camp_prod_running_shoes_prod_running_socks",
        campaignName: "Complete Your Run",
        expectedIncrementalRevenue: 41602,
        targetAudience: 2772,
        verifiedPaymentCount: 2,
        verifiedTestRevenue: 5598,
        actualTestRevenueCaptured: 5598,
        paymentLinkId: "plink_test_complete_your_run_01",
        paymentIds: ["pay_test_complete_run_001", "pay_test_complete_run_002"],
        lastPaymentAt: "2026-08-31T15:10:00.000Z",
        verificationStatus: "verified",
        testMode: true,
        payments: [
          {
            campaignId: "camp_prod_running_shoes_prod_running_socks",
            paymentLinkId: "plink_test_complete_your_run_01",
            paymentId: "pay_test_complete_run_001",
            amount: 2799,
            currency: "INR",
            status: "captured",
            timestamp: "2026-08-31T14:35:00.000Z",
            verificationStatus: "verified",
            testMode: true,
          },
          {
            campaignId: "camp_prod_running_shoes_prod_running_socks",
            paymentLinkId: "plink_test_complete_your_run_01",
            paymentId: "pay_test_complete_run_002",
            amount: 2799,
            currency: "INR",
            status: "captured",
            timestamp: "2026-08-31T15:10:00.000Z",
            verificationStatus: "verified",
            testMode: true,
          },
        ],
      }
    },
  )

  useEffect(() => {
    // 1. Subscribe to shared execution store updates
    const unsubscribe = campaignExecutionStore.subscribe(() => {
      const s = campaignExecutionStore.getState()
      if (s.status !== "idle") {
        setRazorpayModel((prev) => ({
          ...prev,
          campaignId: s.campaignId,
          campaignName: s.campaignName,
          targetAudience: s.targetAudience,
          bundlePrice: s.bundlePrice,
          expectedIncrementalRevenue: s.expectedIncrementalRevenue,
          verifiedPaymentCount: s.verifiedPaymentCount,
          verifiedTestRevenue: s.verifiedTestRevenue,
          actualTestRevenueCaptured: s.verifiedTestRevenue,
          paymentLinkId: s.paymentLinkId || prev.paymentLinkId,
          paymentIds: s.verifiedPaymentIds,
        }))
      }
    })

    // 2. Fetch latest server payments
    razorpayClientService
      .getCampaignPayments(
        "camp_prod_running_shoes_prod_running_socks",
        41602,
        2772,
        "Complete Your Run",
      )
      .then((m) => {
        if (m && m.verifiedPaymentCount >= 0) {
          setRazorpayModel(m)
          // Also sync to shared execution store
          campaignExecutionStore.syncFromCampaignResult({
            campaignId: m.campaignId,
            campaignName: m.campaignName,
            targetAudience: m.targetAudience,
            bundlePrice: 2799,
            expectedIncrementalRevenue: m.expectedIncrementalRevenue,
            verifiedPaymentCount: m.verifiedPaymentCount,
            verifiedPaymentIds: m.paymentIds || [],
            verifiedTestRevenue: m.actualTestRevenueCaptured,
            paymentLinkId: m.paymentLinkId,
            status: m.verifiedPaymentCount > 0 ? "active" : "launched",
            isTestMode: m.testMode,
          })
        }
      })

    return unsubscribe
  }, [])

  const displayCampaigns = campaignsList.map((c) => {
    if (c.name.includes("Complete Your Run")) {
      const convRate =
        razorpayModel.targetAudience > 0
          ? (
              (razorpayModel.verifiedPaymentCount /
                razorpayModel.targetAudience) *
              100
            ).toFixed(2)
          : "0.07"
      return {
        ...c,
        customers: razorpayModel.targetAudience,
        purchases: razorpayModel.verifiedPaymentCount,
        revenue: `₹${razorpayModel.actualTestRevenueCaptured.toLocaleString()}`,
        uplift: `+${convRate}%`,
        roi: "— (Test Mode)",
      }
    }
    return c
  })

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
            <p className="text-2xl font-bold text-blue-700 mono">
              ₹{razorpayModel.expectedIncrementalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              AI deterministic projection before launch
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            {Icons.check}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-emerald-600 uppercase tracking-wider font-semibold mb-0.5">
                Actual Result
              </p>
              <Badge variant="emerald">Razorpay Test Mode</Badge>
            </div>
            <p className="text-[10px] text-slate-400 mb-1">
              Actual Test Revenue Captured
            </p>
            <p className="text-2xl font-bold text-emerald-700 mono">
              ₹{razorpayModel.actualTestRevenueCaptured.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              HMAC-SHA256 Verified · {razorpayModel.verifiedPaymentCount}{" "}
              Sandbox payments
            </p>
          </div>
        </div>
      </div>

      {/* Razorpay Test Mode Verified Transactions (if test payments recorded) */}
      {razorpayModel.payments.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl mb-5 overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">{Icons.sparkle}</span>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Razorpay Test Mode Verified Transactions
              </h2>
            </div>
            <Badge variant="blue">Test Mode Only</Badge>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {razorpayModel.payments.map((p) => (
              <div
                key={p.paymentId}
                className="px-5 py-3 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-semibold text-slate-800">
                    {p.paymentId}
                  </span>
                  <span className="text-slate-400 ml-2 font-mono">
                    ({p.paymentLinkId})
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(p.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold mono text-slate-900 text-sm">
                    ₹{p.amount.toLocaleString()} {p.currency}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    HMAC-SHA256 Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI result message */}
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 mb-6">
        <span className="text-emerald-500 flex-shrink-0">{Icons.sparkle}</span>
        <p className="text-sm text-emerald-800 font-medium">
          <span className="font-bold">
            {razorpayModel.verifiedPaymentCount} Razorpay Test Mode payment
            {razorpayModel.verifiedPaymentCount === 1 ? "" : "s"} verified.
          </span>{" "}
          GrowthOS recorded the result for campaign evaluation.
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
            {displayCampaigns.map((c) => (
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
            subtitle="Active campaign · Razorpay Test Mode"
          />
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              {
                label: "Customers Targeted",
                value: razorpayModel.targetAudience.toLocaleString(),
              },
              {
                label: "Purchases Made",
                value: razorpayModel.verifiedPaymentCount.toLocaleString(),
              },
              {
                label: "Conversion Rate",
                value:
                  razorpayModel.targetAudience > 0
                    ? `${(
                        (razorpayModel.verifiedPaymentCount /
                          razorpayModel.targetAudience) *
                        100
                      ).toFixed(2)}%`
                    : "0.07%",
              },
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
            subtitle='"Complete Your Run" — verified test results'
          />

          {/* Key campaign outcomes */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              {
                label: "Customers Targeted",
                value: razorpayModel.targetAudience.toLocaleString(),
              },
              {
                label: "Purchases",
                value: razorpayModel.verifiedPaymentCount.toLocaleString(),
              },
              {
                label: "Conversion Uplift",
                value:
                  razorpayModel.targetAudience > 0
                    ? `+${(
                        (razorpayModel.verifiedPaymentCount /
                          razorpayModel.targetAudience) *
                        100
                      ).toFixed(2)}%`
                    : "+0.07%",
              },
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
                label: "Actual Test Revenue Captured",
                value: `+₹${razorpayModel.actualTestRevenueCaptured.toLocaleString()}`,
                color: "text-emerald-600",
                note: "HMAC-SHA256 verified · Razorpay Test Mode",
              },
              {
                label: "Total with Test Revenue",
                value: "₹18.46L",
                color: "text-blue-700",
                note: "Store baseline + sandbox captured",
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
              AI Forecast vs. Actual (Test Mode)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">
                  Expected
                </p>
                <p className="text-lg font-bold text-blue-600 mono">
                  ₹{razorpayModel.expectedIncrementalRevenue.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400">
                  AI projected target
                </p>
              </div>
              <div className="text-center border-l border-slate-200">
                <p className="text-[10px] text-emerald-600 uppercase tracking-wider mb-1">
                  Actual Test Captured
                </p>
                <p className="text-lg font-bold text-emerald-600 mono">
                  ₹{razorpayModel.actualTestRevenueCaptured.toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-600 font-medium">
                  {razorpayModel.expectedIncrementalRevenue > 0
                    ? `${(
                        (razorpayModel.actualTestRevenueCaptured /
                          razorpayModel.expectedIncrementalRevenue) *
                        100
                      ).toFixed(1)}% of target · Sandbox`
                    : "Test Mode"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Bundle Price (AOV)", value: "₹2,799" },
              {
                label: "Verified Transactions",
                value: `${razorpayModel.verifiedPaymentCount} Payments`,
              },
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
