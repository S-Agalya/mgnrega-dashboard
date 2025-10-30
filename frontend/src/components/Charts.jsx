import React from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const COLORS = ["#4ADE80", "#60A5FA", "#FBBF24", "#F87171", "#A78BFA"];

export default function Charts({ dataSource, selectedDistricts = [], selectedMetrics = [] }) {
  if (!selectedDistricts.length || !selectedMetrics.length) return null;

  // BAR: for each metric, one grouped bar (metrics on x axis) with datasets = districts
  const barData = {
    labels: selectedMetrics,
    datasets: selectedDistricts.map((d, idx) => ({
      label: d,
      data: selectedMetrics.map((m) => dataSource[d][m] ?? 0),
      backgroundColor: COLORS[idx % COLORS.length],
    })),
  };

  // PIE: show distribution of one chosen metric (first selected metric) among districts
  const pieMetric = selectedMetrics[0];
  const pieData = {
    labels: selectedDistricts,
    datasets: [
      {
        data: selectedDistricts.map((d) => dataSource[d][pieMetric] ?? 0),
        backgroundColor: selectedDistricts.map((_, i) => COLORS[i % COLORS.length]),
      },
    ],
  };

  // LINE/Trend: use monthly data, months from dataSource[first district]
  const months = dataSource[selectedDistricts[0]]?.monthly?.map((m) => m.month) ?? [];
  const lineData = {
    labels: months,
    datasets: selectedDistricts.map((d, idx) => ({
      label: d,
      data: (dataSource[d].monthly ?? []).map((m) => selectedMetrics.reduce((acc, met) => acc + (m[met] ?? 0), 0)), // sum selected metrics for trend line
      borderColor: COLORS[idx % COLORS.length],
      backgroundColor: COLORS[idx % COLORS.length] + "55",
      tension: 0.3,
    })),
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Overall (Grouped Bar) — selected metrics</h3>
        <Bar data={barData} options={{ responsive: true }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Distribution — {pieMetric}</h3>
          <Pie data={pieData} />
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Trend (monthly sum of selected metrics)</h3>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
}
