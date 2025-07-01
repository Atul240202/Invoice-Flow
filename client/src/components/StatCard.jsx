import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function StatCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="h-7 w-7 text-indigo-600" />
      </div>
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">{subtitle}</p>
        <div className="flex items-center gap-1">
          {trend.isPositive ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
            {trend.value}
          </span>
        </div>
      </div>
    </div>
  );
}
