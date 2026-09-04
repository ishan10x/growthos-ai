import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page =
  | "dashboard"
  | "opportunities"
  | "opportunity-detail"
  | "opportunity-investigate"
  | "campaign-create"
  | "campaign-results"
  | "customers"
  | "analytics"
  | "ai-activity"
  | "settings";

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const Icons = {
  logo: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="#2563EB" />
      <path d="M7 14h14M7 9.5l7 4.5-7 4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  opportunities: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1l1.8 3.6L14 5.4l-3 2.9.7 4.1L8 10.4l-3.7 2 .7-4.1-3-2.9 4.2-.8L8 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  campaigns: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 5h12M2 8h8M2 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  customers: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 13c0-2.76 2.24-5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="11.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 13c0-2.21 1.12-4 2.5-4s2.5 1.79 2.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  analytics: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12l3.5-4 3 2.5L12 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  ai: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M3.4 12.6l.7-.7M11.9 4.1l.7-.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1.5a5.5 5.5 0 00-5.5 5.5v3L2 12h14l-1.5-2V7A5.5 5.5 0 009 1.5z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 12a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  chevronRight: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  arrowUp: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 10V2M2 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sparkle: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1l1.2 3.8H12L8.9 7l1.2 3.8L7 8.6l-3.1 2.2L5.1 7 2 4.8h3.8L7 1z" fill="currentColor" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  filter: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 3h12M3.5 7h7M6 11h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  export: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1v8M4 6l3 3 3-3M2 10v2a1 1 0 001 1h8a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// ─── Revenue Chart Data ───────────────────────────────────────────────────────
const revenueData = [
  { date: "Aug 1", revenue: 1420000, prev: 1280000 },
  { date: "Aug 4", revenue: 1380000, prev: 1310000 },
  { date: "Aug 7", revenue: 1540000, prev: 1340000 },
  { date: "Aug 10", revenue: 1620000, prev: 1370000 },
  { date: "Aug 13", revenue: 1580000, prev: 1390000 },
  { date: "Aug 16", revenue: 1710000, prev: 1420000 },
  { date: "Aug 19", revenue: 1680000, prev: 1450000 },
  { date: "Aug 22", revenue: 1790000, prev: 1470000 },
  { date: "Aug 25", revenue: 1840000, prev: 1490000 },
  { date: "Aug 28", revenue: 1840000, prev: 1490000 },
  { date: "Aug 31", revenue: 1840000, prev: 1490000 },
];

const customerSegmentData = [
  { segment: "Running", customers: 3200, aov: 3100, orders: 4800 },
  { segment: "Casual", customers: 2800, aov: 1900, orders: 3600 },
  { segment: "Training", customers: 1900, aov: 2600, orders: 2700 },
  { segment: "Trail", customers: 1200, aov: 3800, orders: 1600 },
  { segment: "Premium", customers: 800, aov: 5200, orders: 1100 },
];

const conversionData = [
  { date: "Week 1", rate: 6.9 },
  { date: "Week 2", rate: 7.2 },
  { date: "Week 3", rate: 7.8 },
  { date: "Week 4", rate: 8.7 },
];

const campaignResultsTimeline = [
  { day: "Day 1", before: 180000, after: 185000 },
  { day: "Day 3", before: 180000, after: 196000 },
  { day: "Day 5", before: 180000, after: 204000 },
  { day: "Day 7", before: 180000, after: 213000 },
  { day: "Day 10", before: 180000, after: 213000 },
  { day: "Day 14", before: 180000, after: 213000 },
];

// ─── Shared UI Components ─────────────────────────────────────────────────────
function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "info" | "muted" }) {
  const styles = {
    default: "bg-blue-50 text-blue-700 border-blue-100",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    info: "bg-indigo-50 text-indigo-700 border-indigo-100",
    muted: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  change,
  changeLabel,
  positive = true,
}: {
  label: string;
  value: string;
  change?: string;
  changeLabel?: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 mono">{value}</p>
      {change && (
        <div className="flex items-center gap-1.5">
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${positive ? "text-emerald-600" : "text-red-500"}`}>
            <span className={positive ? "" : "rotate-180 inline-block"}>{Icons.arrowUp}</span>
            {change}
          </span>
          {changeLabel && <span className="text-xs text-slate-400">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 mono">{value}%</span>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ current, onNav }: { current: Page; onNav: (p: Page) => void }) {
  const nav = [
    { id: "dashboard" as Page, label: "Dashboard", icon: Icons.dashboard },
    { id: "opportunities" as Page, label: "Opportunities", icon: Icons.opportunities },
    { id: "campaign-results" as Page, label: "Campaigns", icon: Icons.campaigns },
    { id: "customers" as Page, label: "Customers", icon: Icons.customers },
    { id: "analytics" as Page, label: "Analytics", icon: Icons.analytics },
    { id: "ai-activity" as Page, label: "AI Activity", icon: Icons.ai },
  ];

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100 flex items-center gap-2.5">
        {Icons.logo}
        <div>
          <span className="text-sm font-bold text-slate-900 tracking-tight">GrowthOS</span>
          <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">AI Merchant Growth</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {nav.map((item) => {
          const active = current === item.id || (item.id === "opportunities" && (current === "opportunity-detail" || current === "opportunity-investigate")) || (item.id === "campaign-results" && current === "campaign-create");
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className={active ? "text-blue-600" : "text-slate-400"}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}

        <div className="mt-auto pt-4 border-t border-slate-100">
          <button
            onClick={() => onNav("settings")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              current === "settings"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span className={current === "settings" ? "text-blue-600" : "text-slate-400"}>{Icons.settings}</span>
            Settings
          </button>
        </div>
      </nav>
    </aside>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar({ onNav }: { onNav: (p: Page) => void }) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      {/* Merchant */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">S</span>
        </div>
        <div>
          <span className="text-sm font-semibold text-slate-900">SoleX</span>
          <span className="ml-2 text-xs text-slate-400">Merchant ID: MID7823491</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* AI Status */}
        <button
          onClick={() => onNav("ai-activity")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full hover:bg-emerald-100 transition-colors"
        >
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700">AI Online</span>
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
          {Icons.bell}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">AK</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-700">Arjun Kumar</p>
            <p className="text-[10px] text-slate-400">Growth Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── AI Command Bar ───────────────────────────────────────────────────────────
function AICommandBar({ onNav }: { onNav: (p: Page) => void }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const prompts = [
    { text: "Find my biggest revenue opportunity", page: "opportunity-investigate" as Page },
    { text: "Which products should I bundle?", page: "opportunities" as Page },
    { text: "Why did revenue change?", page: "analytics" as Page },
    { text: "Create a campaign for my best customers", page: "campaign-create" as Page },
  ];

  return (
    <div className="relative mb-6">
      <div className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition-all ${focused ? "border-blue-400 shadow-sm shadow-blue-100" : "border-slate-200"}`}>
        <span className="text-blue-500 flex-shrink-0">{Icons.sparkle}</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="✨  Ask GrowthOS anything — e.g. Find my biggest revenue opportunity"
          className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); }}
            className="text-slate-300 hover:text-slate-500 transition-colors text-xs"
          >
            ✕
          </button>
        )}
        <span className="text-[10px] text-slate-300 font-medium border border-slate-200 rounded px-1.5 py-0.5 flex-shrink-0">⌘K</span>
      </div>

      {focused && !query && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-3">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider px-2 mb-2">Suggested prompts</p>
          <div className="flex flex-col gap-0.5">
            {prompts.map((p) => (
              <button
                key={p.text}
                onMouseDown={() => { onNav(p.page); setFocused(false); }}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
              >
                <span className="text-blue-400 flex-shrink-0">{Icons.sparkle}</span>
                <span className="text-sm text-slate-700">{p.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
function DashboardPage({ onNav }: { onNav: (p: Page) => void }) {
  const formatRevenue = (v: number) =>
    "₹" + (v / 100000).toFixed(1) + "L";

  const aiActivities = [
    { time: "2m ago", icon: Icons.sparkle, text: "New cross-sell opportunity identified", label: "Running Shoes → Socks", status: "new" },
    { time: "15m ago", icon: Icons.info, text: "Customer segment analyzed", label: "2,840 eligible customers", status: "info" },
    { time: "1h ago", icon: Icons.check, text: "Campaign recommendation generated", label: "\"Complete Your Run\"", status: "success" },
    { time: "3h ago", icon: Icons.bell, text: "Merchant approval required", label: "Review & Launch", status: "warning" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">AI-powered growth insights for SoleX · Last updated 2 minutes ago</p>
      </div>

      {/* AI Command Bar */}
      <AICommandBar onNav={onNav} />

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" value="₹18.4L" change="+12.4%" changeLabel="vs last month" positive />
        <StatCard label="Average Order Value" value="₹2,840" change="+₹340" changeLabel="vs last month" positive />
        <StatCard label="Conversion Rate" value="8.7%" change="+1.8%" changeLabel="vs last month" positive />
        <div className="bg-blue-600 border border-blue-700 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-blue-200 uppercase tracking-wider">Estimated Revenue Potential</p>
            <span className="text-blue-300">{Icons.sparkle}</span>
          </div>
          <p className="text-2xl font-semibold text-white mono">₹2.84L</p>
          <p className="text-xs text-blue-200">Across 5 identified opportunities</p>
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
                <button className="px-3 py-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">30D</button>
                <button className="px-3 py-1.5 text-xs bg-blue-600 text-white border border-blue-700 rounded-lg">MTD</button>
              </div>
            }
          />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => "₹" + (v / 100000).toFixed(1) + "L"} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={52} />
              <Tooltip
                formatter={(value: number) => [formatRevenue(value), ""]}
                contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12, fontFamily: "JetBrains Mono" }}
                labelStyle={{ color: "#64748B", fontSize: 11 }}
              />
              <Area type="monotone" dataKey="prev" stroke="#CBD5E1" strokeWidth={1.5} fill="url(#prevGrad)" name="Prev Period" />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <SectionHeader title="AI Activity" subtitle="Recent decisions" action={
            <button onClick={() => onNav("ai-activity")} className="text-xs text-blue-600 font-medium hover:text-blue-700">View all</button>
          } />
          <div className="flex flex-col gap-3">
            {aiActivities.map((a, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  a.status === "new" ? "bg-blue-100 text-blue-600" :
                  a.status === "success" ? "bg-emerald-100 text-emerald-600" :
                  a.status === "warning" ? "bg-amber-100 text-amber-600" :
                  "bg-slate-100 text-slate-500"
                }`}>
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 font-medium leading-snug">{a.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.label}</p>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Opportunity Card */}
        <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <SectionHeader
            title="AI Opportunities"
            subtitle="Revenue opportunities identified by AI"
            action={<Badge variant="info"><span>{Icons.sparkle}</span> 3 active</Badge>}
          />
          {/* Primary opportunity */}
          <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-5 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="info"><span>{Icons.sparkle}</span> AI Identified</Badge>
                  <Badge variant="success">High Confidence</Badge>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mt-2">Running Shoes → Running Socks</h3>
                <p className="text-sm text-slate-500 mt-0.5">Cross-sell opportunity based on purchase pattern analysis</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-700 mono">₹42,600</p>
                <p className="text-xs text-slate-500 mt-0.5">Expected incremental revenue</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              {[
                { label: "Potential Customers", value: "2,840" },
                { label: "Current Attach Rate", value: "16%" },
                { label: "Target Attach Rate", value: "31%" },
                { label: "AI Confidence", value: "87%" },
              ].map((m) => (
                <div key={m.label} className="bg-white border border-slate-200 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{m.label}</p>
                  <p className="text-lg font-semibold text-slate-900 mono">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>AI Confidence Score</span>
                <span className="font-medium text-slate-700">87%</span>
              </div>
              <ConfidenceMeter value={87} />
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => onNav("opportunity-investigate")}
                className="flex-1 px-4 py-2.5 border border-slate-200 bg-white text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Investigate
              </button>
              <button
                onClick={() => onNav("campaign-create")}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-sm font-semibold text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Launch Campaign
              </button>
            </div>
          </div>

          {/* Other opportunities */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: "Premium Insoles Upsell", revenue: "₹28,400", confidence: 79, customers: 1240 },
              { title: "Hydration Pack Cross-sell", revenue: "₹18,700", confidence: 71, customers: 890 },
            ].map((o) => (
              <div key={o.title} className="border border-slate-200 rounded-lg p-3.5 hover:border-blue-200 hover:bg-blue-50/20 transition-colors cursor-pointer">
                <p className="text-sm font-medium text-slate-800 mb-2">{o.title}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-500">{o.customers.toLocaleString()} customers</span>
                  <span className="text-sm font-semibold text-blue-700 mono">{o.revenue}</span>
                </div>
                <ConfidenceMeter value={o.confidence} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <SectionHeader title="Top Segments" subtitle="By revenue contribution" />
          <div className="flex flex-col gap-3">
            {customerSegmentData.map((s, i) => (
              <div key={s.segment} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-300 mono w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">{s.segment}</span>
                    <span className="text-xs font-semibold text-slate-900 mono">₹{(s.customers * s.aov / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(s.customers / 3200) * 100}%`, opacity: 1 - i * 0.12 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Opportunity Detail Page (legacy – redirects to investigate) ───────────────
function OpportunityDetailPage({ onNav }: { onNav: (p: Page) => void }) {
  return <OpportunityInvestigatePage onNav={onNav} />;
}

// ─── Opportunity Investigation Page ──────────────────────────────────────────
function OpportunityInvestigatePage({ onNav }: { onNav: (p: Page) => void }) {
  const [actionState, setActionState] = useState<"idle" | "approved" | "rejected">("idle");

  const metrics = [
    { label: "Customers Analyzed", value: "12,840", sub: "Total active base" },
    { label: "Orders Analyzed", value: "18,420", sub: "Last 90 days" },
    { label: "Current Attach Rate", value: "16%", sub: "Socks with shoes" },
    { label: "Benchmark Attach Rate", value: "29%", sub: "Category median" },
    { label: "Expected Attach Rate", value: "31%", sub: "Post-campaign target" },
    { label: "Expected Additional Orders", value: "~427", sub: "Sock orders unlocked" },
  ];

  const reasoning = [
    {
      signal: "Co-purchase pattern",
      icon: "📊",
      summary: "Strong basket affinity between running shoes and running socks",
      detail: "18,420 orders were scanned over 90 days. Customers who bought running socks within 14 days of shoe purchase show 2.3× higher lifetime value, 41% lower return rates, and 28% higher repeat-order frequency. The co-purchase signal has a Pearson correlation of 0.74 — well above the 0.5 threshold GrowthOS uses to flag opportunities.",
      stat: "r = 0.74 correlation",
      statVariant: "info" as const,
    },
    {
      signal: "Attach rate gap",
      icon: "📉",
      summary: "SoleX attach rate is 13pp below category median",
      detail: "SoleX's current sock attach rate of 16% sits well below the sportswear category median of 29% (sampled across 48 comparable merchants on Razorpay). Merchants who ran targeted cross-sell campaigns to close similar gaps saw attach rates of 28–34% within 60 days. GrowthOS estimates SoleX can realistically reach 31%.",
      stat: "13pp gap vs. peers",
      statVariant: "warning" as const,
    },
    {
      signal: "High-intent but unconverted",
      icon: "🔍",
      summary: "2,840 customers browsed socks but didn't buy",
      detail: "Of the eligible customer pool, 2,840 visited the running socks category page an average of 2.4 times in the 30 days following their shoe purchase — but did not convert. This indicates latent demand that a timely, well-priced campaign can activate. Email open rates for this segment average 38%, above the SoleX baseline of 27%.",
      stat: "2.4 avg page visits",
      statVariant: "info" as const,
    },
    {
      signal: "Seasonal timing",
      icon: "📅",
      summary: "September–October is peak running accessory season",
      detail: "Historical transaction data from the last 3 years shows a consistent 22% spike in running accessory purchases during September–October. Acting now captures the seasonal window. Delay by 3+ weeks and the effective attach rate uplift drops by an estimated 8pp as the intent window closes.",
      stat: "+22% seasonal uplift",
      statVariant: "success" as const,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-5 text-sm">
        <button onClick={() => onNav("opportunities")} className="text-slate-500 hover:text-blue-600 transition-colors">Opportunities</button>
        <span className="text-slate-300">{Icons.chevronRight}</span>
        <span className="text-slate-900 font-medium">Running Shoes → Running Socks</span>
        <span className="ml-2"><Badge variant="info"><span>{Icons.sparkle}</span> AI Investigation</Badge></span>
      </div>

      {/* Hero header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info"><span>{Icons.sparkle}</span> AI Identified · Aug 31, 2026</Badge>
              <Badge variant="success">High Confidence · 87%</Badge>
              <Badge variant="muted">Cross-sell</Badge>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">Running Shoes → Running Socks</h1>
            <p className="text-sm text-slate-500">GrowthOS detected a cross-sell opportunity by analyzing transaction patterns, browsing behavior, and category benchmarks across your customer base.</p>
          </div>
          <div className="flex-shrink-0 ml-8 bg-blue-50 border border-blue-100 rounded-2xl px-7 py-5 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Expected Incremental Revenue</p>
            <p className="text-4xl font-bold text-blue-700 mono">₹42,600</p>
            <p className="text-xs text-slate-400 mt-1.5">Based on 31% target attach rate</p>
          </div>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-100">
          {metrics.map((m) => (
            <div key={m.label} className="flex flex-col gap-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider leading-tight">{m.label}</p>
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
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Attach Rate — Current vs. Benchmark vs. Target</h2>
            <div className="flex items-end gap-6 mb-4">
              {[
                { label: "Current (SoleX)", value: 16, color: "bg-slate-300" },
                { label: "Category Median", value: 29, color: "bg-amber-400" },
                { label: "Target (Post-Campaign)", value: 31, color: "bg-blue-500" },
              ].map((b) => (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 mono">{b.value}%</span>
                  <div className="w-full rounded-t-md" style={{ height: `${b.value * 4}px` }}>
                    <div className={`w-full h-full rounded-t-md ${b.color}`} />
                  </div>
                  <span className="text-[10px] text-slate-500 text-center leading-tight">{b.label}</span>
                </div>
              ))}
              <div className="flex-1" />
              <div className="flex-1" />
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
              <p className="text-xs text-amber-800 font-medium">Closing the attach rate gap from 16% → 31% unlocks ~427 additional sock orders and ₹42,600 in incremental revenue.</p>
            </div>
          </div>

          {/* Why did I find this? */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                {Icons.sparkle}
              </div>
              <h2 className="text-base font-semibold text-slate-900">Why did I find this?</h2>
            </div>

            {/* Plain-language AI narrative */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 mb-5">
              <p className="text-sm text-slate-700 leading-relaxed">
                I analyzed <span className="font-semibold text-slate-900">18,420 orders</span> over the last 90 days. Customers who purchased running shoes frequently purchased running socks within 14 days. Your current attach rate is <span className="font-semibold text-slate-900">16%</span>, compared with a <span className="font-semibold text-slate-900">29% category benchmark</span>. This indicates a strong cross-sell opportunity.
              </p>
            </div>

            {/* Supporting evidence */}
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-3">Supporting Evidence</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { signal: "Co-purchase correlation", value: "r = 0.74", note: "Well above 0.5 threshold", variant: "info" as const },
                { signal: "Purchase frequency", value: "2.3× higher LTV", note: "Customers who buy both", variant: "info" as const },
                { signal: "Recency", value: "45 days", note: "Avg. window post shoe purchase", variant: "muted" as const },
                { signal: "Category benchmark", value: "13pp gap", note: "SoleX 16% vs. median 29%", variant: "warning" as const },
              ].map((e) => (
                <div key={e.signal} className="border border-slate-100 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{e.signal}</span>
                    <Badge variant={e.variant}>{e.value}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{e.note}</p>
                </div>
              ))}
            </div>

            {/* Detailed reasoning panels */}
            <div className="flex flex-col gap-3">
              {reasoning.map((r, i) => (
                <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <span className="text-base">{r.icon}</span>
                    <div className="flex-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{r.signal}</span>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{r.summary}</p>
                    </div>
                    <Badge variant={r.statVariant}>{r.stat}</Badge>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-slate-600 leading-relaxed">{r.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer pattern chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Customer Segment Breakdown</h2>
            <p className="text-xs text-slate-400 mb-4">Orders analyzed by segment — Running segment has highest attach rate potential</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={customerSegmentData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="segment" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="orders" name="Orders" fill="#2563EB" radius={[4, 4, 0, 0]} opacity={0.82} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right sidebar: Confidence + Recommended Action */}
        <div className="flex flex-col gap-4">
          {/* AI Confidence */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">AI Confidence</h2>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#2563EB" strokeWidth="10"
                    strokeDasharray={`${87 * 2.51} ${100 * 2.51 - 87 * 2.51}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900 mono">87%</span>
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
                    <span className="font-medium text-slate-800 mono">{f.score}%</span>
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
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">AI Recommended Action</span>
              <span className="ml-auto">
                <Badge variant="warning">Pending Review</Badge>
              </span>
            </div>

            {actionState === "idle" && (
              <>
                {/* Campaign name */}
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Recommended Campaign</p>
                <p className="text-sm font-bold text-slate-900 mb-4">"Complete Your Run"</p>

                {/* Bundle pricing */}
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Bundle Pricing</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <span className="text-slate-600">Running Shoes</span>
                      <span className="text-slate-700 mono font-medium">₹2,499</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <span className="text-slate-600">Running Socks</span>
                      <span className="text-slate-700 mono font-medium">₹499</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 bg-blue-50">
                      <span className="text-sm font-semibold text-slate-900">Bundle Price</span>
                      <span className="text-base font-bold text-blue-700 mono">₹2,799</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5 flex justify-between items-center text-sm mb-4">
                  <span className="text-emerald-700 font-medium">Expected AOV increase</span>
                  <span className="font-bold text-emerald-700 mono">+₹300</span>
                </div>

                {/* Projected outcome — labelled as expected, not actual */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-5">
                  <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold mb-2">Expected Outcome — AI Projection</p>
                  <div className="flex flex-col gap-0 text-xs">
                    {[
                      { label: "Customers targeted", value: "2,840" },
                      { label: "Expected purchases", value: "~427" },
                      { label: "Expected incremental revenue", value: "₹42,600" },
                      { label: "Channel", value: "Email + WhatsApp" },
                    ].map((r) => (
                      <div key={r.label} className="flex justify-between py-1.5 border-b border-blue-100/70 last:border-0">
                        <span className="text-slate-500">{r.label}</span>
                        <span className="font-semibold text-slate-800 mono">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions — Reject · Modify · Approve & Launch (primary) */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setActionState("approved"); onNav("campaign-create"); }}
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
                <p className="text-sm font-semibold text-emerald-700">Approved — Campaign Launching</p>
                <p className="text-xs text-slate-400">GrowthOS is setting up the campaign. You'll be notified when it's live.</p>
                <button onClick={() => onNav("campaign-create")} className="mt-1 text-xs text-blue-600 font-medium hover:text-blue-700">Configure campaign →</button>
              </div>
            )}

            {actionState === "rejected" && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">✕</div>
                <p className="text-sm font-semibold text-slate-700">Opportunity Rejected</p>
                <p className="text-xs text-slate-400">GrowthOS will factor this feedback into future recommendations.</p>
                <button onClick={() => setActionState("idle")} className="mt-1 text-xs text-blue-600 font-medium hover:text-blue-700">Undo</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Campaign Creation Page ───────────────────────────────────────────────────
function CampaignCreatePage({ onNav }: { onNav: (p: Page) => void }) {
  const [step, setStep] = useState(1);
  const [channel, setChannel] = useState("email");
  const [launched, setLaunched] = useState(false);

  if (launched) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="bg-white border border-slate-200 rounded-2xl p-12 max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M6 16l6 6 14-12" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Campaign Launched!</h2>
          <p className="text-sm text-slate-500 mb-6">"Complete Your Run" is now live. 2,840 customers will receive the campaign over the next 24 hours.</p>
          <div className="flex gap-3">
            <button onClick={() => onNav("campaign-results")} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              View Results
            </button>
            <button onClick={() => onNav("dashboard")} className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="flex items-center gap-1.5 mb-5 text-sm">
        <button onClick={() => onNav("opportunity-detail")} className="text-slate-500 hover:text-blue-600 transition-colors">Opportunity Details</button>
        <span className="text-slate-300">{Icons.chevronRight}</span>
        <span className="text-slate-900 font-medium">Create Campaign</span>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Steps */}
        <div className="flex items-center gap-0 mb-8">
          {["Campaign Setup", "Audience", "Message", "Review"].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i + 1 < step ? "bg-emerald-500 text-white" :
                  i + 1 === step ? "bg-blue-600 text-white" :
                  "bg-slate-200 text-slate-500"
                }`}>
                  {i + 1 < step ? Icons.check : i + 1}
                </div>
                <span className={`text-xs font-medium ${i + 1 === step ? "text-slate-900" : "text-slate-400"}`}>{s}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-px mx-3 ${i + 1 < step ? "bg-emerald-300" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Campaign Setup</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Campaign Name</label>
                <input
                  defaultValue='"Complete Your Run"'
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Offer Type</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Cross-sell Bundle</option>
                  <option>Upsell</option>
                  <option>Discount</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">Bundle Price</label>
                  <input defaultValue="₹2,799" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mono" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">Offer Validity</label>
                  <input defaultValue="7 days" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Channel</label>
                <div className="flex gap-2">
                  {["email", "whatsapp", "sms"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setChannel(c)}
                      className={`px-4 py-2 rounded-lg border text-xs font-medium capitalize transition-colors ${
                        channel === c ? "bg-blue-50 border-blue-300 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {c === "whatsapp" ? "WhatsApp" : c.charAt(0).toUpperCase() + c.slice(1)}
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
            <h2 className="text-base font-semibold text-slate-900 mb-5">Audience</h2>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600">{Icons.sparkle}</span>
                <span className="text-sm font-semibold text-blue-900">AI-Selected Segment</span>
              </div>
              <p className="text-xs text-blue-700">Customers who purchased running shoes in the last 45 days without purchasing running socks, with prior sock category interest.</p>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: "Total Customers", value: "2,840" },
                { label: "Avg. Order Value", value: "₹2,840" },
                { label: "Email Deliverability", value: "94.2%" },
              ].map((m) => (
                <div key={m.label} className="border border-slate-200 rounded-lg px-4 py-3 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{m.label}</p>
                  <p className="text-lg font-semibold text-slate-900 mono">{m.value}</p>
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-2 block">Segment Filters</label>
              <div className="flex flex-wrap gap-2">
                {["Bought Running Shoes (45d)", "No Sock Purchase", "Sock Page Visited", "Email Opted-in"].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Message Preview</h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
              <div className="bg-slate-900 px-5 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-slate-400 text-xs">Email Preview — Complete Your Run</span>
              </div>
              <div className="p-6 bg-slate-50">
                <div className="max-w-sm mx-auto bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <p className="text-xs font-medium text-blue-200 mb-1">SOLEX × GROWTHOS</p>
                    <h3 className="text-lg font-bold">Complete Your Run 🏃</h3>
                    <p className="text-sm text-blue-100 mt-1">You're one step away from your perfect kit.</p>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">You recently grabbed a pair of running shoes from us — great choice! Pair them with our performance running socks for the ultimate comfort.</p>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-center">
                      <p className="text-xs text-slate-500 line-through mono">₹3,199</p>
                      <p className="text-xl font-bold text-blue-700 mono">₹2,799</p>
                      <p className="text-xs text-emerald-600 font-medium">Save ₹400 — Today only</p>
                    </div>
                    <button className="w-full py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg">Shop the Bundle</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Review & Launch</h2>
            <div className="flex flex-col gap-0 mb-6 border border-slate-100 rounded-xl overflow-hidden">
              {[
                { label: "Campaign", value: '"Complete Your Run"' },
                { label: "Type", value: "Cross-sell Bundle" },
                { label: "Bundle Price", value: "₹2,799" },
                { label: "Channel", value: "Email + WhatsApp" },
                { label: "Audience Size", value: "2,840 customers" },
                { label: "Expected Incremental Revenue", value: "₹42,600" },
                { label: "AI Confidence", value: "87%" },
              ].map((r, i, arr) => (
                <div key={r.label} className={`flex justify-between px-4 py-3 text-sm ${i < arr.length - 1 ? "border-b border-slate-100" : ""} ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                  <span className="text-slate-500">{r.label}</span>
                  <span className="font-semibold text-slate-900 mono">{r.value}</span>
                </div>
              ))}
            </div>

            {/* AI Pre-Launch Checks */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-5">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <span className="text-blue-500">{Icons.sparkle}</span>
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">AI Pre-Launch Checks</span>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  "Merchant approval pending",
                  "Target audience validated",
                  "Bundle price validated",
                  "Expected revenue calculated",
                  "Razorpay integration connected",
                ].map((check) => (
                  <div key={check} className="flex items-center gap-3 px-4 py-2.5">
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
              onClick={() => step > 1 ? setStep(step - 1) : onNav("opportunity-detail")}
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
  );
}

// ─── Campaign Results Page ────────────────────────────────────────────────────
function CampaignResultsPage({ onNav }: { onNav: (p: Page) => void }) {
  const campaigns = [
    { name: '"Complete Your Run"', status: "active", customers: 2840, purchases: 184, revenue: "₹47,200", uplift: "+3.5%", roi: "4.7×" },
    { name: '"Premium Insoles Offer"', status: "completed", customers: 1240, purchases: 97, revenue: "₹28,400", uplift: "+2.1%", roi: "3.1×" },
    { name: '"Trail Season Ready"', status: "draft", customers: 890, purchases: 0, revenue: "—", uplift: "—", roi: "—" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track performance across all AI-generated campaigns</p>
        </div>
        <button onClick={() => onNav("campaign-create")} className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          {Icons.plus} New Campaign
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatCard label="Total Revenue Before" value="₹18.4L" />
        <StatCard label="Revenue After" value="₹21.3L" change="+₹2.9L" changeLabel="incremental" positive />
        <StatCard label="AOV Increase" value="+₹300" change="+10.5%" changeLabel="vs. baseline" positive />
        <StatCard label="Conversion Uplift" value="+3.5%" change="+1.8pp" changeLabel="vs. baseline" positive />
      </div>

      {/* Expected vs Actual callout */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-4 bg-blue-50/60 border border-blue-100 rounded-xl px-5 py-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center flex-shrink-0">{Icons.sparkle}</div>
          <div>
            <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold mb-0.5">Expected Result</p>
            <p className="text-[10px] text-slate-400 mb-1">Expected Incremental Revenue</p>
            <p className="text-2xl font-bold text-blue-700 mono">₹42,600</p>
            <p className="text-xs text-slate-400 mt-0.5">AI projection before launch</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">{Icons.check}</div>
          <div>
            <p className="text-[10px] text-emerald-600 uppercase tracking-wider font-semibold mb-0.5">Actual Result</p>
            <p className="text-[10px] text-slate-400 mb-1">Actual Incremental Revenue</p>
            <p className="text-2xl font-bold text-emerald-700 mono">₹47,200</p>
            <p className="text-xs text-slate-400 mt-0.5">Verified · attributable to campaign</p>
          </div>
        </div>
      </div>

      {/* AI result message */}
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 mb-6">
        <span className="text-emerald-500 flex-shrink-0">{Icons.sparkle}</span>
        <p className="text-sm text-emerald-800 font-medium">Campaign performed <span className="font-bold">11% better than predicted.</span> GrowthOS has updated its model based on these results.</p>
      </div>

      {/* Campaigns table */}
      <div className="bg-white border border-slate-200 rounded-xl mb-5 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">All Campaigns</h2>
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
              {["Campaign", "Status", "Customers Targeted", "Purchases", "Actual Incr. Revenue", "Conv. Uplift", "ROI"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.name} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4 text-sm font-medium text-slate-900">{c.name}</td>
                <td className="px-5 py-4">
                  <Badge variant={c.status === "active" ? "success" : c.status === "completed" ? "muted" : "warning"}>
                    {c.status}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-sm text-slate-700 mono">{c.customers.toLocaleString()}</td>
                <td className="px-5 py-4 text-sm text-slate-700 mono">{c.purchases || "—"}</td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-900 mono">{c.revenue}</td>
                <td className="px-5 py-4 text-sm font-semibold text-emerald-600 mono">{c.uplift}</td>
                <td className="px-5 py-4 text-sm font-bold text-blue-700 mono">{c.roi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Active campaign details */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <SectionHeader title='"Complete Your Run" — Performance' subtitle="Active campaign · Launched Aug 31, 2026" />
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Customers Targeted", value: "2,840" },
              { label: "Purchases Made", value: "184" },
              { label: "Conversion Rate", value: "6.5%" },
            ].map((m) => (
              <div key={m.label} className="border border-slate-200 rounded-lg px-3 py-2.5 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{m.label}</p>
                <p className="text-lg font-semibold text-slate-900 mono">{m.value}</p>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={campaignResultsTimeline} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="afterGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => "₹" + (v / 1000).toFixed(0) + "K"} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={48} />
              <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="before" stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="4 4" name="Before" dot={false} />
              <Line type="monotone" dataKey="after" stroke="#10B981" strokeWidth={2} name="After Campaign" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <SectionHeader title="Revenue Impact Breakdown" subtitle='"Complete Your Run" — verified results' />

          {/* Key campaign outcomes */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Customers Targeted", value: "2,840" },
              { label: "Purchases", value: "184" },
              { label: "Conversion Uplift", value: "+3.5%" },
            ].map((m) => (
              <div key={m.label} className="border border-slate-200 rounded-lg px-3 py-2.5 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{m.label}</p>
                <p className="text-lg font-semibold text-slate-900 mono">{m.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-0 mb-4 border border-slate-100 rounded-xl overflow-hidden">
            {[
              { label: "Revenue Before Campaign", value: "₹18.4L", color: "text-slate-700", note: "Baseline (30d pre-campaign)" },
              { label: "Actual Incremental Revenue", value: "+₹47,200", color: "text-emerald-600", note: "Verified · attributable to campaign" },
              { label: "Revenue After Campaign", value: "₹18.87L", color: "text-blue-700", note: "Total (post-campaign)" },
            ].map((r, i) => (
              <div key={r.label} className={`flex justify-between items-center px-4 py-3 ${i < 2 ? "border-b border-slate-100" : ""} ${i % 2 === 1 ? "bg-slate-50/50" : "bg-white"}`}>
                <div>
                  <span className="text-sm text-slate-700 font-medium">{r.label}</span>
                  <p className="text-[10px] text-slate-400">{r.note}</p>
                </div>
                <span className={`text-lg font-bold mono ${r.color}`}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* AI Forecast vs Actual */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-3">AI Forecast vs. Actual</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">Expected</p>
                <p className="text-lg font-bold text-blue-600 mono">₹42,600</p>
                <p className="text-[10px] text-slate-400">AI projection</p>
              </div>
              <div className="text-center border-l border-slate-200">
                <p className="text-[10px] text-emerald-600 uppercase tracking-wider mb-1">Actual</p>
                <p className="text-lg font-bold text-emerald-600 mono">₹47,200</p>
                <p className="text-[10px] text-emerald-500 font-medium">+11% vs. forecast</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "AOV Increase", value: "+₹300" },
              { label: "Campaign ROI", value: "4.7×" },
            ].map((m) => (
              <div key={m.label} className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2.5">
                <p className="text-[10px] text-emerald-500 uppercase tracking-wider mb-1">{m.label}</p>
                <p className="text-base font-bold text-slate-900 mono">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Customers Page ───────────────────────────────────────────────────────────
function CustomersPage() {
  const customers = [
    { name: "Priya Sharma", email: "priya.s@email.com", city: "Mumbai", orders: 8, ltv: "₹24,800", segment: "Premium", lastOrder: "Aug 28" },
    { name: "Rahul Verma", email: "rahul.v@email.com", city: "Bengaluru", orders: 5, ltv: "₹14,200", segment: "Running", lastOrder: "Aug 30" },
    { name: "Ananya Singh", email: "ananya.s@email.com", city: "Delhi", orders: 12, ltv: "₹38,400", segment: "Premium", lastOrder: "Aug 29" },
    { name: "Karthik Nair", email: "k.nair@email.com", city: "Chennai", orders: 3, ltv: "₹7,600", segment: "Casual", lastOrder: "Aug 25" },
    { name: "Meera Iyer", email: "meera.i@email.com", city: "Pune", orders: 7, ltv: "₹19,600", segment: "Training", lastOrder: "Aug 31" },
    { name: "Aditya Kumar", email: "aditya.k@email.com", city: "Hyderabad", orders: 4, ltv: "₹11,200", segment: "Running", lastOrder: "Aug 27" },
    { name: "Sneha Reddy", email: "sneha.r@email.com", city: "Bengaluru", orders: 9, ltv: "₹27,900", segment: "Trail", lastOrder: "Aug 30" },
    { name: "Vikram Joshi", email: "v.joshi@email.com", city: "Mumbai", orders: 2, ltv: "₹5,400", segment: "Casual", lastOrder: "Aug 22" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and analyze your customer base · 12,840 total customers</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 text-sm text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition-colors">
            {Icons.filter} Filter
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 text-sm text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition-colors">
            {Icons.export} Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Customers" value="12,840" change="+8.2%" changeLabel="this month" positive />
        <StatCard label="Avg. LTV" value="₹18,400" change="+₹2,100" changeLabel="vs. last month" positive />
        <StatCard label="Repeat Rate" value="62.4%" change="+4.1%" changeLabel="vs. last month" positive />
        <StatCard label="At-Risk Customers" value="284" change="-12%" changeLabel="vs. last month" positive />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <input
            placeholder="Search customers..."
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            {["All", "Premium", "Running", "Casual", "Training", "Trail"].map((f) => (
              <button
                key={f}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  f === "All" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {["Customer", "City", "Orders", "Lifetime Value", "Segment", "Last Order"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.email} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-semibold">{c.name.split(" ").map(n => n[0]).join("")}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">{c.city}</td>
                <td className="px-5 py-4 text-sm text-slate-700 mono">{c.orders}</td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-900 mono">{c.ltv}</td>
                <td className="px-5 py-4"><Badge variant={c.segment === "Premium" ? "info" : c.segment === "Trail" ? "warning" : "muted"}>{c.segment}</Badge></td>
                <td className="px-5 py-4 text-sm text-slate-500">{c.lastOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">Showing 8 of 12,840 customers</span>
          <div className="flex gap-1">
            {[1, 2, 3, "...", 128].map((p) => (
              <button key={p} className={`w-8 h-8 text-xs rounded-lg ${p === 1 ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Page ───────────────────────────────────────────────────────────
function AnalyticsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Comprehensive performance analytics for SoleX</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard label="Total Revenue" value="₹18.4L" change="+12.4%" changeLabel="vs. last month" positive />
        <StatCard label="Orders Placed" value="6,480" change="+9.2%" changeLabel="vs. last month" positive />
        <StatCard label="Avg. Order Value" value="₹2,840" change="+₹340" changeLabel="vs. last month" positive />
        <StatCard label="Refund Rate" value="2.1%" change="-0.4%" changeLabel="vs. last month" positive />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <SectionHeader title="Revenue Trend" subtitle="Monthly revenue — Last 12 months" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => "₹" + (v / 100000).toFixed(1) + "L"} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={52} />
              <Tooltip formatter={(v: number) => ["₹" + (v / 100000).toFixed(1) + "L", "Revenue"]} contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="revenue" name="Revenue" fill="#2563EB" radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <SectionHeader title="Conversion Rate" subtitle="Weekly trend" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={conversionData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[6, 10]} tickFormatter={(v) => v + "%"} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={32} />
              <Tooltip formatter={(v: number) => [v + "%", "Conv. Rate"]} contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981", r: 3 }} name="Conv. Rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <SectionHeader title="Segment Performance" subtitle="Revenue and order breakdown by customer segment" />
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {["Segment", "Customers", "Avg. Orders", "Avg. AOV", "Total Revenue", "Growth"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customerSegmentData.map((s, i) => (
              <tr key={s.segment} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" style={{ opacity: 1 - i * 0.15 }} />
                    <span className="text-sm font-medium text-slate-900">{s.segment}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 mono">{s.customers.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-slate-700 mono">{(s.orders / s.customers).toFixed(1)}</td>
                <td className="px-4 py-3 text-sm text-slate-700 mono">₹{s.aov.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900 mono">₹{(s.customers * s.aov / 100000).toFixed(1)}L</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold text-emerald-600 mono">+{(8 + i * 2.3).toFixed(1)}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── AI Activity Page ─────────────────────────────────────────────────────────
function AIActivityPage() {
  const logs = [
    {
      time: "Aug 31, 2026 · 14:23",
      type: "opportunity",
      title: "Opportunity Discovered",
      detail: "Running Shoes → Running Socks cross-sell opportunity identified",
      meta: "18,420 orders analyzed · 2,840 customers eligible · Confidence: 87%",
      status: "completed",
    },
    {
      time: "Aug 31, 2026 · 14:18",
      title: "Customer Segment Analyzed",
      type: "analysis",
      detail: "Segmented 2,840 customers based on purchase recency, sock page visits, and email engagement",
      meta: "Model: Segment Clustering v2.1 · Runtime: 1.4s",
      status: "completed",
    },
    {
      time: "Aug 31, 2026 · 14:19",
      title: "Campaign Recommendation Generated",
      type: "recommendation",
      detail: 'AI generated "Complete Your Run" campaign with bundle pricing of ₹2,799',
      meta: "Channel mix: Email 60% + WhatsApp 40% · Expected conversion: 6.5%",
      status: "completed",
    },
    {
      time: "Aug 31, 2026 · 14:20",
      title: "Merchant Approval Required",
      type: "pending",
      detail: "Campaign requires merchant review before launch. Waiting for approval from Arjun Kumar.",
      meta: "SLA: 24 hours · Escalation: Growth Manager",
      status: "pending",
    },
    {
      time: "Aug 30, 2026 · 09:42",
      title: "Attach Rate Benchmark Analysis",
      type: "analysis",
      detail: "Compared SoleX sock attach rate (16%) against category median (29%) across 48 similar merchants",
      meta: "Data period: 90 days · Benchmark cohort: 48 merchants",
      status: "completed",
    },
    {
      time: "Aug 29, 2026 · 18:11",
      title: "Seasonal Opportunity Window Detected",
      type: "opportunity",
      detail: "Running season spike predicted for Sep–Oct based on 3-year historical pattern",
      meta: "Predicted uplift: +22% · Confidence: 91%",
      status: "completed",
    },
    {
      time: "Aug 28, 2026 · 11:05",
      title: "Premium Insoles Campaign Completed",
      type: "result",
      detail: 'Campaign "Premium Insoles Offer" concluded. 97 purchases from 1,240 targeted customers.',
      meta: "Revenue: ₹28,400 · ROI: 3.1× · AOV Uplift: +₹240",
      status: "success",
    },
  ];

  const typeStyles: Record<string, string> = {
    opportunity: "bg-blue-100 text-blue-600",
    analysis: "bg-indigo-100 text-indigo-600",
    recommendation: "bg-purple-100 text-purple-600",
    pending: "bg-amber-100 text-amber-600",
    result: "bg-emerald-100 text-emerald-600",
  };

  const typeIcons: Record<string, React.ReactNode> = {
    opportunity: Icons.sparkle,
    analysis: Icons.info,
    recommendation: Icons.ai,
    pending: Icons.bell,
    result: Icons.check,
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">AI Activity Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">Full audit trail of AI decisions, analyses, and recommendations</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">AI Active</span>
          </span>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white text-xs text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            {Icons.export} Export Log
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total AI Actions", value: "142", sub: "Last 30 days" },
          { label: "Opportunities Found", value: "8", sub: "3 active" },
          { label: "Campaigns Generated", value: "5", sub: "4 launched" },
          { label: "Avg. AI Confidence", value: "84%", sub: "Across all runs" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-5 py-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">{s.label}</p>
            <p className="text-2xl font-semibold text-slate-900 mono">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Activity Timeline</h2>
          <div className="flex gap-2">
            {["All", "Opportunities", "Analysis", "Campaigns"].map((f) => (
              <button key={f} className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${f === "All" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${typeStyles[log.type] || "bg-slate-100 text-slate-500"}`}>
                {typeIcons[log.type] || Icons.info}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-semibold text-slate-900">{log.title}</p>
                  <span className="text-[10px] text-slate-400 flex-shrink-0 ml-4 mono">{log.time}</span>
                </div>
                <p className="text-sm text-slate-600 mb-1.5">{log.detail}</p>
                <p className="text-xs text-slate-400 mono">{log.meta}</p>
              </div>
              <div className="flex-shrink-0">
                <Badge variant={log.status === "completed" ? "success" : log.status === "pending" ? "warning" : log.status === "success" ? "success" : "muted"}>
                  {log.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────
function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure GrowthOS preferences and integrations</p>
      </div>
      <div className="max-w-2xl flex flex-col gap-5">
        {[
          {
            title: "Merchant Profile",
            items: [
              { label: "Business Name", value: "SoleX Footwear Pvt. Ltd." },
              { label: "Merchant ID", value: "MID7823491" },
              { label: "Razorpay Account", value: "Connected ✓" },
              { label: "Industry", value: "Footwear & Apparel" },
            ],
          },
          {
            title: "AI Configuration",
            items: [
              { label: "AI Opportunity Detection", value: "Enabled" },
              { label: "Auto-segment Customers", value: "Enabled" },
              { label: "Campaign Auto-draft", value: "Requires Approval" },
              { label: "Confidence Threshold", value: "70% minimum" },
            ],
          },
          {
            title: "Notifications",
            items: [
              { label: "New Opportunity Alerts", value: "Email + In-app" },
              { label: "Campaign Performance", value: "Daily Digest" },
              { label: "Revenue Anomalies", value: "Immediate" },
            ],
          },
        ].map((section) => (
          <div key={section.title} className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">{section.title}</h2>
            <div className="flex flex-col gap-0">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-sm font-medium text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Opportunities List Page ──────────────────────────────────────────────────
function OpportunitiesPage({ onNav }: { onNav: (p: Page) => void }) {
  const opps = [
    { title: "Running Shoes → Running Socks", type: "Cross-sell", revenue: "₹42,600", customers: 2840, confidence: 87, status: "active" },
    { title: "Premium Insoles Upsell", type: "Upsell", revenue: "₹28,400", customers: 1240, confidence: 79, status: "active" },
    { title: "Hydration Pack Cross-sell", type: "Cross-sell", revenue: "₹18,700", customers: 890, confidence: 71, status: "active" },
    { title: "Loyalty Tier Upgrade Nudge", type: "Retention", revenue: "₹12,100", customers: 540, confidence: 65, status: "review" },
    { title: "Re-engagement — Lapsed Runners", type: "Win-back", revenue: "₹8,900", customers: 380, confidence: 61, status: "review" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Opportunities</h1>
          <p className="text-sm text-slate-500 mt-0.5">AI-identified revenue opportunities — ₹2.84L total potential</p>
        </div>
        <Badge variant="info"><span>{Icons.sparkle}</span> 5 opportunities · ₹2.84L potential</Badge>
      </div>

      <div className="flex flex-col gap-3">
        {opps.map((o) => (
          <div
            key={o.title}
            onClick={() => onNav("opportunity-investigate")}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  {Icons.sparkle}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{o.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{o.type} · {o.customers.toLocaleString()} customers</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-0.5">Expected Revenue</p>
                  <p className="text-base font-bold text-blue-700 mono">{o.revenue}</p>
                </div>
                <div className="w-24">
                  <p className="text-xs text-slate-400 mb-1.5">AI Confidence</p>
                  <ConfidenceMeter value={o.confidence} />
                </div>
                <Badge variant={o.status === "active" ? "success" : "warning"}>{o.status}</Badge>
                <span className="text-slate-300">{Icons.chevronRight}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  const navigate = (p: Page) => setPage(p);

  return (
    <div className="flex h-full bg-slate-50 font-sans">
      <Sidebar current={page} onNav={navigate} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onNav={navigate} />
        {page === "dashboard" && <DashboardPage onNav={navigate} />}
        {page === "opportunities" && <OpportunitiesPage onNav={navigate} />}
        {page === "opportunity-detail" && <OpportunityDetailPage onNav={navigate} />}
        {page === "opportunity-investigate" && <OpportunityInvestigatePage onNav={navigate} />}
        {page === "campaign-create" && <CampaignCreatePage onNav={navigate} />}
        {page === "campaign-results" && <CampaignResultsPage onNav={navigate} />}
        {page === "customers" && <CustomersPage />}
        {page === "analytics" && <AnalyticsPage />}
        {page === "ai-activity" && <AIActivityPage />}
        {page === "settings" && <SettingsPage />}
      </div>
    </div>
  );
}
