import React from "react";

/**
 * Very simple language insights for low-literacy users.
 */
export default function Insights({ dataSource, selectedDistricts = [], selectedMetrics = [] }) {
  if (!selectedDistricts.length || !selectedMetrics.length) return null;

  return (
    <div className="bg-white p-4 rounded shadow mt-6">
      <h3 className="text-lg font-semibold mb-2">Key Insights</h3>
      <div className="space-y-2">
        {selectedMetrics.map((metric) => {
          const best = selectedDistricts.reduce((a, b) =>
            (dataSource[a][metric] ?? 0) > (dataSource[b][metric] ?? 0) ? a : b
          );
          return (
            <div key={metric} className="flex items-center gap-3">
              <div className="text-xl">✅</div>
              <div>
                <div className="font-medium">{best}</div>
                <div className="text-sm text-gray-600">{best} performs best in {metric}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
