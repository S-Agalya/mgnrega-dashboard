import React from "react";

export default function DistrictSelector({ districts, selectedDistricts, setSelectedDistricts, metrics, selectedMetrics, setSelectedMetrics }) {
  const handleDistrictChange = (e) => {
    const value = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedDistricts(value);
  };

  const handleMetricChange = (e) => {
    const { value, checked } = e.target;
    if (checked) setSelectedMetrics([...selectedMetrics, value]);
    else setSelectedMetrics(selectedMetrics.filter((m) => m !== value));
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-lg font-bold mb-2">Select Districts</h2>
      <select multiple className="w-full p-2 border rounded" onChange={handleDistrictChange}>
        {districts.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <h2 className="text-lg font-bold mt-4 mb-2">Select Metrics</h2>
      <div className="flex gap-4">
        {metrics.map((metric) => (
          <label key={metric} className="flex items-center gap-1">
            <input type="checkbox" value={metric} checked={selectedMetrics.includes(metric)} onChange={handleMetricChange} />
            {metric}
          </label>
        ))}
      </div>
    </div>
  );
}
