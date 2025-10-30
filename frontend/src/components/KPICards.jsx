import React from "react";

/**
 * Shows KPI cards across top. Each card is a metric + small per-district listing.
 */
export default function KPICards({ kpis = [], metrics = [] }) {
  // kpis: [{ district, values: { metric: number } }]
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {metrics.map((metric) => (
        <div key={metric} className="bg-white rounded shadow p-4">
          <h3 className="text-sm text-gray-500">{metric}</h3>
          <div className="mt-3">
            {kpis.map((k) => (
              <div key={k.district} className="flex items-center justify-between border-b py-2">
                <div className="font-medium">{k.district}</div>
                <div className="text-lg font-bold">{k.values[metric] ?? "—"}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
