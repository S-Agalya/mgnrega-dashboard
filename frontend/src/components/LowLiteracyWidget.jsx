import React from "react";

export default function LowLiteracyWidget({ label, icon }) {
  return (
    <div className="flex flex-col items-center bg-white p-3 rounded-lg shadow">
      <div className="text-4xl">{icon}</div>
      <p className="mt-2 text-center font-medium">{label}</p>
    </div>
  );
}
