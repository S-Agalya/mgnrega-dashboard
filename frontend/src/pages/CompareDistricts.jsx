// import React, { useState, useEffect } from "react";
// import {
//   BarChart, Bar, LineChart, Line, AreaChart, Area,
//   RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
//   ComposedChart, PieChart, Pie,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from "recharts";

// const CompareDistricts = () => {
//   const [states, setStates] = useState([]);
//   const [districts, setDistricts] = useState([]);
//   const [mainState, setMainState] = useState("");
//   const [mainDistrict, setMainDistrict] = useState("");
//   const [compareDistricts, setCompareDistricts] = useState([]);
//   const [chartData, setChartData] = useState([]);
//   const [notes, setNotes] = useState([]);

//   useEffect(() => {
//     fetch(`${import.meta.env.VITE_API_BASE_URL}/mgnrega/states`)
//       .then((res) => res.json())
//       .then((data) => setStates(data))
//       .catch((err) => console.error("Error fetching states:", err));
//   }, []);

//   useEffect(() => {
//     if (mainState) {
//       fetch(`${import.meta.env.VITE_API_BASE_URL}/mgnrega/districts?state=${mainState}`)
//         .then((res) => res.json())
//         .then((data) => setDistricts(data))
//         .catch((err) => console.error("Error fetching districts:", err));
//     }
//   }, [mainState]);

//   const handleCompare = async () => {
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_API_BASE_URL}/mgnrega/compare?districts=${compareDistricts.join(",")}`
//       );
//       if (!response.ok) throw new Error(`HTTP ${response.status}`);
//       const data = await response.json();
//       setChartData(data);
//       generateNotes(data);
//     } catch (err) {
//       console.error("Error fetching comparison data:", err);
//     }
//   };

//   const generateNotes = (data) => {
//     if (!data || data.length === 0) {
//       setNotes(["No data available for selected districts."]);
//       return;
//     }
//     const highestWage = [...data].sort(
//       (a, b) => b.Average_Wage_rate_per_day_per_person - a.Average_Wage_rate_per_day_per_person
//     )[0];
//     const highestEmployment = [...data].sort(
//       (a, b) => b.Average_days_of_employment_provided_per_Household - a.Average_days_of_employment_provided_per_Household
//     )[0];

//     setNotes([
//       `${highestWage.district_name} has the highest average wage rate.`,
//       `${highestEmployment.district_name} provides the most employment days per household.`,
//     ]);
//   };

//   const useMyLocation = async () => {
//     try {
//       const response = await fetch("https://ipapi.co/json/");
//       const loc = await response.json();
//       setMainState(loc.region);
//       setMainDistrict(loc.city);
//     } catch (error) {
//       console.error("Error fetching location:", error);
//     }
//   };

//   return (
//     <div className="compare-page bg-gray-50 min-h-screen p-6 text-gray-800 relative">
//       <div className="grid grid-cols-[70%_30%] gap-4">
//         {/* Left: Charts Section */}
//         <div className="charts-section space-y-6 bg-white p-4 rounded-2xl shadow-md overflow-y-scroll h-[90vh]">
//           <h2 className="text-2xl font-bold mb-4 text-blue-600">
//             District Comparison Dashboard
//           </h2>

//           {chartData.length > 0 ? (
//   <>
//     {/* Grouped Bar Chart */}
//     <div className="chart-card bg-blue-50 rounded-xl p-4 shadow">
//       <h3 className="font-semibold mb-2">Persondays Generated</h3>
//       <ResponsiveContainer width="100%" height={250}>
//         <BarChart data={chartData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="district_name" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="Persondays_of_Central_Liability_so_far" fill="#3B82F6" barSize={40} />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>

//     {/* Combo Chart (Bar + Line) */}
//     <div className="chart-card bg-green-50 rounded-xl p-4 shadow">
//       <h3 className="font-semibold mb-2">Wage Rate vs Employment Days</h3>
//       <ResponsiveContainer width="100%" height={250}>
//         <ComposedChart data={chartData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="district_name" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="Average_Wage_rate_per_day_per_person" barSize={20} fill="#16A34A" />
//           <Line
//             type="monotone"
//             dataKey="Average_days_of_employment_provided_per_Household"
//             stroke="#F59E0B"
//             strokeWidth={3}
//           />
//         </ComposedChart>
//       </ResponsiveContainer>
//     </div>

//     {/* Donut (Pie) Chart */}
//     <div className="chart-card bg-yellow-50 rounded-xl p-4 shadow">
//       <h3 className="font-semibold mb-2">Total Households Worked (%)</h3>
//       <ResponsiveContainer width="100%" height={250}>
//         <PieChart>
//           <Tooltip />
//           <Legend />
//           <Pie
//             data={chartData}
//             dataKey="Total_Households_Worked"
//             nameKey="district_name"
//             cx="50%"
//             cy="50%"
//             outerRadius={90}
//             innerRadius={50}
//             fill="#EAB308"
//             label
//           />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>

//     {/* Radar Chart */}
//     <div className="chart-card bg-purple-50 rounded-xl p-4 shadow">
//       <h3 className="font-semibold mb-2">Overall District Comparison</h3>
//       <ResponsiveContainer width="100%" height={300}>
//         <RadarChart outerRadius={120} data={chartData}>
//           <PolarGrid />
//           <PolarAngleAxis dataKey="district_name" />
//           <PolarRadiusAxis />
//           <Radar
//             name="Wage Rate"
//             dataKey="Average_Wage_rate_per_day_per_person"
//             stroke="#8B5CF6"
//             fill="#8B5CF6"
//             fillOpacity={0.5}
//           />
//           <Radar
//             name="Employment Days"
//             dataKey="Average_days_of_employment_provided_per_Household"
//             stroke="#F97316"
//             fill="#F97316"
//             fillOpacity={0.4}
//           />
//           <Legend />
//         </RadarChart>
//       </ResponsiveContainer>
//     </div>

//     {/* Stacked Area Chart */}
//     <div className="chart-card bg-pink-50 rounded-xl p-4 shadow">
//       <h3 className="font-semibold mb-2">Cumulative Employment & Wage Trend</h3>
//       <ResponsiveContainer width="100%" height={250}>
//         <AreaChart data={chartData}>
//           <defs>
//             <linearGradient id="color1" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.8}/>
//               <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
//             </linearGradient>
//             <linearGradient id="color2" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
//               <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
//             </linearGradient>
//           </defs>
//           <XAxis dataKey="district_name" />
//           <YAxis />
//           <CartesianGrid strokeDasharray="3 3" />
//           <Tooltip />
//           <Legend />
//           <Area
//             type="monotone"
//             dataKey="Average_Wage_rate_per_day_per_person"
//             stroke="#F43F5E"
//             fill="url(#color1)"
//           />
//           <Area
//             type="monotone"
//             dataKey="Average_days_of_employment_provided_per_Household"
//             stroke="#6366F1"
//             fill="url(#color2)"
//           />
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   </>
// ) : (
//   <p className="text-gray-500 italic">No data yet. Select filters to load charts.</p>
// )}

//         </div>

//         {/* Right: Filter + Observations */}
//         <div className="filter-section bg-white p-4 rounded-2xl shadow-md h-[90vh] sticky top-4 flex flex-col justify-between">
//           <div>
//             <h2 className="text-lg font-semibold text-blue-600 mb-2">Filter Options</h2>

//             <label className="block mb-1 font-medium">Select State:</label>
//             <select
//               value={mainState}
//               onChange={(e) => setMainState(e.target.value)}
//               className="border p-2 rounded w-full mb-3"
//             >
//               <option value="">-- Select State --</option>
//               {states.map((s) => (
//                 <option key={s} value={s}>{s}</option>
//               ))}
//             </select>

//             <label className="block mb-1 font-medium">Select Main District:</label>
//             <select
//               value={mainDistrict}
//               onChange={(e) => setMainDistrict(e.target.value)}
//               className="border p-2 rounded w-full mb-3"
//               disabled={!mainState}
//             >
//               <option value="">-- Select District --</option>
//               {districts.map((d) => (
//                 <option key={d} value={d}>{d}</option>
//               ))}
//             </select>

//             <label className="block mb-1 font-medium">Compare With Districts:</label>
//             <select
//               multiple
//               onChange={(e) =>
//                 setCompareDistricts(Array.from(e.target.selectedOptions, (opt) => opt.value))
//               }
//               className="border p-2 rounded w-full mb-3"
//               disabled={!mainState}
//             >
//               {districts.map((d) => (
//                 <option key={d} value={d}>{d}</option>
//               ))}
//             </select>

//             <button
//               onClick={useMyLocation}
//               className="bg-blue-500 text-white py-2 rounded w-full hover:bg-blue-600 mb-3"
//             >
//               Use My Current Location
//             </button>

//             <button
//               onClick={handleCompare}
//               className="bg-green-500 text-white py-2 rounded w-full hover:bg-green-600"
//             >
//               Compare
//             </button>
//           </div>

//           {/* Observations (Moved Below Filters) */}
//           <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200 overflow-y-auto max-h-60">
//             <h3 className="text-lg font-semibold text-blue-700 mb-2">Observations</h3>
//             {notes.length > 0 ? (
//               <ul className="list-disc pl-5 text-sm space-y-1">
//                 {notes.map((note, index) => (
//                   <li key={index}>{note}</li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="text-gray-500 text-sm">No observations yet. Run a comparison.</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CompareDistricts;


import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const CompareDistricts = () => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mainState, setMainState] = useState("");
  const [mainDistrict, setMainDistrict] = useState("");
  const [compareDistricts, setCompareDistricts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/mgnrega/states`)
      .then((res) => res.json())
      .then((data) => setStates(data))
      .catch((err) => console.error("Error fetching states:", err));
  }, []);

  useEffect(() => {
    if (mainState) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/mgnrega/districts?state=${mainState}`)
        .then((res) => res.json())
        .then((data) => setDistricts(data))
        .catch((err) => console.error("Error fetching districts:", err));
    }
  }, [mainState]);

  const handleCompare = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/mgnrega/compare?districts=${compareDistricts.join(",")}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setChartData(data);
      generateNotes(data);
      console.log(data);
    } catch (err) {
      console.error("Error fetching comparison data:", err);
    }
  };

  const generateNotes = (data) => {
  if (!data || data.length === 0) {
    setNotes(["No data available for selected districts."]);
    return;
  }

  const highestWage = data.reduce((a, b) =>
    a.average_wage_rate_per_day_per_person > b.average_wage_rate_per_day_per_person ? a : b
  );
  const lowestWage = data.reduce((a, b) =>
    a.average_wage_rate_per_day_per_person < b.average_wage_rate_per_day_per_person ? a : b
  );
  const highestEmployment = data.reduce((a, b) =>
    a.average_days_of_employment_provided_per_household > b.average_days_of_employment_provided_per_household ? a : b
  );

  const insights = [
    `💰 ${highestWage.district_name} leads with the highest average wage rate of ₹${highestWage.average_wage_rate_per_day_per_person}.`,
    `📉 ${lowestWage.district_name} has the lowest wage rate of ₹${lowestWage.average_wage_rate_per_day_per_person}.`,
    `👷 ${highestEmployment.district_name} provides the most employment days per household (${highestEmployment.average_days_of_employment_provided_per_household} days).`,
    `📊 Overall, wage distribution shows ${
      Math.abs(highestWage.average_wage_rate_per_day_per_person - lowestWage.average_wage_rate_per_day_per_person) > 40
        ? "high disparity between districts."
        : "moderate consistency across districts."
    }`
  ];
  setNotes(insights);
};


  const useMyLocation = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const loc = await response.json();
      setMainState(loc.region);
      setMainDistrict(loc.city);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  return (
    <div className="compare-page bg-gray-50 min-h-screen p-6 text-gray-800">
      <div className="grid grid-cols-[70%_30%] gap-6">
        {/* Left Side: Visualization Grid */}
        <div className="charts bg-white rounded-2xl shadow-md p-6 overflow-y-scroll h-[90vh]">
          <h2 className="text-2xl font-bold text-blue-600 mb-6">
            📊 District Comparison Dashboard
          </h2>

          {chartData.length > 0 ? (
            <div className="grid grid-cols-2 gap-6">
              {/* Chart 1 - Line */}
              <div className="bg-blue-50 rounded-2xl p-4 shadow">
                <h3 className="font-semibold mb-2 text-blue-700">Persondays Generated</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="district_name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="persondays_of_central_liability_so_far" stroke="#3B82F6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 2 - Bar */}
              <div className="bg-green-50 rounded-2xl p-4 shadow">
                <h3 className="font-semibold mb-2 text-green-700">Average Wage Rate</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="district_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average_wage_rate_per_day_per_person" fill="#22C55E" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 3 - Pie */}
              <div className="bg-yellow-50 rounded-2xl p-4 shadow">
                <h3 className="font-semibold mb-2 text-yellow-700">Households Worked (%)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="Total_Households_Worked"
                      nameKey="district_name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      fill="#EAB308"
                      label
                    />
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 4 - Area */}
              <div className="bg-purple-50 rounded-2xl p-4 shadow">
                <h3 className="font-semibold mb-2 text-purple-700">Wage vs Employment Days</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorWage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="district_name"/>
                    <YAxis/>
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area type="monotone" dataKey="average_days_of_employment_provided_per_household" stroke="#8B5CF6" fill="url(#colorWage)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 5 - Radar */}
              <div className="bg-pink-50 rounded-2xl p-4 shadow col-span-2">
                <h3 className="font-semibold mb-2 text-pink-700">Overall District Strength Radar</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart outerRadius={120} data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="district_name" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Wage Rate"
                      dataKey="Average_Wage_rate_per_day_per_person"
                      stroke="#F43F5E"
                      fill="#F43F5E"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Employment Days"
                      dataKey="average_wage_rate_per_day_per_person"
                      stroke="#06B6D4"
                      fill="#06B6D4"
                      fillOpacity={0.5}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No data yet. Select filters to load charts.</p>
          )}
        </div>

        {/* Right Side: Filters + Observations */}
        <div className="bg-white p-5 rounded-2xl shadow-md h-[90vh] sticky top-4 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-blue-600 mb-2">Filter Options</h2>

            <label className="block mb-1 font-medium">Select State:</label>
            <select
              value={mainState}
              onChange={(e) => setMainState(e.target.value)}
              className="border p-2 rounded w-full mb-3"
            >
              <option value="">-- Select State --</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <label className="block mb-1 font-medium">Select Main District:</label>
            <select
              value={mainDistrict}
              onChange={(e) => setMainDistrict(e.target.value)}
              className="border p-2 rounded w-full mb-3"
              disabled={!mainState}
            >
              <option value="">-- Select District --</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <label className="block mb-1 font-medium">Compare With Districts:</label>
            <select
              multiple
              onChange={(e) =>
                setCompareDistricts(Array.from(e.target.selectedOptions, (opt) => opt.value))
              }
              className="border p-2 rounded w-full mb-3"
              disabled={!mainState}
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <button
              onClick={useMyLocation}
              className="bg-blue-500 text-white py-2 rounded w-full hover:bg-blue-600 mb-3"
            >
              Use My Current Location
            </button>

            <button
              onClick={handleCompare}
              className="bg-green-500 text-white py-2 rounded w-full hover:bg-green-600"
            >
              Compare
            </button>
          </div>

          {/* Smart Observations */}
          <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200 overflow-y-auto max-h-60">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">🧠 Insights & Observations</h3>
            {notes.length > 0 ? (
              <ul className="list-disc pl-5 text-sm space-y-1">
                {notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No insights yet. Run a comparison.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareDistricts;
