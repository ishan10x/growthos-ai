import type { Order, OrderItem, ProductEvent } from "../types/dataFoundation"

export interface AttachRateResult {
  sourceBuyersCount: number
  coBuyersCount: number
  attachRate: number
  sourceCustomerIds: Set<string>
  coBuyerCustomerIds: Set<string>
}

export interface PeriodRevenueSummary {
  periodLabel: string
  revenue: number
  orderCount: number
}

/**
 * Calculates the attach rate of a target product relative to a source product.
 *
 * Definition:
 *   Attach Rate = (Unique customers who bought BOTH source & target product) /
 *                 (Unique customers who bought the source product)
 *
 * @param sourceProductId - Product ID of the primary anchor product (e.g. Running Shoes)
 * @param targetProductId - Product ID of the cross-sell candidate (e.g. Running Socks)
 * @param orders - Array of merchant orders
 * @param orderItems - Array of order items
 */
export function calculateAttachRate(
  sourceProductId: string,
  targetProductId: string,
  orders: Order[],
  orderItems: OrderItem[],
): AttachRateResult {
  // Map orders to customer IDs
  const orderToCustomerMap = new Map<string, string>()
  for (const o of orders) {
    if (o.status !== "refunded") {
      orderToCustomerMap.set(o.id, o.customerId)
    }
  }

  // Collect customers for source and target products
  const sourceCustomerIds = new Set<string>()
  const targetCustomerIds = new Set<string>()

  for (const item of orderItems) {
    const customerId = orderToCustomerMap.get(item.orderId)
    if (!customerId) continue

    if (item.productId === sourceProductId) {
      sourceCustomerIds.add(customerId)
    }
    if (item.productId === targetProductId) {
      targetCustomerIds.add(customerId)
    }
  }

  const coBuyerCustomerIds = new Set<string>()
  for (const custId of sourceCustomerIds) {
    if (targetCustomerIds.has(custId)) {
      coBuyerCustomerIds.add(custId)
    }
  }

  const sourceBuyersCount = sourceCustomerIds.size
  const coBuyersCount = coBuyerCustomerIds.size
  const attachRate =
    sourceBuyersCount > 0 ? coBuyersCount / sourceBuyersCount : 0

  return {
    sourceBuyersCount,
    coBuyersCount,
    attachRate,
    sourceCustomerIds,
    coBuyerCustomerIds,
  }
}

/**
 * Calculates co-purchase frequency for all product pairs across orders.
 */
export function calculateProductPairFrequency(
  orders: Order[],
  orderItems: OrderItem[],
): Map<string, number> {
  // Group products by order
  const orderProductMap = new Map<string, Set<string>>()
  for (const item of orderItems) {
    if (!orderProductMap.has(item.orderId)) {
      orderProductMap.set(item.orderId, new Set())
    }
    orderProductMap.get(item.orderId)!.add(item.productId)
  }

  const pairCounts = new Map<string, number>()

  for (const [, products] of orderProductMap) {
    if (products.size < 2) continue
    const prodArray = Array.from(products).sort()
    for (let i = 0; i < prodArray.length; i++) {
      for (let j = i + 1; j < prodArray.length; j++) {
        const pairKey = `${prodArray[i]}:${prodArray[j]}`
        pairCounts.set(pairKey, (pairCounts.get(pairKey) || 0) + 1)
      }
    }
  }

  return pairCounts
}

/**
 * Calculates Average Order Value (AOV) for completed orders.
 */
export function calculateAverageOrderValue(orders: Order[]): number {
  const completedOrders = orders.filter((o) => o.status === "completed")
  if (completedOrders.length === 0) return 0
  const totalRevenue = completedOrders.reduce(
    (sum, o) => sum + o.totalAmount,
    0,
  )
  return totalRevenue / completedOrders.length
}

/**
 * Calculates Customer Lifetime Value (LTV) for a given customer.
 */
export function calculateCustomerLifetimeValue(
  customerId: string,
  orders: Order[],
): number {
  return orders
    .filter((o) => o.customerId === customerId && o.status === "completed")
    .reduce((sum, o) => sum + o.totalAmount, 0)
}

/**
 * Calculates conversion rate from product events (views to purchases).
 */
export function calculateConversionRate(events: ProductEvent[]): number {
  const viewers = new Set<string>()
  const purchasers = new Set<string>()

  for (const e of events) {
    if (e.eventType === "product_view") viewers.add(e.customerId)
    if (e.eventType === "purchase") purchasers.add(e.customerId)
  }

  if (viewers.size === 0) return 0
  return purchasers.size / viewers.size
}

/**
 * Aggregates revenue by period (daily, weekly, or monthly).
 */
export function calculateRevenueByPeriod(
  orders: Order[],
  period: "daily" | "weekly" | "monthly" = "daily",
): PeriodRevenueSummary[] {
  interface Accumulator {
    revenue: number
    orderCount: number
  }
  const map = new Map<string, Accumulator>()

  for (const o of orders) {
    if (o.status !== "completed") continue
    let label = o.orderDate

    if (period === "monthly") {
      label = o.orderDate.substring(0, 7) // YYYY-MM
    } else if (period === "weekly") {
      const date = new Date(o.orderDate)
      const weekNumber = Math.ceil(date.getDate() / 7)
      label = `${o.orderDate.substring(0, 7)}-W${weekNumber}`
    }

    const current = map.get(label) || { revenue: 0, orderCount: 0 }
    current.revenue += o.totalAmount
    current.orderCount += 1
    map.set(label, current)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periodLabel, data]) => ({
      periodLabel,
      revenue: data.revenue,
      orderCount: data.orderCount,
    }))
}
