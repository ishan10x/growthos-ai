import type { Page } from "../../types"
import { Icons } from "../common/Icons"

export interface TopBarProps {
  onNav: (p: Page) => void
}

export function TopBar({ onNav }: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      {/* Merchant */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">S</span>
        </div>
        <div>
          <span className="text-sm font-semibold text-slate-900">SoleX</span>
          <span className="ml-2 text-xs text-slate-400">
            Merchant ID: MID7823491
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* AI Status */}
        <button
          onClick={() => onNav("ai-activity")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full hover:bg-emerald-100 transition-colors"
        >
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700">
            AI Online
          </span>
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
          {Icons.bell}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">AK</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-700">Arjun Kumar</p>
            <p className="text-[10px] text-slate-400">Growth Manager</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopBar
