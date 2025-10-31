import React from "react";
import { Bar, Pie, Line, Doughnut, Radar } from "react-chartjs-2";
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
  RadialLinearScale,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

const COLORS = ["#4ADE80", "#60A5FA", "#FBBF24", "#F87171", "#A78BFA"];

export default function Charts({ dataSource = {}, selectedDistricts = [], selectedMetrics = [] }) {
  if (!selectedDistricts?.length) {
    return <div className="text-gray-500">Select districts to see charts.</div>;
  }

  // Ensure districts exist in dataSource
  const validDistricts = selectedDistricts.filter((d) => dataSource[d]);
  if (!validDistricts.length) return <div className="text-gray-500">No data for the selected districts.</div>;

  // Labels for charts (metrics friendly names)
  const metricLabels = selectedMetrics.map((m) => m.replace(/_/g, " "));

  // BAR data: grouped metrics per district
  const barData = {
    labels: metricLabels,
    datasets: validDistricts.map((d, idx) => ({
      label: d,
      data: selectedMetrics.map((m) => Number(dataSource[d]?.[m] ?? 0)),
      backgroundColor: COLORS[idx % COLORS.length],
    })),
  };

  // PIE: distribution for the first metric
  const pieMetric = selectedMetrics[0];
  const pieData = {
    labels: validDistricts,
    datasets: [{
      data: validDistricts.map((d) => Number(dataSource[d]?.[pieMetric] ?? 0)),
      backgroundColor: validDistricts.map((_, i) => COLORS[i % COLORS.length]),
    }],
  };

  // DOUGHNUT: distribution for second metric if present
  const doughnutMetric = selectedMetrics[1] ?? pieMetric;
  const doughnutData = {
    labels: validDistricts,
    datasets: [{
      data: validDistricts.map((d) => Number(dataSource[d]?.[doughnutMetric] ?? 0)),
      backgroundColor: validDistricts.map((_, i) => COLORS[(i+1) % COLORS.length]),
    }],
  };

  // LINE: monthly trend - find months union
  const monthsSet = new Set();
  validDistricts.forEach((d) => {
    (dataSource[d]?.monthly ?? []).forEach((m) => monthsSet.add(m.month));
  });
  const months = Array.from(monthsSet).sort();

  const lineData = {
    labels: months,
    datasets: validDistricts.map((d, idx) => ({
      label: d,
      data: months.map((mo) => {
        const monthObj = (dataSource[d]?.monthly ?? []).find((m) => m.month === mo);
        return Number(monthObj?.total_persondays ?? monthObj?.total_wages ?? 0);
      }),
      borderColor: COLORS[idx % COLORS.length],
      backgroundColor: COLORS[idx % COLORS.length] + "33",
      tension: 0.3,
    })),
  };

  // RADAR: normalized metrics across districts
  const radarData = {
    labels: metricLabels,
    datasets: validDistricts.map((d, idx) => ({
      label: d,
      data: selectedMetrics.map((m) => Number(dataSource[d]?.[m] ?? 0)),
      backgroundColor: COLORS[idx % COLORS.length] + "33",
      borderColor: COLORS[idx % COLORS.length],
      pointBackgroundColor: COLORS[idx % COLORS.length]
    })),
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold mb-2">Grouped Bar — metrics comparison</h4>
        <Bar data={barData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Pie — {pieMetric.replace(/_/g," ")}</h4>
          <Pie data={pieData} />
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Doughnut — {doughnutMetric.replace(/_/g," ")}</h4>
          <Doughnut data={doughnutData} />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold mb-2">Line — Monthly trend (persondays/wages)</h4>
        <Line data={lineData} />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold mb-2">Radar — normalized metrics</h4>
        <Radar data={radarData} />
      </div>
    </div>
  );
}
