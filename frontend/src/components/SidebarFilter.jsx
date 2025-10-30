import React from "react";

/**
 * Right-side filter panel.
 * - multi district select (max you can enforce)
 * - metric checkboxes
 */
export default function SidebarFilter({
  districts,
  selectedDistricts,
  setSelectedDistricts,
  metrics,
  selectedMetrics,
  setSelectedMetrics,
  maxSelect = 4,
}) {
  const onDistrictChange = (e) => {
    const value = Array.from(e.target.selectedOptions, (o) => o.value);
    // enforce maximum
    if (value.length > maxSelect) {
      // ignore last selection (simple UX)
      value.pop();
    }
    setSelectedDistricts(value);
  };

  const onMetricToggle = (metric) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter((m) => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow sticky top-6">
      <h3 className="text-lg font-semibold mb-3">Filters</h3>

      <div className="mb-4">
        <label className="block font-medium mb-2">Choose Districts (max {maxSelect})</label>
        <select
          multiple
          value={selectedDistricts}
          onChange={onDistrictChange}
          className="w-full border p-2 rounded h-40"
        >
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">Tip: Hold Ctrl/Cmd to multi-select</p>
      </div>

      <div>
        <label className="block font-medium mb-2">Compare Metrics</label>
        <div className="flex flex-col gap-2">
          {metrics.map((m) => (
            <label key={m} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedMetrics.includes(m)}
                onChange={() => onMetricToggle(m)}
              />
              <span className="font-medium">{m}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
