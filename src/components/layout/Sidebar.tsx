import type { Page } from "../../types"
import { Icons } from "../common/Icons"

export interface SidebarProps {
  current: Page
  onNav: (p: Page) => void
}

export function Sidebar({ current, onNav }: SidebarProps) {
  const nav = [
    { id: "dashboard" as Page, label: "Dashboard", icon: Icons.dashboard },
    {
      id: "opportunities" as Page,
      label: "Opportunities",
      icon: Icons.opportunities,
    },
    {
      id: "campaign-results" as Page,
      label: "Campaigns",
      icon: Icons.campaigns,
    },
    { id: "customers" as Page, label: "Customers", icon: Icons.customers },
    { id: "analytics" as Page, label: "Analytics", icon: Icons.analytics },
    { id: "ai-activity" as Page, label: "AI Activity", icon: Icons.ai },
  ]

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100 flex items-center gap-2.5">
        {Icons.logo}
        <div>
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            GrowthOS
          </span>
          <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">
            AI Merchant Growth
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {nav.map((item) => {
          const active =
            current === item.id ||
            (item.id === "opportunities" &&
              (current === "opportunity-detail" ||
                current === "opportunity-investigate")) ||
            (item.id === "campaign-results" && current === "campaign-create")
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className={active ? "text-blue-600" : "text-slate-400"}>
                {item.icon}
              </span>
              {item.label}
            </button>
          )
        })}

        <div className="mt-auto pt-4 border-t border-slate-100">
          <button
            onClick={() => onNav("settings")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              current === "settings"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span
              className={
                current === "settings" ? "text-blue-600" : "text-slate-400"
              }
            >
              {Icons.settings}
            </span>
            Settings
          </button>
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
