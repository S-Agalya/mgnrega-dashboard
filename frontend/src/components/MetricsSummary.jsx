import React from "react";

export default function MetricsSummary({ selectedDistricts, metricsData, selectedMetrics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {selectedDistricts.map((district) =>
        selectedMetrics.map((metric) => (
          <div key={`${district}-${metric}`} className="bg-green-100 p-4 rounded shadow text-center">
            <h3 className="font-bold">{district}</h3>
            <p className="text-xl mt-2">{metric}: {metricsData[district][metric]}</p>
          </div>
        ))
      )}
    </div>
  );
}
