/**
 * Phase 3 GrowthOS Data Foundation Types
 * Typed domain entities for Products, Customers, Orders, Events, Campaigns, and Opportunities.
 */

export interface Product {
  id: string
  name: string
  category: "Footwear" | "Accessories" | "Apparel" | string
  price: number
  active: boolean
}

export interface Customer {
  id: string
  name: string
  email: string
  city: string
  segment: "Running" | "Casual" | "Training" | "Trail" | "Premium" | string
  createdAt: string
}

export interface Order {
  id: string
  customerId: string
  orderDate: string
  status: "completed" | "refunded" | "processing"
  totalAmount: number
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
}

export interface ProductEvent {
  id: string
  customerId: string
  productId: string
  eventType: "product_view" | "add_to_cart" | "purchase"
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface CampaignRecord {
  id: string
  name: string
  status: "active" | "completed" | "draft" | string
  targetSegment: string
  sourceProductId: string
  recommendedProductId: string
  bundlePrice: number
  channel: "Email" | "WhatsApp" | "Email + WhatsApp" | string
  customersTargeted: number
  purchasesCount: number
  actualIncrementalRevenue: number
  conversionUpliftPercent: number
  roi: string
  launchedAt?: string
  completedAt?: string
}

export interface AIActivityRecord {
  id: string
  timestamp: string
  type: "opportunity" | "analysis" | "recommendation" | "pending" | "result" | string
  title: string
  detail: string
  meta: string
  status: "completed" | "pending" | "success" | string
  model?: string
  confidencePercent?: number
}

export interface CrossSellOpportunity {
  sourceProduct: Product
  recommendedProduct: Product
  sourceBuyers: number
  coBuyers: number
  attachRate: number
  benchmarkAttachRate: number
  gap: number
  estimatedEligibleCustomers: number
  averageOrderValue: number
  expectedIncrementalOrders: number
  estimatedIncrementalRevenue: number
  confidenceScore: number
  reasoningSummary: string
}

export interface MerchantDataset {
  merchantId: string
  merchantName: string
  products: Product[]
  customers: Customer[]
  orders: Order[]
  orderItems: OrderItem[]
  events: ProductEvent[]
  campaigns: CampaignRecord[]
  aiActivities: AIActivityRecord[]
}
