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
  const [data, setData] = useState(null);

  const dummyData = {
    district: "Chennai",
    employed: 1200,
    jobsCreated: 300,
    wagesPaid: 45000,
    monthlyData: [
      { month: "Jan", employed: 100, jobs: 25, wages: 5000 },
      { month: "Feb", employed: 120, jobs: 30, wages: 5500 },
      { month: "Mar", employed: 110, jobs: 28, wages: 5200 },
      { month: "Apr", employed: 130, jobs: 35, wages: 5800 },
    ],
    positiveOutcomes: [
      "Increased employment opportunities",
      "Timely and transparent wage payments",
      "Improved participation from rural women",
    ],
    issuesFaced: [
      "Delayed fund release in certain panchayats",
      "Shortage of raw materials during peak demand",
      "Low literacy affecting work awareness programs",
    ],
    lowLiteracyEmployment: 150,
    employmentGrowthRate: 8.5,
  };

  useEffect(() => {
    if (name) setData(dummyData);
  }, [name]);

  if (!name)
    return (
      <div className="p-4 text-center text-red-600">
        No district selected.
      </div>
    );
  if (!data)
    return <div className="p-4 text-center">Loading district data...</div>;

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
            District: <span className="text-indigo-700">{data.district}</span>
          </h1>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <DistrictCard title="People Employed" value={data.employed} icon="👷" />
            <DistrictCard title="Jobs Created" value={data.jobsCreated} icon="🛠️" />
            <DistrictCard title="Wages Paid" value={`₹${data.wagesPaid}`} icon="💰" />
          </div>

          {/* Overall Performance Bar Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              📊 Overall Performance
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { metric: "Employed", value: data.employed },
                  { metric: "Jobs", value: data.jobsCreated },
                  { metric: "Wages", value: data.wagesPaid },
                ]}
              >
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Row: Pie + Additional Observations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-semibold mb-3 text-gray-700">
                🥧 Jobs Distribution
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Completed", value: 200 },
                      { name: "Pending", value: 100 },
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
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Observation 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center">
              <h2 className="text-xl font-semibold mb-2 text-gray-700">
                📈 Employment Growth Rate
              </h2>
              <p className="text-3xl font-bold text-green-600">
                {data.employmentGrowthRate}%
              </p>
            </div>

            {/* Observation 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center">
              <h2 className="text-xl font-semibold mb-2 text-gray-700">
                📘 Low Literacy Employment
              </h2>
              <p className="text-3xl font-bold text-blue-600">
                {data.lowLiteracyEmployment}
              </p>
              <LowLiteracyWidget label="Low Literacy Employment" icon="📗" />
            </div>
          </div>

          {/* Trend Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-semibold mb-3 text-gray-700">
                📆 Jobs Trend (Monthly)
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="jobs" stroke="#facc15" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-semibold mb-3 text-gray-700">
                💵 Wages Trend (Monthly)
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="wages" stroke="#6366f1" strokeWidth={2} />
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
            📋 {data.district} Insights
          </h2>

          {/* Positive Observations */}
          <div className="bg-green-800/40 p-4 rounded-xl">
            <h3 className="font-semibold text-green-300 mb-2">
              ✅ Positive Observations
            </h3>
            <ul className="list-disc list-inside text-gray-200">
              {data.positiveOutcomes.map((note, i) => (
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
              {data.issuesFaced.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </div>

          {/* Observations Summary */}
          <div className="bg-blue-800/40 p-4 rounded-xl">
            <h3 className="font-semibold text-blue-300 mb-2">
              🔍 Analytical Insights
            </h3>
            <ul className="list-disc list-inside text-gray-200">
              <li>Growth Rate: {data.employmentGrowthRate}%</li>
              <li>Low Literacy Employment: {data.lowLiteracyEmployment}</li>
              <li>Steady increase in job creation across months</li>
              <li>Consistent wage trend matching employment growth</li>
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
