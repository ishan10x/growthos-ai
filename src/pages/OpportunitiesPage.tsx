import type { Page } from "../types"
import type { CrossSellOpportunity } from "../types/dataFoundation"
import { Icons } from "../components/common/Icons"
import { Badge } from "../components/common/Badge"
import { ConfidenceMeter } from "../components/common/ConfidenceMeter"
import { getCalculatedOpportunities } from "../services/opportunityService"

export interface OpportunitiesPageProps {
  onNav: (p: Page) => void
  onSelectOpportunity?: (opp: CrossSellOpportunity) => void
}

export function OpportunitiesPage({
  onNav,
  onSelectOpportunity,
}: OpportunitiesPageProps) {
  const opportunities = getCalculatedOpportunities()
  const totalPotential = opportunities.reduce(
    (sum, o) => sum + o.estimatedIncrementalRevenue,
    0,
  )

  const handleClick = (opp: CrossSellOpportunity) => {
    onSelectOpportunity?.(opp)
    onNav("opportunity-investigate")
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Opportunities
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            AI-identified revenue opportunities — ₹
            {(totalPotential / 100000).toFixed(2)}L total potential
          </p>
        </div>
        <Badge variant="info">
          <span>{Icons.sparkle}</span> {opportunities.length} opportunities · ₹
          {(totalPotential / 100000).toFixed(2)}L potential
        </Badge>
      </div>

      <div className="flex flex-col gap-3">
        {opportunities.map((o) => (
          <div
            key={`${o.sourceProduct.id}:${o.recommendedProduct.id}`}
            onClick={() => handleClick(o)}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  {Icons.sparkle}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {o.sourceProduct.name} → {o.recommendedProduct.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cross-sell · {o.estimatedEligibleCustomers.toLocaleString()}{" "}
                    customers
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-0.5">
                    Expected Revenue
                  </p>
                  <p className="text-base font-bold text-blue-700 mono">
                    ₹{o.estimatedIncrementalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="w-24">
                  <p className="text-xs text-slate-400 mb-1.5">AI Confidence</p>
                  <ConfidenceMeter value={o.confidenceScore} />
                </div>
                <Badge variant="success">active</Badge>
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
