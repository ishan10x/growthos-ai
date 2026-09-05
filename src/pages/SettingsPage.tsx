import { settingsSections } from "../data/mockData"

export function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure GrowthOS preferences and integrations
        </p>
      </div>
      <div className="max-w-2xl flex flex-col gap-5">
        {settingsSections.map((section) => (
          <div
            key={section.title}
            className="bg-white border border-slate-200 rounded-xl p-5"
          >
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              {section.title}
            </h2>
            <div className="flex flex-col gap-0">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                >
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-sm font-medium text-slate-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SettingsPage
