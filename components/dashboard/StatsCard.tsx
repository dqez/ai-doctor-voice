import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
}: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg text-primary">
          <Icon size={24} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center text-sm">
          <span
            className={`font-medium ${
              trend >= 0 ? "text-cta" : "text-red-500"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
          <span className="text-slate-400 ml-2">
            {trendLabel || "vs last period"}
          </span>
        </div>
      )}
    </div>
  );
}
