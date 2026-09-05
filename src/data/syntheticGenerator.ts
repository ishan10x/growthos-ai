import type {
  Product,
  Customer,
  Order,
  OrderItem,
  ProductEvent,
  CampaignRecord,
  AIActivityRecord,
  MerchantDataset,
} from "../types/dataFoundation"

/**
 * Fast, deterministic Pseudo-Random Number Generator (Mulberry32).
 * Guarantees identical dataset generation across any environment with seed 42.
 */
export function createPrng(seed: number = 42) {
  let s = seed | 0
  return function next(): number {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ─── Core Products Catalog ───────────────────────────────────────────────────
export const SOLEX_PRODUCTS: Product[] = [
  {
    id: "prod_shoes_running",
    name: "Running Shoes",
    category: "Footwear",
    price: 2499,
    active: true,
  },
  {
    id: "prod_socks_running",
    name: "Running Socks",
    category: "Accessories",
    price: 499,
    active: true,
  },
  {
    id: "prod_insoles_premium",
    name: "Premium Insoles",
    category: "Accessories",
    price: 799,
    active: true,
  },
  {
    id: "prod_shoes_trail",
    name: "Trail Shoes",
    category: "Footwear",
    price: 3299,
    active: true,
  },
  {
    id: "prod_shoes_training",
    name: "Training Shoes",
    category: "Footwear",
    price: 2199,
    active: true,
  },
  {
    id: "prod_shorts_sports",
    name: "Sports Shorts",
    category: "Apparel",
    price: 899,
    active: true,
  },
  {
    id: "prod_tshirt_running",
    name: "Running T-Shirt",
    category: "Apparel",
    price: 749,
    active: true,
  },
  {
    id: "prod_hydration_pack",
    name: "Hydration Pack",
    category: "Accessories",
    price: 1299,
    active: true,
  },
]

const FIRST_NAMES = [
  "Aarav",
  "Aditya",
  "Ananya",
  "Arjun",
  "Diya",
  "Isha",
  "Kavya",
  "Karthik",
  "Meera",
  "Neha",
  "Pooja",
  "Pranav",
  "Priya",
  "Rahul",
  "Rhea",
  "Rohan",
  "Siddharth",
  "Sneha",
  "Tanvi",
  "Varun",
  "Vikram",
  "Zara",
  "Aman",
  "Rishi",
  "Kiran",
  "Nikhil",
  "Shreya",
  "Deepak",
  "Gaurav",
  "Simran",
  "Suresh",
  "Manish",
]

const LAST_NAMES = [
  "Sharma",
  "Verma",
  "Singh",
  "Nair",
  "Iyer",
  "Kumar",
  "Reddy",
  "Joshi",
  "Mehta",
  "Patel",
  "Gupta",
  "Malhotra",
  "Bhatia",
  "Deshmukh",
  "Chopra",
  "Menon",
  "Saxena",
  "Kapoor",
  "Rao",
  "Pillai",
  "Das",
  "Sen",
  "Bose",
]

const CITIES = [
  "Mumbai",
  "Bengaluru",
  "Delhi",
  "Chennai",
  "Pune",
  "Hyderabad",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
  "Kochi",
  "Lucknow",
]

/**
 * Deterministically generates the complete synthetic merchant dataset for SoleX (MID7823491).
 */
export function generateSyntheticMerchantData(
  seed: number = 42,
): MerchantDataset {
  const prng = createPrng(seed)

  // Helper pickers
  const pick = <T>(arr: T[]): T => arr[Math.floor(prng() * arr.length)]
  const randRange = (min: number, max: number): number =>
    min + prng() * (max - min)
  const randInt = (min: number, max: number): number =>
    Math.floor(randRange(min, max + 1))

  // 1. Generate 12,840 Customers
  const totalCustomers = 12840
  const segmentQuotas: Record<string, number> = {
    Running: 4150,
    Casual: 3630,
    Training: 2460,
    Trail: 1560,
    Premium: 1040,
  }

  const segments = Object.keys(segmentQuotas)
  const customers: Customer[] = []
  let customerIndex = 0

  for (const seg of segments) {
    const count = segmentQuotas[seg]
    for (let i = 0; i < count; i++) {
      customerIndex++
      const firstName = pick(FIRST_NAMES)
      const lastName = pick(LAST_NAMES)
      const id = `cust_${String(customerIndex).padStart(5, "0")}`
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${customerIndex % 99 || ""}@email.com`
      const city = pick(CITIES)

      // Creation dates across the past 365 days
      const daysAgo = randInt(1, 365)
      const createdTime = new Date(Date.UTC(2026, 7, 31) - daysAgo * 86400000)

      customers.push({
        id,
        name: `${firstName} ${lastName}`,
        email,
        city,
        segment: seg,
        createdAt: createdTime.toISOString().split("T")[0],
      })
    }
  }

  // 2. Generate Orders and Order Items
  // Target: ~18,420 total orders over 90 days (June 2, 2026 to August 31, 2026)
  const totalOrdersTarget = 18420
  const orders: Order[] = []
  const orderItems: OrderItem[] = []
  const events: ProductEvent[] = []

  const startDate = new Date(Date.UTC(2026, 5, 2)).getTime() // June 2, 2026
  const endDate = new Date(Date.UTC(2026, 7, 31, 23, 59, 59)).getTime() // Aug 31, 2026
  const totalTimeSpan = endDate - startDate

  // We designate exactly 3,380 unique customers who purchase Running Shoes.
  // Among them, exactly 540 will co-purchase Running Socks.
  // The remaining 2,840 customers will NOT purchase Running Socks (eligible unconverted cross-sell pool).
  // Observed attach rate: 540 / 3,380 = 15.976% (~16%).
  const runningShoeBuyers = new Set<string>()
  const sockCoBuyers = new Set<string>()

  // Designate the running shoe cohort primarily from Running & Premium segments
  const runningCandidates = customers.filter(
    (c) => c.segment === "Running" || c.segment === "Premium",
  )
  const otherCandidates = customers.filter(
    (c) => c.segment !== "Running" && c.segment !== "Premium",
  )

  // Pick exactly 3,380 running shoe buyers
  for (let i = 0; i < 2800 && i < runningCandidates.length; i++) {
    runningShoeBuyers.add(runningCandidates[i].id)
  }
  let otherIdx = 0
  while (runningShoeBuyers.size < 3380 && otherIdx < otherCandidates.length) {
    runningShoeBuyers.add(otherCandidates[otherIdx].id)
    otherIdx++
  }

  // Pick exactly 540 of those shoe buyers to be co-buyers of socks
  const runningShoeBuyerArray = Array.from(runningShoeBuyers)
  for (let i = 0; i < 540; i++) {
    sockCoBuyers.add(runningShoeBuyerArray[i])
  }

  // 2,840 remaining running shoe buyers who browsed socks but never bought
  const unconvertedHighIntentShoeBuyers = runningShoeBuyerArray.slice(540, 3380)

  let orderCounter = 0
  let itemCounter = 0
  let eventCounter = 0

  // Create baseline orders for running shoe buyers ensuring designated items
  for (const buyerId of runningShoeBuyerArray) {
    orderCounter++
    const orderId = `ord_${String(orderCounter).padStart(6, "0")}`
    const orderTimestamp = startDate + randRange(0, totalTimeSpan)
    const orderDate = new Date(orderTimestamp).toISOString().split("T")[0]

    const isCoBuyer = sockCoBuyers.has(buyerId)
    const buySocksTogether = isCoBuyer && prng() < 0.65 // 65% buy socks in same basket

    interface OrderItemDraft {
      product: Product
      qty: number
    }
    const itemsForOrder: OrderItemDraft[] = []
    const shoes = SOLEX_PRODUCTS.find((p) => p.id === "prod_shoes_running")!
    itemsForOrder.push({ product: shoes, qty: 1 })

    if (buySocksTogether) {
      const socks = SOLEX_PRODUCTS.find((p) => p.id === "prod_socks_running")!
      itemsForOrder.push({ product: socks, qty: randInt(1, 2) })
    } else if (prng() < 0.25) {
      // maybe buy shorts or t-shirt
      itemsForOrder.push({
        product: SOLEX_PRODUCTS.find((p) => p.id === "prod_tshirt_running")!,
        qty: 1,
      })
    }

    let orderTotal = 0
    for (const item of itemsForOrder) {
      itemCounter++
      const itemTotal = item.product.price * item.qty
      orderTotal += itemTotal
      orderItems.push({
        id: `item_${String(itemCounter).padStart(6, "0")}`,
        orderId,
        productId: item.product.id,
        quantity: item.qty,
        unitPrice: item.product.price,
      })

      // Purchase event
      eventCounter++
      events.push({
        id: `evt_${String(eventCounter).padStart(7, "0")}`,
        customerId: buyerId,
        productId: item.product.id,
        eventType: "purchase",
        timestamp: new Date(orderTimestamp).toISOString(),
      })
    }

    orders.push({
      id: orderId,
      customerId: buyerId,
      orderDate,
      status: prng() < 0.02 ? "refunded" : "completed",
      totalAmount: orderTotal,
    })

    // If co-buyer didn't buy socks together, buy in a second order 1-14 days later
    if (isCoBuyer && !buySocksTogether) {
      orderCounter++
      const secondOrderId = `ord_${String(orderCounter).padStart(6, "0")}`
      const secondTime = Math.min(
        endDate,
        orderTimestamp + randRange(86400000, 14 * 86400000),
      )
      const socks = SOLEX_PRODUCTS.find((p) => p.id === "prod_socks_running")!
      const sockQty = randInt(1, 2)

      itemCounter++
      orderItems.push({
        id: `item_${String(itemCounter).padStart(6, "0")}`,
        orderId: secondOrderId,
        productId: socks.id,
        quantity: sockQty,
        unitPrice: socks.price,
      })

      orders.push({
        id: secondOrderId,
        customerId: buyerId,
        orderDate: new Date(secondTime).toISOString().split("T")[0],
        status: "completed",
        totalAmount: socks.price * sockQty,
      })

      eventCounter++
      events.push({
        id: `evt_${String(eventCounter).padStart(7, "0")}`,
        customerId: buyerId,
        productId: socks.id,
        eventType: "purchase",
        timestamp: new Date(secondTime).toISOString(),
      })
    }
  }

  // Generate the remaining orders across the general customer base up to ~18,420 orders
  const nonRunningBuyers = customers.filter((c) => !runningShoeBuyers.has(c.id))
  const generalProducts = SOLEX_PRODUCTS.filter(
    (p) => p.id !== "prod_shoes_running",
  )

  while (orders.length < totalOrdersTarget) {
    orderCounter++
    const customer = pick(nonRunningBuyers)
    const orderId = `ord_${String(orderCounter).padStart(6, "0")}`
    const orderTimestamp = startDate + randRange(0, totalTimeSpan)
    const orderDate = new Date(orderTimestamp).toISOString().split("T")[0]

    // Pick 1 to 2 random products (excluding running shoes to keep running shoes cohort exact)
    const itemCount = prng() < 0.75 ? 1 : 2
    let orderTotal = 0

    for (let i = 0; i < itemCount; i++) {
      const prod = pick(generalProducts)
      const qty = randInt(1, 2)
      itemCounter++
      orderTotal += prod.price * qty

      orderItems.push({
        id: `item_${String(itemCounter).padStart(6, "0")}`,
        orderId,
        productId: prod.id,
        quantity: qty,
        unitPrice: prod.price,
      })

      eventCounter++
      events.push({
        id: `evt_${String(eventCounter).padStart(7, "0")}`,
        customerId: customer.id,
        productId: prod.id,
        eventType: "purchase",
        timestamp: new Date(orderTimestamp).toISOString(),
      })
    }

    orders.push({
      id: orderId,
      customerId: customer.id,
      orderDate,
      status: prng() < 0.02 ? "refunded" : "completed",
      totalAmount: orderTotal,
    })
  }

  // 3. Generate Product Browsing Events (views and add_to_cart)
  // For the 2,840 unconverted running shoe buyers, inject an average of 2.4 product_views
  // for Running Socks over the 30 days after buying shoes.
  const socksProduct = SOLEX_PRODUCTS.find(
    (p) => p.id === "prod_socks_running",
  )!
  for (const unconvertedId of unconvertedHighIntentShoeBuyers) {
    const viewCount = randInt(1, 4) // average ~2.4 views
    for (let v = 0; v < viewCount; v++) {
      eventCounter++
      const viewTime = startDate + randRange(0, totalTimeSpan)
      events.push({
        id: `evt_${String(eventCounter).padStart(7, "0")}`,
        customerId: unconvertedId,
        productId: socksProduct.id,
        eventType: "product_view",
        timestamp: new Date(viewTime).toISOString(),
        metadata: {
          referrer: "category_page",
          sessionDurationSec: randInt(30, 180),
        },
      })

      if (prng() < 0.28) {
        eventCounter++
        events.push({
          id: `evt_${String(eventCounter).padStart(7, "0")}`,
          customerId: unconvertedId,
          productId: socksProduct.id,
          eventType: "add_to_cart",
          timestamp: new Date(viewTime + 45000).toISOString(),
        })
      }
    }
  }

  // 4. Structured Campaigns Data
  const campaigns: CampaignRecord[] = [
    {
      id: "camp_001",
      name: '"Complete Your Run"',
      status: "active",
      targetSegment: "Running Shoe Buyers (Unconverted Socks)",
      sourceProductId: "prod_shoes_running",
      recommendedProductId: "prod_socks_running",
      bundlePrice: 2799,
      channel: "Email + WhatsApp",
      customersTargeted: 2840,
      purchasesCount: 184,
      actualIncrementalRevenue: 47200,
      conversionUpliftPercent: 3.5,
      roi: "4.7×",
      launchedAt: "2026-08-31",
    },
    {
      id: "camp_002",
      name: '"Premium Insoles Offer"',
      status: "completed",
      targetSegment: "High AOV Footwear Buyers",
      sourceProductId: "prod_shoes_running",
      recommendedProductId: "prod_insoles_premium",
      bundlePrice: 2999,
      channel: "Email",
      customersTargeted: 1240,
      purchasesCount: 97,
      actualIncrementalRevenue: 28400,
      conversionUpliftPercent: 2.1,
      roi: "3.1×",
      launchedAt: "2026-08-15",
      completedAt: "2026-08-28",
    },
    {
      id: "camp_003",
      name: '"Trail Season Ready"',
      status: "draft",
      targetSegment: "Trail Runners & Outdoor Explorers",
      sourceProductId: "prod_shoes_trail",
      recommendedProductId: "prod_hydration_pack",
      bundlePrice: 4199,
      channel: "WhatsApp",
      customersTargeted: 890,
      purchasesCount: 0,
      actualIncrementalRevenue: 0,
      conversionUpliftPercent: 0,
      roi: "—",
    },
  ]

  // 5. Structured AI Activity Records
  const aiActivities: AIActivityRecord[] = [
    {
      id: "act_001",
      timestamp: "Aug 31, 2026 · 14:23",
      type: "opportunity",
      title: "Opportunity Discovered",
      detail: "Running Shoes → Running Socks cross-sell opportunity identified",
      meta: "18,420 orders analyzed · 2,840 customers eligible · Confidence: 87%",
      status: "completed",
      model: "GrowthOS Opportunity Engine v2.4",
      confidencePercent: 87,
    },
    {
      id: "act_002",
      timestamp: "Aug 31, 2026 · 14:18",
      type: "analysis",
      title: "Customer Segment Analyzed",
      detail:
        "Segmented 2,840 customers based on purchase recency, sock page visits, and email engagement",
      meta: "Model: Segment Clustering v2.1 · Runtime: 1.4s",
      status: "completed",
      model: "Segment Clustering v2.1",
    },
    {
      id: "act_003",
      timestamp: "Aug 31, 2026 · 14:19",
      type: "recommendation",
      title: "Campaign Recommendation Generated",
      detail:
        'AI generated "Complete Your Run" campaign with bundle pricing of ₹2,799',
      meta: "Channel mix: Email 60% + WhatsApp 40% · Expected conversion: 6.5%",
      status: "completed",
      model: "Campaign Optimizer v3.0",
    },
    {
      id: "act_004",
      timestamp: "Aug 31, 2026 · 14:20",
      type: "pending",
      title: "Merchant Approval Required",
      detail:
        "Campaign requires merchant review before launch. Waiting for approval from Ishan Khandelwal.",
      meta: "SLA: 24 hours · Escalation: Growth Manager",
      status: "pending",
    },
    {
      id: "act_005",
      timestamp: "Aug 30, 2026 · 09:42",
      type: "analysis",
      title: "Attach Rate Benchmark Analysis",
      detail:
        "Compared SoleX sock attach rate against category median (29%) across 48 similar merchants",
      meta: "Data period: 90 days · Benchmark cohort: 48 merchants",
      status: "completed",
      model: "Cohort Benchmark v1.8",
    },
    {
      id: "act_006",
      timestamp: "Aug 29, 2026 · 18:11",
      type: "opportunity",
      title: "Seasonal Opportunity Window Detected",
      detail:
        "Running season spike predicted for Sep–Oct based on 3-year historical pattern",
      meta: "Predicted uplift: +22% · Confidence: 91%",
      status: "completed",
      model: "Seasonal Trend Predictor v2.0",
      confidencePercent: 91,
    },
    {
      id: "act_007",
      timestamp: "Aug 28, 2026 · 11:05",
      type: "result",
      title: "Premium Insoles Campaign Completed",
      detail:
        'Campaign "Premium Insoles Offer" concluded. 97 purchases from 1,240 targeted customers.',
      meta: "Revenue: ₹28,400 · ROI: 3.1× · AOV Uplift: +₹240",
      status: "success",
      model: "Attribution Engine v1.2",
    },
  ]

  return {
    merchantId: "MID7823491",
    merchantName: "SoleX",
    products: SOLEX_PRODUCTS,
    customers,
    orders,
    orderItems,
    events,
    campaigns,
    aiActivities,
  }
}

// In-memory cached dataset singleton for performance
let cachedDataset: MerchantDataset | null = null

export function getMerchantDataset(seed: number = 42): MerchantDataset {
  if (!cachedDataset) {
    cachedDataset = generateSyntheticMerchantData(seed)
  }
  return cachedDataset
}
