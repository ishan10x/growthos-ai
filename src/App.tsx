import { useState } from "react"
import type { Page } from "./types"
import Sidebar from "./components/layout/Sidebar"
import TopBar from "./components/layout/TopBar"
import DashboardPage from "./pages/DashboardPage"
import OpportunitiesPage from "./pages/OpportunitiesPage"
import {
  OpportunityInvestigationPage,
  OpportunityDetailPage,
} from "./pages/OpportunityInvestigationPage"
import CampaignCreatePage from "./pages/CampaignCreatePage"
import CampaignResultsPage from "./pages/CampaignResultsPage"
import CustomersPage from "./pages/CustomersPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import AIActivityPage from "./pages/AIActivityPage"
import SettingsPage from "./pages/SettingsPage"

export default function App() {
  const [page, setPage] = useState<Page>("dashboard")

  const navigate = (p: Page) => setPage(p)

  return (
    <div className="flex h-full bg-slate-50 font-sans">
      <Sidebar current={page} onNav={navigate} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onNav={navigate} />
        {page === "dashboard" && <DashboardPage onNav={navigate} />}
        {page === "opportunities" && <OpportunitiesPage onNav={navigate} />}
        {page === "opportunity-detail" && (
          <OpportunityDetailPage onNav={navigate} />
        )}
        {page === "opportunity-investigate" && (
          <OpportunityInvestigationPage onNav={navigate} />
        )}
        {page === "campaign-create" && <CampaignCreatePage onNav={navigate} />}
        {page === "campaign-results" && (
          <CampaignResultsPage onNav={navigate} />
        )}
        {page === "customers" && <CustomersPage />}
        {page === "analytics" && <AnalyticsPage />}
        {page === "ai-activity" && <AIActivityPage />}
        {page === "settings" && <SettingsPage />}
      </div>
    </div>
  )
}
