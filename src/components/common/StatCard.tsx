import type { StatCardProps } from "../../types"

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  positive = true,
}: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold text-slate-900 tracking-tight mono">
          {value}
        </span>
        {change && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              positive ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {positive ? "↑" : "↓"} {change}
          </span>
        )}
      </div>
      {changeLabel && (
        <p className="text-xs text-slate-400 -mt-1">{changeLabel}</p>
      )}
    </div>
  )
}

export default StatCard
