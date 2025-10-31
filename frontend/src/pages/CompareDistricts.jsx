import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const CompareDistricts = () => {
  const [districts, setDistricts] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all districts on component mount
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/districts`)
      .then((res) => res.json())
      .then((data) => setDistricts(data))
      .catch((err) => console.error("Error fetching districts:", err));
  }, []);

  const handleCompare = async () => {
    if (selectedDistricts.length === 0) {
      alert("Please select at least one district to compare");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/mgnrega/compare?districts=${selectedDistricts.join(",")}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setChartData(transformChartData(data));
      generateNotes(data);
    } catch (err) {
      console.error("Error fetching comparison data:", err);
      alert("Error fetching comparison data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const transformChartData = (data) => {
    // Transform the data for charts
    const districtMetrics = Object.keys(data).map(metricName => {
      const districtData = data[metricName];
      return {
        metricName,
        ...districtData
      };
    });
    return districtMetrics;
  };

  const generateNotes = (data) => {
    if (!data || Object.keys(data).length === 0) {
      setNotes(["No data available for selected districts."]);
      return;
    }

    const wageRateData = data['Average Wage Rate'] || {};
    const employmentData = data['Employment Days'] || {};

    const districts = Object.keys(wageRateData);
    if (districts.length === 0) {
      setNotes(["No comparable metrics available."]);
      return;
    }

    const highestWage = districts.reduce((a, b) => 
      wageRateData[a] > wageRateData[b] ? a : b
    );
    const lowestWage = districts.reduce((a, b) => 
      wageRateData[a] < wageRateData[b] ? a : b
    );
    const highestEmployment = districts.reduce((a, b) => 
      employmentData[a] > employmentData[b] ? a : b
    );

    const insights = [
      `💰 ${highestWage} leads with the highest average wage rate of ₹${wageRateData[highestWage].toFixed(2)}/day`,
      `📉 ${lowestWage} has the lowest wage rate of ₹${wageRateData[lowestWage].toFixed(2)}/day`,
      `👷 ${highestEmployment} provides the most employment days per household (${employmentData[highestEmployment]?.toFixed(1) || 0} days)`,
      `📊 Wage disparity: ${
        Math.abs(wageRateData[highestWage] - wageRateData[lowestWage]) > 40
          ? "High variation between districts"
          : "Moderate consistency across districts"
      }`
    ];
    setNotes(insights);
  };

  return (
    <div className="compare-page bg-gray-50 min-h-screen p-6 text-gray-800">
      <div className="grid grid-cols-[70%_30%] gap-6">
        {/* Left Side: Visualization Grid */}
        <div className="charts bg-white rounded-2xl shadow-md p-6 overflow-y-scroll h-[90vh]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-600">
              📊 District Comparison Dashboard
            </h2>
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
            >
              <span>←</span> Back to Home
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-lg text-gray-600">Loading comparisons...</div>
            </div>
          ) : chartData.length > 0 ? (
            <div className="grid grid-cols-2 gap-6">
              {/* Wage Rate Chart */}
              <div className="bg-blue-50 rounded-2xl p-4 shadow">
                <h3 className="font-semibold mb-2 text-blue-700">Average Wage Rate</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metricName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedDistricts.map((district, index) => (
                      <Bar 
                        key={district} 
                        dataKey={district} 
                        fill={`hsl(${index * (360 / selectedDistricts.length)}, 70%, 50%)`} 
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Employment Days Chart */}
              <div className="bg-green-50 rounded-2xl p-4 shadow">
                <h3 className="font-semibold mb-2 text-green-700">Employment Days</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metricName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedDistricts.map((district, index) => (
                      <Line 
                        key={district} 
                        type="monotone" 
                        dataKey={district} 
                        stroke={`hsl(${index * (360 / selectedDistricts.length)}, 70%, 50%)`}
                        strokeWidth={2} 
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Total Workers Chart */}
              <div className="bg-yellow-50 rounded-2xl p-4 shadow">
                <h3 className="font-semibold mb-2 text-yellow-700">Total Workers</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metricName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedDistricts.map((district, index) => (
                      <Area
                        key={district}
                        type="monotone"
                        dataKey={district}
                        fill={`hsl(${index * (360 / selectedDistricts.length)}, 70%, 50%)`}
                        fillOpacity={0.3}
                        stroke={`hsl(${index * (360 / selectedDistricts.length)}, 70%, 50%)`}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Completed Works Chart */}
              <div className="bg-purple-50 rounded-2xl p-4 shadow">
                <h3 className="font-semibold mb-2 text-purple-700">Completed Works</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metricName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedDistricts.map((district, index) => (
                      <Bar
                        key={district}
                        dataKey={district}
                        fill={`hsl(${index * (360 / selectedDistricts.length)}, 70%, 50%)`}
                        fillOpacity={0.8}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Overall Performance Radar */}
              <div className="bg-pink-50 rounded-2xl p-4 shadow col-span-2">
                <h3 className="font-semibold mb-2 text-pink-700">Overall District Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metricName" />
                    <PolarRadiusAxis />
                    {selectedDistricts.map((district, index) => (
                      <Radar
                        key={district}
                        name={district}
                        dataKey={district}
                        stroke={`hsl(${index * (360 / selectedDistricts.length)}, 70%, 50%)`}
                        fill={`hsl(${index * (360 / selectedDistricts.length)}, 70%, 50%)`}
                        fillOpacity={0.5}
                      />
                    ))}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 italic text-center mt-10">
              Select districts and click Compare to view analytics
            </div>
          )}
        </div>

        {/* Right Side: Filters + Observations */}
        <div className="bg-white p-5 rounded-2xl shadow-md h-[90vh] sticky top-4 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-blue-600 mb-4">Select Districts to Compare</h2>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Available Districts:</label>
              <select
                multiple
                className="w-full h-48 border rounded-lg p-2"
                value={selectedDistricts}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                  setSelectedDistricts(selected);
                }}
              >
                {districts.map((d) => (
                  <option key={d.district_name} value={d.district_name}>
                    {d.district_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCompare}
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-medium transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Comparing...' : 'Compare Districts'}
            </button>
          </div>

          {/* Smart Observations */}
          <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">
              🧠 Insights & Observations
            </h3>
            {notes.length > 0 ? (
              <ul className="space-y-2">
                {notes.map((note, index) => (
                  <li 
                    key={index}
                    className="text-sm text-gray-700 leading-relaxed"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">
                Run a comparison to view insights
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareDistricts;