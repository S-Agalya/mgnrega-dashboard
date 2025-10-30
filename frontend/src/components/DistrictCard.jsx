import React from "react";

export default function DistrictCard({ title, value, icon }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
      {icon && <div className="text-3xl">{icon}</div>}
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
