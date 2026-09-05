import { useState } from "react"
import type { Page } from "../../types"
import type { MerchantQueryResponse } from "../../types/ai"
import { Icons } from "../common/Icons"
import { Badge } from "../common/Badge"
import { aiService } from "../../services/aiService"

export interface AICommandBarProps {
  onNav: (p: Page) => void
}

export function AICommandBar({ onNav }: AICommandBarProps) {
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<MerchantQueryResponse | null>(null)

  const samplePrompts = [
    "Find my biggest revenue opportunity",
    "Why did you find the Running Shoes opportunity?",
    "How many customers are eligible?",
    "What should I offer these customers?",
    "What is the expected incremental revenue?",
  ]

  const handleExecuteQuery = async (queryText: string) => {
    if (!queryText.trim()) return
    setLoading(true)
    setFocused(false)
    try {
      const res = await aiService.askGrowthOS(queryText)
      setResponse(res)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleExecuteQuery(query)
    } else if (e.key === "Escape") {
      setResponse(null)
      setFocused(false)
    }
  }

  return (
    <div className="relative mb-6">
      <div
        className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition-all ${
          focused || response
            ? "border-blue-400 shadow-sm shadow-blue-100"
            : "border-slate-200"
        }`}
      >
        <span className="text-blue-500 flex-shrink-0">
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin inline-block" />
          ) : (
            Icons.sparkle
          )}
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="✨  Ask GrowthOS anything — e.g. Find my biggest revenue opportunity"
          className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              setResponse(null)
            }}
            className="text-slate-300 hover:text-slate-500 transition-colors text-xs"
          >
            ✕
          </button>
        )}
        <button
          onClick={() => handleExecuteQuery(query)}
          disabled={!query.trim() || loading}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
            query.trim() && !loading
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          Ask
        </button>
        <span className="text-[10px] text-slate-300 font-medium border border-slate-200 rounded px-1.5 py-0.5 flex-shrink-0">
          ↵
        </span>
      </div>

      {/* Suggested prompts dropdown */}
      {focused && !query && !response && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-3">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider px-2 mb-2">
            Suggested prompts
          </p>
          <div className="flex flex-col gap-0.5">
            {samplePrompts.map((promptText) => (
              <button
                key={promptText}
                onMouseDown={() => {
                  setQuery(promptText)
                  handleExecuteQuery(promptText)
                }}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
              >
                <span className="text-blue-400 flex-shrink-0">
                  {Icons.sparkle}
                </span>
                <span className="text-sm text-slate-700">{promptText}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive AI Query Response Card */}
      {response && (
        <div className="mt-3 bg-white border border-blue-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Badge variant="info">
                <span>{Icons.sparkle}</span> GrowthOS AI
              </Badge>
              <span className="text-xs text-slate-400 font-medium capitalize">
                {response.queryType} analysis
              </span>
              <span className="text-xs text-slate-300">·</span>
              <span className="text-[11px] text-emerald-600 font-medium">
                Verified Engine Authoritative
              </span>
            </div>
            <button
              onClick={() => setResponse(null)}
              className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>

          <p className="text-sm text-slate-800 leading-relaxed mb-4">
            {response.answer}
          </p>

          {response.relevantMetrics && response.relevantMetrics.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-4">
              {response.relevantMetrics.map((m) => (
                <div
                  key={m.label}
                  className="bg-slate-50 border border-slate-100 rounded-lg p-2.5"
                >
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                    {m.label}
                  </p>
                  <p className="text-sm font-bold text-slate-900 mono">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {response.suggestedAction && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Recommended next step:
              </span>
              <button
                onClick={() => {
                  onNav(response.suggestedAction!.page)
                  setResponse(null)
                }}
                className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                {response.suggestedAction.label}
                <span className="text-white text-xs">{Icons.chevronRight}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AICommandBar
