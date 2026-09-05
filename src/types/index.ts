import type React from "react"

export type Page = "dashboard" | "opportunities" | "opportunity-detail" | "opportunity-investigate" | "campaign-create" | "campaign-results" | "customers" | "analytics" | "ai-activity" | "settings"

export type BadgeVariant = "default" | "success" | "warning" | "info" | "muted"

export interface StatCardProps {
  label: string
  value: string
  change?: string
  changeLabel?: string
  positive?: boolean
}

export interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export interface RevenueDataPoint {
  date: string
  revenue: number
  prev: number
}

export interface CustomerSegment {
  segment: string
  customers: number
  aov: number
  orders: number
}

export interface ConversionDataPoint {
  date: string
  rate: number
}

export interface CampaignTimelinePoint {
  day: string
  before: number
  after: number
}

export interface OpportunityItem {
  title: string
  type: string
  revenue: string
  customers: number
  confidence: number
  status: "active" | "review" | string
}

export interface InvestigationMetric {
  label: string
  value: string
  sub: string
}

export interface InvestigationReasoning {
  signal: string
  icon: string
  summary: string
  detail: string
  stat: string
  statVariant: "info" | "warning" | "success" | "muted"
}

export interface CampaignItem {
  name: string
  status: "active" | "completed" | "draft" | string
  customers: number
  purchases: number
  revenue: string
  uplift: string
  roi: string
}

export interface CustomerItem {
  name: string
  email: string
  city: string
  orders: number
  ltv: string
  segment: string
  lastOrder: string
}

export interface AIActivityLog {
  time: string
  title: string
  type: "opportunity" | "analysis" | "recommendation" | "pending" | "result" | string
  detail: string
  meta: string
  status: "completed" | "pending" | "success" | string
}

export interface SettingsSection {
  title: string
  items: { label: string value: string }[]
}
