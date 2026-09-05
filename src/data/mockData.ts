import type {
  RevenueDataPoint,
  CustomerSegment,
  ConversionDataPoint,
  CampaignTimelinePoint,
  OpportunityItem,
  InvestigationMetric,
  InvestigationReasoning,
  CampaignItem,
  CustomerItem,
  AIActivityLog,
  SettingsSection,
} from "../types"

// ─── Revenue Chart Data ───────────────────────────────────────────────────────
export const revenueData: RevenueDataPoint[] = [
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
]

export const customerSegmentData: CustomerSegment[] = [
  { segment: "Running", customers: 3200, aov: 3100, orders: 4800 },
  { segment: "Casual", customers: 2800, aov: 1900, orders: 3600 },
  { segment: "Training", customers: 1900, aov: 2600, orders: 2700 },
  { segment: "Trail", customers: 1200, aov: 3800, orders: 1600 },
  { segment: "Premium", customers: 800, aov: 5200, orders: 1100 },
]

export const conversionData: ConversionDataPoint[] = [
  { date: "Week 1", rate: 6.9 },
  { date: "Week 2", rate: 7.2 },
  { date: "Week 3", rate: 7.8 },
  { date: "Week 4", rate: 8.7 },
]

export const campaignResultsTimeline: CampaignTimelinePoint[] = [
  { day: "Day 1", before: 180000, after: 185000 },
  { day: "Day 3", before: 180000, after: 196000 },
  { day: "Day 5", before: 180000, after: 204000 },
  { day: "Day 7", before: 180000, after: 213000 },
  { day: "Day 10", before: 180000, after: 213000 },
  { day: "Day 14", before: 180000, after: 213000 },
]

// ─── Opportunities List ───────────────────────────────────────────────────────
export const opportunitiesList: OpportunityItem[] = [
  {
    title: "Running Shoes → Running Socks",
    type: "Cross-sell",
    revenue: "₹42,600",
    customers: 2840,
    confidence: 87,
    status: "active",
  },
  {
    title: "Premium Insoles Upsell",
    type: "Upsell",
    revenue: "₹28,400",
    customers: 1240,
    confidence: 79,
    status: "active",
  },
  {
    title: "Hydration Pack Cross-sell",
    type: "Cross-sell",
    revenue: "₹18,700",
    customers: 890,
    confidence: 71,
    status: "active",
  },
  {
    title: "Loyalty Tier Upgrade Nudge",
    type: "Retention",
    revenue: "₹12,100",
    customers: 540,
    confidence: 65,
    status: "review",
  },
  {
    title: "Re-engagement — Lapsed Runners",
    type: "Win-back",
    revenue: "₹8,900",
    customers: 380,
    confidence: 61,
    status: "review",
  },
]

// ─── Investigation Data ───────────────────────────────────────────────────────
export const investigationMetrics: InvestigationMetric[] = [
  { label: "Customers Analyzed", value: "12,840", sub: "Total active base" },
  { label: "Orders Analyzed", value: "18,420", sub: "Last 90 days" },
  { label: "Current Attach Rate", value: "16%", sub: "Socks with shoes" },
  { label: "Benchmark Attach Rate", value: "29%", sub: "Category median" },
  { label: "Expected Attach Rate", value: "31%", sub: "Post-campaign target" },
  {
    label: "Expected Additional Orders",
    value: "~417",
    sub: "Sock orders unlocked",
  },
]

export const investigationReasoning: InvestigationReasoning[] = [
  {
    signal: "Co-purchase pattern",
    icon: "📊",
    summary: "Strong basket affinity between running shoes and running socks",
    detail:
      "18,420 orders were scanned over 90 days. Customers who bought running socks within 14 days of shoe purchase show 2.3× higher lifetime value, 41% lower return rates, and 28% higher repeat-order frequency. The co-purchase signal has a Pearson correlation of 0.74 — well above the 0.5 threshold GrowthOS uses to flag opportunities.",
    stat: "r = 0.74 correlation",
    statVariant: "info",
  },
  {
    signal: "Attach rate gap",
    icon: "📉",
    summary: "SoleX attach rate is 13pp below category median",
    detail:
      "SoleX's current sock attach rate of 16% sits well below the sportswear category median of 29% (sampled across 48 comparable merchants on Razorpay). Merchants who ran targeted cross-sell campaigns to close similar gaps saw attach rates of 28–34% within 60 days. GrowthOS estimates SoleX can realistically reach 31%.",
    stat: "13pp gap vs. peers",
    statVariant: "warning",
  },
  {
    signal: "High-intent but unconverted",
    icon: "🔍",
    summary: "2,772 customers browsed socks but didn't buy",
    detail:
      "Of the eligible customer pool, 2,772 visited the running socks category page an average of 2.4 times in the 30 days following their shoe purchase — but did not convert. This indicates latent demand that a timely, well-priced campaign can activate. Email open rates for this segment average 38%, above the SoleX baseline of 27%.",
    stat: "2.4 avg page visits",
    statVariant: "info",
  },
  {
    signal: "Seasonal timing",
    icon: "📅",
    summary: "September–October is peak running accessory season",
    detail:
      "Historical transaction data from the last 3 years shows a consistent 22% spike in running accessory purchases during September–October. Acting now captures the seasonal window. Delay by 3+ weeks and the effective attach rate uplift drops by an estimated 8pp as the intent window closes.",
    stat: "+22% seasonal uplift",
    statVariant: "success",
  },
]

// ─── Campaigns Data ───────────────────────────────────────────────────────────
export const campaignsList: CampaignItem[] = [
  {
    name: '"Complete Your Run"',
    status: "active",
    customers: 2772,
    purchases: 2,
    revenue: "₹5,598",
    uplift: "+0.07%",
    roi: "— (Test Mode)",
  },
  {
    name: '"Premium Insoles Offer"',
    status: "completed",
    customers: 1240,
    purchases: 97,
    revenue: "₹28,400",
    uplift: "+2.1%",
    roi: "3.1×",
  },
  {
    name: '"Trail Season Ready"',
    status: "draft",
    customers: 890,
    purchases: 0,
    revenue: "—",
    uplift: "—",
    roi: "—",
  },
]

// ─── Customers Data ───────────────────────────────────────────────────────────
export const customersList: CustomerItem[] = [
  {
    name: "Priya Sharma",
    email: "priya.s@email.com",
    city: "Mumbai",
    orders: 8,
    ltv: "₹24,800",
    segment: "Premium",
    lastOrder: "Aug 28",
  },
  {
    name: "Rahul Verma",
    email: "rahul.v@email.com",
    city: "Bengaluru",
    orders: 5,
    ltv: "₹14,200",
    segment: "Running",
    lastOrder: "Aug 30",
  },
  {
    name: "Ananya Singh",
    email: "ananya.s@email.com",
    city: "Delhi",
    orders: 12,
    ltv: "₹38,400",
    segment: "Premium",
    lastOrder: "Aug 29",
  },
  {
    name: "Karthik Nair",
    email: "k.nair@email.com",
    city: "Chennai",
    orders: 3,
    ltv: "₹7,600",
    segment: "Casual",
    lastOrder: "Aug 25",
  },
  {
    name: "Meera Iyer",
    email: "meera.i@email.com",
    city: "Pune",
    orders: 7,
    ltv: "₹19,600",
    segment: "Training",
    lastOrder: "Aug 31",
  },
  {
    name: "Aditya Kumar",
    email: "aditya.k@email.com",
    city: "Hyderabad",
    orders: 4,
    ltv: "₹11,200",
    segment: "Running",
    lastOrder: "Aug 27",
  },
  {
    name: "Sneha Reddy",
    email: "sneha.r@email.com",
    city: "Bengaluru",
    orders: 9,
    ltv: "₹27,900",
    segment: "Trail",
    lastOrder: "Aug 30",
  },
  {
    name: "Vikram Joshi",
    email: "v.joshi@email.com",
    city: "Mumbai",
    orders: 2,
    ltv: "₹5,400",
    segment: "Casual",
    lastOrder: "Aug 22",
  },
]

// ─── AI Activity Logs ─────────────────────────────────────────────────────────
export const aiActivityLogs: AIActivityLog[] = [
  {
    time: "Aug 31, 2026 · 15:10",
    title: "Test Revenue Captured",
    type: "result",
    detail:
      "Captured ₹5,598 across 2 verified Razorpay Test Mode transactions.",
    meta: "Verified Payments: 2 · Sandbox Revenue: ₹5,598 · Bundle Price: ₹2,799",
    status: "success",
  },
  {
    time: "Aug 31, 2026 · 15:08",
    title: "Razorpay Test Payment Verified",
    type: "result",
    detail:
      "Cryptographic HMAC-SHA256 signature verified authentic for payment pay_test_complete_run_002.",
    meta: "Payment: ₹2,799 INR · Link: plink_test_complete_your_run_01 · Status: Captured",
    status: "success",
  },
  {
    time: "Aug 31, 2026 · 14:35",
    title: "Razorpay Test Payment Verified",
    type: "result",
    detail:
      "Cryptographic HMAC-SHA256 signature verified authentic for payment pay_test_complete_run_001.",
    meta: "Payment: ₹2,799 INR · Link: plink_test_complete_your_run_01 · Status: Captured",
    status: "success",
  },
  {
    time: "Aug 31, 2026 · 14:30",
    title: "Razorpay Test Payment Link Created",
    type: "recommendation",
    detail:
      'Created sandbox payment link plink_test_complete_your_run_01 for "Complete Your Run" at ₹2,799.',
    meta: "Link ID: plink_test_complete_your_run_01 · Mode: Test Mode · Sandbox Only",
    status: "completed",
  },
  {
    time: "Aug 31, 2026 · 14:25",
    title: "Campaign Launched",
    type: "recommendation",
    detail:
      '"Complete Your Run" initiated in Razorpay Test Mode for 2,772 eligible customers.',
    meta: "Target: 2,772 customers · Mode: Test Mode · Sandbox Active",
    status: "completed",
  },
  {
    time: "Aug 31, 2026 · 14:21",
    title: "Merchant Approval Received",
    type: "recommendation",
    detail:
      'Merchant approved execution of campaign "Complete Your Run" at ₹2,799 for 2,772 customers.',
    meta: "Approver: Ishan Khandelwal · Action Gate: Passed · Mode: Test Only",
    status: "completed",
  },
  {
    time: "Aug 31, 2026 · 14:23",
    type: "opportunity",
    title: "Opportunity Discovered",
    detail: "Running Shoes → Running Socks cross-sell opportunity identified",
    meta: "18,420 orders analyzed · 2,772 customers eligible · Confidence: 89%",
    status: "completed",
  },
  {
    time: "Aug 31, 2026 · 14:18",
    title: "Customer Segment Analyzed",
    type: "analysis",
    detail:
      "Segmented 2,772 customers based on purchase recency, sock page visits, and email engagement",
    meta: "Model: Segment Clustering v2.1 · Runtime: 1.4s",
    status: "completed",
  },
  {
    time: "Aug 31, 2026 · 14:19",
    title: "Campaign Recommendation Generated",
    type: "recommendation",
    detail:
      'AI generated "Complete Your Run" campaign with bundle pricing of ₹2,799',
    meta: "Channel mix: Email 60% + WhatsApp 40% · Expected conversion: 6.5%",
    status: "completed",
  },
  {
    time: "Aug 30, 2026 · 09:42",
    title: "Attach Rate Benchmark Analysis",
    type: "analysis",
    detail:
      "Compared SoleX sock attach rate (16%) against category median (29%) across 48 similar merchants",
    meta: "Data period: 90 days · Benchmark cohort: 48 merchants",
    status: "completed",
  },
  {
    time: "Aug 29, 2026 · 18:11",
    title: "Seasonal Opportunity Window Detected",
    type: "opportunity",
    detail:
      "Running season spike predicted for Sep–Oct based on 3-year historical pattern",
    meta: "Predicted uplift: +22% · Confidence: 91%",
    status: "completed",
  },
  {
    time: "Aug 28, 2026 · 11:05",
    title: "Premium Insoles Campaign Completed",
    type: "result",
    detail:
      'Campaign "Premium Insoles Offer" concluded. 97 purchases from 1,240 targeted customers.',
    meta: "Revenue: ₹28,400 · ROI: 3.1× · AOV Uplift: +₹240",
    status: "success",
  },
]

// ─── Settings Sections ────────────────────────────────────────────────────────
export const settingsSections: SettingsSection[] = [
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
]
