import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function Home() {
  const [district, setDistrict] = useState("");
  const navigate = useNavigate();

  const districts = ["Chennai", "Madurai", "Coimbatore", "Thanjavur", "Salem"];
  const metrics = [
    { title: "People Employed", value: 1250, icon: "👷" },
    { title: "Jobs Created", value: 320, icon: "🛠️" },
    { title: "Wages Paid (₹)", value: 50000, icon: "💰" },
  ];

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
              <option key={d} value={d}>
                {d}
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
                key={metric.title}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl">{metric.icon}</div>
                <h3 className="text-gray-700 font-semibold mt-2">
                  {metric.title}
                </h3>
                <p className="text-3xl font-bold text-indigo-700">
                  {metric.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Diagrammatic Graphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Graph 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4">
                📈 Employment Growth Rate
              </h3>
              <div className="h-48 flex items-center justify-center text-gray-500">
                [Line Graph Placeholder]
              </div>
            </div>

            {/* Graph 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4">📊 Jobs vs Wages</h3>
              <div className="h-48 flex items-center justify-center text-gray-500">
                [Bar Chart Placeholder]
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4">
                🥧 Job Distribution by Category
              </h3>
              <div className="h-48 flex items-center justify-center text-gray-500">
                [Pie Chart Placeholder]
              </div>
            </div>

            {/* Additional Graphs */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4">
                📍 Work Completion Timeline
              </h3>
              <div className="h-48 flex items-center justify-center text-gray-500">
                [Timeline Graph Placeholder]
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold text-gray-800 mb-4">
                🌾 Rural Development Index
              </h3>
              <div className="h-48 flex items-center justify-center text-gray-500">
                [Gauge or Circle Chart Placeholder]
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
              <li>Rural employment rose by 15% in 2025.</li>
              <li>Digital wage transfers improved efficiency.</li>
              <li>Steady increase in women's participation.</li>
            </ul>
          </div>

          {/* Negative */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              ⚠️ Issues Identified
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Delayed payments in remote panchayats.</li>
              <li>Material shortage affecting speed.</li>
              <li>Awareness gap in low-literacy zones.</li>
            </ul>
          </div>

          {/* Observations */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">
              🔍 Analytical Insights
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>High job demand linked with rural migration.</li>
              <li>Wage rate trends align with national average.</li>
              <li>Transparency improved in fund flow tracking.</li>
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
