import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DistrictCard from "../components/DistrictCard";
import LowLiteracyWidget from "../components/LowLiteracyWidget";

export default function DistrictView() {
  const { name } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [districtData, setDistrictData] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [insights, setInsights] = useState({
    positiveOutcomes: [],
    issuesFaced: [],
    analyticalInsights: []
  });

  useEffect(() => {
    const fetchDistrictData = async () => {
      if (!name) return;
      setLoading(true);
      setError(null);

      try {
        // Fetch main district data
        const dataResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/district/${name}`
        );
        if (!dataResponse.ok) throw new Error('Failed to fetch district data');
        const data = await dataResponse.json();
        setDistrictData(data);

        // Fetch district stats
        const statsResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/district/${name}/stats`
        );
        if (!statsResponse.ok) throw new Error('Failed to fetch district stats');
        const stats = await statsResponse.json();
        setMonthlyStats(stats);

        // Fetch insights
        const insightsResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/district/${name}/insights`
        );
        if (!insightsResponse.ok) throw new Error('Failed to fetch insights');
        const insightsData = await insightsResponse.json();
        setInsights(insightsData);

      } catch (err) {
        setError(err.message);
        console.error('Error fetching district data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDistrictData();
  }, [name]);

  if (!name) {
    return (
      <div className="p-4 text-center text-red-600">
        No district selected.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">Loading district data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!districtData) {
    return (
      <div className="p-4 text-center text-red-600">
        No data available for this district.
      </div>
    );
  }

  const COLORS = ["#2563eb", "#10b981", "#facc15", "#f97316"];
  const HEADER_HEIGHT = 64;

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* 🔹 Fixed Header */}
      <div className="fixed top-0 left-0 w-full z-50 shadow-md">
        <Header />
      </div>

      {/* 🔹 Main two-part layout */}
      <div className="flex flex-1 gap-6 p-6 mt-[64px] bg-gray-100">
        {/* 🔸 Left Panel - Scrollable Graph Section */}
        <div
          className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2"
          style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
        >
          {/* District Title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            District: <span className="text-indigo-700">{districtData.district_name}</span>
          </h1>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {districtData.metrics.map((metric, index) => (
              <DistrictCard
                key={metric.metric_name}
                title={metric.metric_name}
                value={metric.metric_value}
                icon={metric.metric_icon}
              />
            ))}
          </div>

          {/* Overall Performance Bar Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              📊 Overall Performance
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={districtData.metrics}>
                <XAxis dataKey="metric_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="metric_value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Row: Pie + Additional Observations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-semibold mb-3 text-gray-700">
                🥧 Work Status Distribution
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { 
                        name: "Completed Works", 
                        value: monthlyStats.completedWorks 
                      },
                      { 
                        name: "Ongoing Works", 
                        value: monthlyStats.ongoingWorks 
                      }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={index} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Employment Growth Rate */}
            <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center">
              <h2 className="text-xl font-semibold mb-2 text-gray-700">
                📈 Employment Growth Rate
              </h2>
              <p className="text-3xl font-bold text-green-600">
                {monthlyStats.employmentGrowthRate}%
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Year over Year
              </p>
            </div>

            {/* Development Index */}
            <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center">
              <h2 className="text-xl font-semibold mb-2 text-gray-700">
                📊 Development Index
              </h2>
              <p className="text-3xl font-bold text-blue-600">
                {monthlyStats.developmentIndex?.toFixed(2) || 'N/A'}
              </p>
              <LowLiteracyWidget value={monthlyStats.developmentIndex} icon="📈" />
            </div>
          </div>

          {/* Trend Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-semibold mb-3 text-gray-700">
                📆 Employment Trend
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyStats.employmentGrowth}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="employed" 
                    stroke="#facc15" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-semibold mb-3 text-gray-700">
                💵 Jobs vs Wages Trend
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyStats.jobsWages}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    name="Jobs Created"
                    dataKey="jobs_created" 
                    stroke="#2563eb" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    name="Wages Paid"
                    dataKey="wages_paid" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 🔸 Right Panel - Fixed Notes */}
        <aside
          className="w-96 bg-slate-900 text-gray-100 p-6 rounded-2xl shadow-2xl flex flex-col gap-5 sticky top-[64px] overflow-y-auto"
          style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
        >
          <h2 className="text-2xl font-bold text-yellow-400">
            📋 {districtData.district_name} Insights
          </h2>

          {/* Positive Observations */}
          <div className="bg-green-800/40 p-4 rounded-xl">
            <h3 className="font-semibold text-green-300 mb-2">
              ✅ Positive Outcomes
            </h3>
            <ul className="list-disc list-inside text-gray-200">
              {insights.positiveOutcomes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>

          {/* Issues */}
          <div className="bg-red-800/40 p-4 rounded-xl">
            <h3 className="font-semibold text-red-300 mb-2">
              ⚠️ Key Issues
            </h3>
            <ul className="list-disc list-inside text-gray-200">
              {insights.issuesFaced.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </div>

          {/* Analytical Insights */}
          <div className="bg-blue-800/40 p-4 rounded-xl">
            <h3 className="font-semibold text-blue-300 mb-2">
              🔍 Analytical Insights
            </h3>
            <ul className="list-disc list-inside text-gray-200">
              {insights.analytical.map((insight, i) => (
                <li key={i}>{insight}</li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-gray-400 border-t border-gray-700 pt-3">
            Source:{" "}
            <a
              href="https://nrega.nic.in"
              className="underline text-blue-300"
              target="_blank"
              rel="noreferrer"
            >
              MGNREGA Official Portal
            </a>
          </p>
        </aside>
      </div>

      <Footer />
    </div>
  );
}