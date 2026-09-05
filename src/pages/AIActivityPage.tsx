import { useState, useMemo } from "react"
import type React from "react"
import { Icons } from "../components/common/Icons"
import { Badge } from "../components/common/Badge"
import { aiService } from "../services/aiService"

export function AIActivityPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  const typeStyles: Record<string, string> = {
    opportunity: "bg-blue-100 text-blue-600",
    analysis: "bg-indigo-100 text-indigo-600",
    recommendation: "bg-purple-100 text-purple-600",
    pending: "bg-amber-100 text-amber-600",
    result: "bg-emerald-100 text-emerald-600",
    fallback: "bg-teal-100 text-teal-600",
    error: "bg-red-100 text-red-600",
  }

  const typeIcons: Record<string, React.ReactNode> = {
    opportunity: Icons.sparkle,
    analysis: Icons.info,
    recommendation: Icons.ai,
    pending: Icons.bell,
    result: Icons.check,
    fallback: Icons.sparkle,
    error: Icons.bell,
  }

  const logs = useMemo(() => aiService.getAIActivityLogs(), [])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedCategory === "All") return true
      if (selectedCategory === "Opportunities")
        return log.type === "opportunity" || log.type === "fallback"
      if (selectedCategory === "Analysis") return log.type === "analysis"
      if (selectedCategory === "Campaigns") {
        return (
          log.type === "recommendation" ||
          log.type === "pending" ||
          log.type === "result"
        )
      }
      return true
    })
  }, [logs, selectedCategory])

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            AI Activity Log
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Full audit trail of AI decisions, analyses, and recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">
              AI Active
            </span>
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
          <div
            key={s.label}
            className="bg-white border border-slate-200 rounded-xl px-5 py-4"
          >
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
              {s.label}
            </p>
            <p className="text-2xl font-semibold text-slate-900 mono">
              {s.value}
            </p>
            <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Activity Timeline
          </h2>
          <div className="flex gap-2">
            {["All", "Opportunities", "Analysis", "Campaigns"].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedCategory(f)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  selectedCategory === f
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {filteredLogs.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-400">
              No activity found
            </div>
          ) : (
            filteredLogs.map((log, i) => (
              <div
                key={i}
                className="flex gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${typeStyles[log.type] || "bg-slate-100 text-slate-500"}`}
                >
                  {typeIcons[log.type] || Icons.info}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-semibold text-slate-900">
                      {log.title}
                    </p>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 ml-4 mono">
                      {log.time}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1.5">{log.detail}</p>
                  <p className="text-xs text-slate-400 mono">{log.meta}</p>
                </div>
                <div className="flex-shrink-0">
                  <Badge
                    variant={
                      log.status === "completed"
                        ? "success"
                        : log.status === "pending"
                          ? "warning"
                          : log.status === "success"
                            ? "success"
                            : "muted"
                    }
                  >
                    {log.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AIActivityPage
