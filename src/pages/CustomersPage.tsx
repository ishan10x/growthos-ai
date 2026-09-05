import { useState, useMemo } from "react"
import { Icons } from "../components/common/Icons"
import { Badge } from "../components/common/Badge"
import { StatCard } from "../components/common/StatCard"
import { customersList } from "../data/mockData"

export function CustomersPage() {
  const [selectedSegment, setSelectedSegment] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return customersList.filter((c) => {
      const matchesSegment =
        selectedSegment === "All" ||
        c.segment.toLowerCase() === selectedSegment.toLowerCase()
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      return matchesSegment && matchesSearch
    })
  }, [selectedSegment, searchQuery])

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage and analyze your customer base · 12,840 total customers
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 text-sm text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition-colors">
            {Icons.filter} Filter
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 text-sm text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition-colors">
            {Icons.export} Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard
          label="Total Customers"
          value="12,840"
          change="+8.2%"
          changeLabel="this month"
          positive
        />
        <StatCard
          label="Avg. LTV"
          value="₹18,400"
          change="+₹2,100"
          changeLabel="vs. last month"
          positive
        />
        <StatCard
          label="Repeat Rate"
          value="62.4%"
          change="+4.1%"
          changeLabel="vs. last month"
          positive
        />
        <StatCard
          label="At-Risk Customers"
          value="284"
          change="-12%"
          changeLabel="vs. last month"
          positive
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers..."
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            {["All", "Premium", "Running", "Casual", "Training", "Trail"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setSelectedSegment(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    selectedSegment === f
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {f}
                </button>
              ),
            )}
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {[
                "Customer",
                "City",
                "Orders",
                "Lifetime Value",
                "Segment",
                "Last Order",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-sm text-slate-400"
                >
                  No customers found
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr
                  key={c.email}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">
                          {c.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {c.name}
                        </p>
                        <p className="text-xs text-slate-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{c.city}</td>
                  <td className="px-5 py-4 text-sm text-slate-700 mono">
                    {c.orders}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900 mono">
                    {c.ltv}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant={
                        c.segment === "Premium"
                          ? "info"
                          : c.segment === "Trail"
                            ? "warning"
                            : "muted"
                      }
                    >
                      {c.segment}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {c.lastOrder}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Showing {filteredCustomers.length} of 12,840 customers
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, "...", 128].map((p) => (
              <button
                key={p}
                className={`w-8 h-8 text-xs rounded-lg ${
                  p === 1
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomersPage
