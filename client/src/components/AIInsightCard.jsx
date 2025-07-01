import React from "react";

export function AIInsightCard({ title, insights }) {
  const bgMap = {
    positive: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    negative: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <ul className="space-y-3">
        {insights.map((ins, i) => (
          <li
            key={i}
            className={`border-l-4 pl-4 py-2 ${bgMap[ins.type]}`}
          >
            {ins.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
