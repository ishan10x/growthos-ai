import { useState } from "react"
import type { Page } from "../../types"
import { Icons } from "../common/Icons"

export interface AICommandBarProps {
  onNav: (p: Page) => void
}

export function AICommandBar({ onNav }: AICommandBarProps) {
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)

  const prompts = [
    {
      text: "Find my biggest revenue opportunity",
      page: "opportunity-investigate" as Page,
    },
    { text: "Which products should I bundle?", page: "opportunities" as Page },
    { text: "Why did revenue change?", page: "analytics" as Page },
    {
      text: "Create a campaign for my best customers",
      page: "campaign-create" as Page,
    },
  ]

  return (
    <div className="relative mb-6">
      <div
        className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition-all ${
          focused
            ? "border-blue-400 shadow-sm shadow-blue-100"
            : "border-slate-200"
        }`}
      >
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
            onClick={() => {
              setQuery("")
            }}
            className="text-slate-300 hover:text-slate-500 transition-colors text-xs"
          >
            ✕
          </button>
        )}
        <span className="text-[10px] text-slate-300 font-medium border border-slate-200 rounded px-1.5 py-0.5 flex-shrink-0">
          ⌘K
        </span>
      </div>

      {focused && !query && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-3">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider px-2 mb-2">
            Suggested prompts
          </p>
          <div className="flex flex-col gap-0.5">
            {prompts.map((p) => (
              <button
                key={p.text}
                onMouseDown={() => {
                  onNav(p.page)
                  setFocused(false)
                }}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
              >
                <span className="text-blue-400 flex-shrink-0">
                  {Icons.sparkle}
                </span>
                <span className="text-sm text-slate-700">{p.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AICommandBar
