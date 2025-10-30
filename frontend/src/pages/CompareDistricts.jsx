import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/**
 * CompareDistricts.jsx
 * - Directly uses your provided API endpoint (you gave the key earlier)
 * - Type-to-search (state -> district) for base district (A)
 * - Add multiple comparison districts (B, C, ...) by typing district names (filtered by selected state)
 * - Use My Current Location to auto-fill base district A
 * - Left: 70% charts, Right: 30% inputs + notes
 *
 * NOTES:
 * - This fetches a large dataset once (limit param). If data.gov rate-limits, reduce limit or use backend caching.
 * - Field names in real data vary; the aggregate function tries common keys (see getFieldValue candidates).
 */

// ---------- CONFIG ----------
const DATA_API =
  "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722?api-key=579b464db66ec23bdd00000158d7f27568304ad5723a580fca32723b&format=json&limit=10000";
// increase limit if needed (beware rate limits)
// ---------- helpers ----------
function safeNum(x) {
  const v = parseFloat(String(x).replace(/,/g, ""));
  return Number.isFinite(v) ? v : 0;
}
function getFieldValue(row, candidates) {
  for (const k of candidates) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== "") {
      const n = parseFloat(String(row[k]).replace(/,/g, ""));
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}
function aggregateDistrict(records, districtName) {
  if (!districtName) return null;
  const rows = records.filter(
    (r) =>
      r.district_name &&
      r.district_name.toString().trim().toLowerCase() ===
        districtName.toString().trim().toLowerCase()
  );
  if (!rows.length) return null;

  const metrics = {
    persondays: [
      "total_persondays",
      "persondays_generated",
      "total_persondays_generated",
      "total_persondays_in_lakhs",
      "persondays_generated_in_lakhs",
    ],
    wages: [
      "total_wages_paid",
      "total_wages",
      "total_wages_paid_in_rupees",
      "total_wages_paid_in_lakhs",
    ],
    households: ["households_worked", "total_households_worked", "hh_worked"],
    worksCompleted: ["total_works_completed", "works_completed"],
    womenPercent: [
      "percentage_women",
      "women_participation",
      "percentage_women_participation",
    ],
    expenditureLakhs: ["expenditure_in_lakhs", "expenditure_lakhs"],
  };

  const agg = { displayName: rows[0].district_name, stateName: rows[0].state_name };

  agg.persondays = rows.reduce(
    (s, r) => s + getFieldValue(r, metrics.persondays),
    0
  );
  agg.wages = rows.reduce((s, r) => s + getFieldValue(r, metrics.wages), 0);
  agg.households = rows.reduce(
    (s, r) => s + getFieldValue(r, metrics.households),
    0
  );
  agg.worksCompleted = rows.reduce(
    (s, r) => s + getFieldValue(r, metrics.worksCompleted),
    0
  );
  const wp = rows.map((r) => getFieldValue(r, metrics.womenPercent)).filter((v) => v !== 0);
  agg.womenPercent = wp.length ? wp.reduce((a,b)=>a+b,0)/wp.length : 0;
  agg.expenditureLakhs = rows.reduce(
    (s, r) => s + getFieldValue(r, metrics.expenditureLakhs),
    0
  );

  return agg;
}

// ---------- component ----------
export default function CompareDistricts() {
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [error, setError] = useState("");

  // inputs for base district (A)
  const [stateAInput, setStateAInput] = useState("");
  const [districtAInput, setDistrictAInput] = useState("");
  const [stateASuggestions, setStateASuggestions] = useState([]);
  const [districtASuggestions, setDistrictASuggestions] = useState([]);

  // inputs for adding compare districts (these share states/district lists)
  const [stateForCompare, setStateForCompare] = useState(""); // filter state for compare suggestions
  const [compareDistrictInput, setCompareDistrictInput] = useState("");
  const [compareDistrictSuggestions, setCompareDistrictSuggestions] = useState([]);

  // list of selected compare districts (strings)
  const [compareList, setCompareList] = useState([]);

  // aggregated objects
  const aggA = useMemo(() => aggregateDistrict(records, districtAInput), [records, districtAInput]);
  const aggCompare = useMemo(
    () => compareList.map((d) => ({ name: d, agg: aggregateDistrict(records, d) })),
    [records, compareList]
  );

  // derived lists
  const states = useMemo(() => {
    const s = [...new Set(records.map((r) => r.state_name).filter(Boolean))];
    s.sort((a,b)=>a.localeCompare(b));
    return s;
  }, [records]);

  // When a stateAInput changes, compute suggestions
  useEffect(() => {
    if (!stateAInput) {
      setStateASuggestions([]);
      return;
    }
    const matches = states.filter((s) =>
      s.toLowerCase().startsWith(stateAInput.toLowerCase())
    );
    setStateASuggestions(matches.slice(0, 10));
  }, [stateAInput, states]);

  // When stateAInput is selected, update district suggestions source
  useEffect(() => {
    if (!stateAInput) {
      setDistrictASuggestions([]);
      return;
    }
    const districtsForState = [
      ...new Set(
        records
          .filter((r) => r.state_name === stateAInput)
          .map((r) => r.district_name)
          .filter(Boolean)
      ),
    ].sort((a,b)=>a.localeCompare(b));
    // if there is text in districtAInput, filter
    if (!districtAInput) {
      setDistrictASuggestions(districtsForState.slice(0, 30));
    } else {
      setDistrictASuggestions(
        districtsForState.filter((d) =>
          d.toLowerCase().startsWith(districtAInput.toLowerCase())
        ).slice(0,30)
      );
    }
  }, [stateAInput, districtAInput, records]);

  // When user types for compare district, filter by stateForCompare
  useEffect(() => {
    if (!stateForCompare) {
      setCompareDistrictSuggestions([]);
      return;
    }
    const districtsForState = [
      ...new Set(
        records
          .filter((r) => r.state_name === stateForCompare)
          .map((r) => r.district_name)
          .filter(Boolean)
      ),
    ].sort((a,b)=>a.localeCompare(b));
    if (!compareDistrictInput) {
      setCompareDistrictSuggestions(districtsForState.slice(0, 30));
    } else {
      setCompareDistrictSuggestions(
        districtsForState.filter((d) =>
          d.toLowerCase().startsWith(compareDistrictInput.toLowerCase())
        ).slice(0,30)
      );
    }
  }, [stateForCompare, compareDistrictInput, records]);

  // initial fetch
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingRecords(true);
        const r = await fetch(DATA_API);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const js = await r.json();
        // records are in js.records or js.data, fallback to js
        const recs = js.records ?? js.data ?? js;
        if (!Array.isArray(recs)) {
          throw new Error("Unexpected API response structure");
        }
        if (!mounted) return;
        setRecords(recs);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load data from the API. Check network or rate-limit.");
      } finally {
        setLoadingRecords(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Use my location -> fill base state & district (A)
  const useMyLocationForA = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const js = await resp.json();
          const state = js.address?.state ?? "";
          // fallback fields for district-like names
          const district =
            js.address?.city_district ||
            js.address?.county ||
            js.address?.city ||
            js.address?.town ||
            "";
          if (state) setStateAInput(state);
          if (district) setDistrictAInput(district);
        } catch (err) {
          console.error(err);
          alert("Could not determine location details from geocoder.");
        }
      },
      (err) => {
        console.error(err);
        alert("Could not access location.");
      },
      { enableHighAccuracy: true }
    );
  };

  // Add compare district
  const addCompareDistrict = () => {
    const d = (compareDistrictInput || "").trim();
    if (!stateForCompare) {
      alert("Select / type a state for compare district first.");
      return;
    }
    if (!d) {
      alert("Type/select a district name to add.");
      return;
    }
    // verify presence in records
    const found = records.find(
      (r) =>
        r.state_name === stateForCompare &&
        r.district_name.toLowerCase() === d.toLowerCase()
    );
    if (!found) {
      // allow adding even if exact match not found, but warn
      if (!confirm(`${d} not found exactly in data for ${stateForCompare}. Add anyway?`)) {
        return;
      }
    }
    if (!compareList.includes(d)) {
      setCompareList((s) => [...s, d]);
    }
    setCompareDistrictInput("");
  };

  const removeCompareDistrict = (dName) => {
    setCompareList((s) => s.filter((d) => d !== dName));
  };

  // Chart blocks: for each compare district, we will show a small 6-metric comparison bar chart with two bars (A vs X)
  const colorA = "#4f46e5";
  const colorB = "#10b981";

  // quick format
  const fmt = (n) => (Number.isFinite(n) ? Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: charts (70% ~ col-span-9 of 12) */}
        <main className="lg:col-span-9 bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Compare Districts</h2>

          {loadingRecords ? (
            <div className="py-12 text-center text-gray-600">Loading dataset — please wait...</div>
          ) : error ? (
            <div className="py-6 text-center text-red-600">{error}</div>
          ) : (
            <>
              {/* header summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded bg-gray-50">
                  <div className="text-sm text-gray-500">Base District</div>
                  <div className="text-lg font-semibold">{aggA?.displayName ?? "—"}</div>
                  <div className="text-xs text-gray-400">{aggA?.stateName ?? ""}</div>
                </div>
                <div className="p-4 rounded bg-gray-50">
                  <div className="text-sm text-gray-500">Compared With</div>
                  <div className="text-lg font-semibold">{compareList.length ? compareList.join(", ") : "—"}</div>
                </div>
                <div className="p-4 rounded bg-gray-50">
                  <div className="text-sm text-gray-500">Records</div>
                  <div className="text-lg font-semibold">{records.length.toLocaleString()}</div>
                </div>
              </div>

              {/* If base district not set, encourage user */}
              {!districtAInput ? (
                <div className="text-center py-12 text-gray-500">
                  Select a base district (District A) on the right to begin comparing.
                </div>
              ) : compareList.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Add one or more comparison districts on the right.</div>
              ) : (
                <div className="space-y-6">
                  {/* For each compare district create a comparison card */}
                  {compareList.map((cmp) => {
                    const aggX = aggregateDistrict(records, cmp);
                    const base = aggA;
                    const x = aggX;
                    // if either missing, show message
                    if (!base || !x) {
                      return (
                        <div key={cmp} className="p-4 border rounded-lg">
                          <div className="font-semibold">{cmp}</div>
                          <div className="text-sm text-gray-500">Data not available for one of the districts.</div>
                        </div>
                      );
                    }

                    // build chart data for metrics
                    const chartData = [
                      { metric: "Person-days", A: safeNum(base.persondays), B: safeNum(x.persondays) },
                      { metric: "Wages", A: safeNum(base.wages), B: safeNum(x.wages) },
                      { metric: "Households", A: safeNum(base.households), B: safeNum(x.households) },
                      { metric: "Works Comp.", A: safeNum(base.worksCompleted), B: safeNum(x.worksCompleted) },
                      { metric: "Women %", A: safeNum(base.womenPercent), B: safeNum(x.womenPercent) },
                      { metric: "Expend. (L)", A: safeNum(base.expenditureLakhs), B: safeNum(x.expenditureLakhs) },
                    ];

                    return (
                      <div key={cmp} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-semibold">{base.displayName} vs {x.displayName}</div>
                            <div className="text-xs text-gray-500">{base.stateName} • {x.stateName}</div>
                          </div>
                          <button
                            onClick={() => removeCompareDistrict(cmp)}
                            className="text-sm text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>

                        <div style={{ width: "100%", height: 260 }}>
                          <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                              <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                              <YAxis />
                              <Tooltip formatter={(v)=>typeof v==="number"?v.toLocaleString():v} />
                              <Legend />
                              <Bar dataKey="A" name={base.displayName} fill={colorA} />
                              <Bar dataKey="B" name={x.displayName} fill={colorB} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="text-xs text-gray-500">Person-days</div>
                            <div className="font-medium">{fmt(base.persondays)} vs {fmt(x.persondays)}</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="text-xs text-gray-500">Wages</div>
                            <div className="font-medium">₹{fmt(base.wages)} vs ₹{fmt(x.wages)}</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="text-xs text-gray-500">Women %</div>
                            <div className="font-medium">{fmt(base.womenPercent)}% vs {fmt(x.womenPercent)}%</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>

        {/* RIGHT: panel (30% ~ col-span-3) */}
        <aside className="lg:col-span-3 bg-white rounded-2xl shadow p-5 sticky top-6 self-start">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Filters & Compare</h3>

          {/* Base District A */}
          <div className="mb-4 border rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">District A (base)</div>
              <button
                onClick={useMyLocationForA}
                className="text-xs text-indigo-600"
                title="Fill base district from your location"
              >
                📍 Use my location
              </button>
            </div>

            <label className="text-xs text-gray-500">State</label>
            <input
              value={stateAInput}
              onChange={(e)=>{ setStateAInput(e.target.value); setStateASuggestions([]); }}
              placeholder="Type state..."
              className="w-full border rounded px-3 py-2 mt-1 mb-2 focus:ring-2 focus:ring-indigo-200"
            />
            {stateASuggestions.length > 0 && (
              <div className="max-h-32 overflow-y-auto border rounded mb-2">
                {stateASuggestions.map((s,i)=>(
                  <div
                    key={i}
                    className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
                    onClick={() => { setStateAInput(s); setStateASuggestions([]); setDistrictASuggestions([]); }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}

            <label className="text-xs text-gray-500">District</label>
            <input
              value={districtAInput}
              onChange={(e)=>{ setDistrictAInput(e.target.value); setDistrictASuggestions([]); }}
              placeholder={stateAInput ? "Type district..." : "Select / type a state first"}
              disabled={!stateAInput}
              className={`w-full border rounded px-3 py-2 mt-1 ${stateAInput ? "focus:ring-2 focus:ring-indigo-200" : "bg-gray-100 cursor-not-allowed"}`}
            />
            {districtASuggestions.length > 0 && (
              <div className="max-h-36 overflow-y-auto border rounded mt-2">
                {districtASuggestions.map((d,i)=>(
                  <div
                    key={i}
                    className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
                    onClick={() => { setDistrictAInput(d); setDistrictASuggestions([]); }}
                  >
                    {d}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add compare districts area */}
          <div className="mb-4 border rounded p-3">
            <div className="font-medium mb-2">Add compare district(s)</div>

            <label className="text-xs text-gray-500">State (for compare)</label>
            <input
              value={stateForCompare}
              onChange={(e)=>{ setStateForCompare(e.target.value); setCompareDistrictSuggestions([]); }}
              placeholder="Type a state to filter districts"
              className="w-full border rounded px-3 py-2 mt-1 mb-2 focus:ring-2 focus:ring-indigo-200"
            />
            {stateForCompare && (
              <div className="text-xs text-gray-400 mb-2">Tip: type few letters, then type district below and click Add</div>
            )}

            <label className="text-xs text-gray-500">District</label>
            <div className="flex gap-2">
              <input
                value={compareDistrictInput}
                onChange={(e)=>{ setCompareDistrictInput(e.target.value); setCompareDistrictSuggestions([]); }}
                placeholder={stateForCompare ? "Type district..." : "Type state first"}
                disabled={!stateForCompare}
                className={`flex-1 border rounded px-3 py-2 mt-1 ${stateForCompare ? "focus:ring-2 focus:ring-indigo-200" : "bg-gray-100 cursor-not-allowed"}`}
              />
              <button
                onClick={addCompareDistrict}
                className="bg-indigo-600 text-white px-3 py-2 rounded mt-1"
              >
                Add
              </button>
            </div>
            {compareDistrictSuggestions.length > 0 && (
              <div className="max-h-32 overflow-y-auto border rounded mt-2">
                {compareDistrictSuggestions.map((d,i)=>(
                  <div key={i} className="px-3 py-2 hover:bg-indigo-50 cursor-pointer" onClick={()=>{ setCompareDistrictInput(d); setCompareDistrictSuggestions([]); }}>
                    {d}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* list of compare districts (chips) */}
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Comparing with:</div>
            <div className="flex flex-wrap gap-2">
              {compareList.length === 0 ? <div className="text-xs text-gray-400">No districts added</div> : compareList.map((d)=>(
                <div key={d} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full flex items-center gap-2">
                  <span className="text-sm">{d}</span>
                  <button onClick={()=>removeCompareDistrict(d)} className="text-xs text-red-500">x</button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-400">Tip: Add multiple districts to compare with the base district. Remove by clicking x.</div>
        </aside>
      </div>
    </div>
  );
}
