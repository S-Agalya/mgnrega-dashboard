import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, RadialBarChart, RadialBar,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";
import Footer from "../components/Footer";

// Colors for charts
const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

// Calculate development index from metrics
const calculateDevelopmentIndex = (metrics) => {
  if (!metrics?.length) return 0;
  const totalEmployed = metrics.find(m => m.metric_name === 'People Employed')?.metric_value || 0;
  const totalJobs = metrics.find(m => m.metric_name === 'Jobs Created')?.metric_value || 0;
  const totalWages = metrics.find(m => m.metric_name === 'Wages Paid')?.metric_value || 0;
  
  // Normalize to 0-100 scale
  return ((totalEmployed * 0.4 + totalJobs * 0.3 + totalWages * 0.3) / 1000).toFixed(2);
};

export default function Home() {
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [district, setDistrict] = useState("");
  const [districts, setDistricts] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [insights, setInsights] = useState({
    positive: [],
    issues: [],
    analytical: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch districts
        const districtsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/districts`);
        const districtsData = await districtsRes.json();
        setDistricts(districtsData);

        // Fetch aggregated metrics for all districts
        const metricsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/metrics/aggregated`);
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);

        // Fetch monthly statistics for timeline
        const monthlyStatsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/district/Chennai/stats`);
        const monthlyStatsData = await monthlyStatsRes.json();
        setMonthlyStats(monthlyStatsData.jobsWages || []);

        // Fetch aggregated insights
        const insightsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/insights/aggregated`);
        const insightsData = await insightsRes.json();
        setInsights(insightsData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (district) {
      navigate(`/district/${encodeURIComponent(district)}`);
    }
  }, [district, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* 🔹 Fixed Gradient Header with Navigation */}
      <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-indigo-800 via-blue-700 to-indigo-900 text-white py-5 px-8 shadow-lg z-50 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">
          MGNREGA District Dashboard
        </h1>

        <div className="flex items-center space-x-6">
          <Link
            to="/"
            className="text-white hover:text-yellow-300 font-medium transition"
          >
            Dashboard
          </Link>
          <Link
            to="/compare"
            className="text-white hover:text-yellow-300 font-medium transition"
          >
            Compare Districts
          </Link>

          <select
            className="p-2 rounded-lg text-black font-semibold shadow-md w-56"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option value="">Select your district</option>
            {districts.map((d) => (
              <option key={d.district_name} value={d.district_name}>
                {d.district_name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* 🔹 Main Split Layout */}
      <main className="flex flex-1 mt-24">
        {/* Left: Graphs and Metrics */}
        <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {metrics.map((metric) => (
              <div
                key={metric.metric_name}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl">{metric.metric_icon}</div>
                <h3 className="text-gray-700 font-semibold mt-2">
                  {metric.metric_name}
                </h3>
                <p className="text-3xl font-bold text-indigo-700">
                  {metric.metric_value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Diagrammatic Graphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Employment Growth Rate */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4">
                📈 Employment Growth Rate
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={districts.map(d => ({
                      name: d.district_name,
                      employed: d.metrics?.find(m => m.metric_name === 'People Employed')?.metric_value || 0
                    }))}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="employed" stroke="#4F46E5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Jobs vs Wages */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4">📊 Jobs vs Wages</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={districts.map(d => ({
                      name: d.district_name,
                      jobs: d.metrics?.find(m => m.metric_name === 'Jobs Created')?.metric_value || 0,
                      wages: d.metrics?.find(m => m.metric_name === 'Wages Paid')?.metric_value || 0
                    }))}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="jobs" fill="#4F46E5" />
                    <Bar dataKey="wages" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Job Distribution by Category */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4">
                🥧 Job Distribution by Category
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={districts.map(d => ({
                        name: d.district_name,
                        value: d.metrics?.find(m => m.metric_name === 'Jobs Created')?.metric_value || 0
                      }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                    >
                      {districts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Work Completion Timeline */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4">
                📍 Work Completion Timeline
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyStats.map(stat => ({
                      month: stat.month,
                      completed: stat.jobs_created
                    }))}
                  >
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="completed" stroke="#059669" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rural Development Index */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4">
                🌾 Rural Development Index
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    innerRadius="60%" 
                    outerRadius="100%" 
                    data={[{
                      name: 'Development Index',
                      value: calculateDevelopmentIndex(metrics),
                      fill: '#4F46E5'
                    }]} 
                    startAngle={180} 
                    endAngle={0}
                  >
                    <RadialBar
                      minAngle={15}
                      background
                      clockWise={true}
                      dataKey="value"
                    />
                    <Legend />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Notes Panel */}
        <aside className="w-96 bg-gray-900 text-gray-100 p-6 shadow-2xl sticky top-0 h-screen overflow-y-auto">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">
            📋 District Insights
          </h2>

          {/* Positive */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              ✅ Positive Observations
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              {insights.positive.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Negative */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              ⚠️ Issues Identified
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              {insights.issues.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Observations */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">
              🔍 Analytical Insights
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              {insights.analytical.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="text-sm text-gray-400 mt-6 border-t border-gray-700 pt-4">
            Source:{" "}
            <a
              href="https://nrega.nic.in"
              className="underline text-blue-300 hover:text-blue-400"
            >
              MGNREGA Portal
            </a>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}