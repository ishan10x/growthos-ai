import type { Page } from "../types"
import { Icons } from "../components/common/Icons"
import { Badge } from "../components/common/Badge"
import { ConfidenceMeter } from "../components/common/ConfidenceMeter"
import { opportunitiesList } from "../data/mockData"

export interface OpportunitiesPageProps {
  onNav: (p: Page) => void
}

export function OpportunitiesPage({ onNav }: OpportunitiesPageProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Opportunities
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            AI-identified revenue opportunities — ₹2.84L total potential
          </p>
        </div>
        <Badge variant="info">
          <span>{Icons.sparkle}</span> 5 opportunities · ₹2.84L potential
        </Badge>
      </div>

      <div className="flex flex-col gap-3">
        {opportunitiesList.map((o) => (
          <div
            key={o.title}
            onClick={() => onNav("opportunity-investigate")}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  {Icons.sparkle}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {o.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {o.type} · {o.customers.toLocaleString()} customers
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-0.5">
                    Expected Revenue
                  </p>
                  <p className="text-base font-bold text-blue-700 mono">
                    {o.revenue}
                  </p>
                </div>
                <div className="w-24">
                  <p className="text-xs text-slate-400 mb-1.5">AI Confidence</p>
                  <ConfidenceMeter value={o.confidence} />
                </div>
                <Badge variant={o.status === "active" ? "success" : "warning"}>
                  {o.status}
                </Badge>
                <span className="text-slate-300">{Icons.chevronRight}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OpportunitiesPage
