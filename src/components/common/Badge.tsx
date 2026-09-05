import type React from "react"
import type { BadgeVariant } from "../../types"

export interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const styles: Record<BadgeVariant, string> = {
    default: "bg-blue-50 text-blue-700 border-blue-100",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    info: "bg-indigo-50 text-indigo-700 border-indigo-100",
    muted: "bg-slate-100 text-slate-600 border-slate-200",
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}
    >
      {children}
    </span>
  )
}

export default Badge
