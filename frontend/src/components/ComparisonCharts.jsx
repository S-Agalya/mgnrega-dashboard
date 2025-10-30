import React from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function ComparisonCharts({ selectedDistricts, metricsData, selectedMetrics }) {
  // Bar chart data
  const barData = {
    labels: selectedDistricts,
    datasets: selectedMetrics.map((metric, idx) => ({
      label: metric,
      data: selectedDistricts.map((d) => metricsData[d][metric]),
      backgroundColor: ["#34D399", "#3B82F6", "#FBBF24"][idx % 3],
    })),
  };

  // Pie chart for first metric
  const pieData = selectedMetrics.length > 0 ? {
    labels: selectedDistricts,
    datasets: [{
      data: selectedDistricts.map((d) => metricsData[d][selectedMetrics[0]]),
      backgroundColor: ["#34D399", "#3B82F6", "#FBBF24", "#F87171", "#A78BFA"]
    }]
  } : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Bar Chart Comparison</h3>
        <Bar data={barData} />
      </div>

      {pieData && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Pie Chart ({selectedMetrics[0]})</h3>
          <Pie data={pieData} />
        </div>
      )}
    </div>
  );
}
