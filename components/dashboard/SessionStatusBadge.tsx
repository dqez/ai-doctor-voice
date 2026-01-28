import React from "react";
import { DashboardSession, SessionStatus } from "../../types/dashboard";

interface SessionStatusBadgeProps {
  status: SessionStatus;
  step: number;
}

export function SessionStatusBadge({ status, step }: SessionStatusBadgeProps) {
  const getStatusStyles = (s: SessionStatus) => {
    switch (s) {
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "review":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "scheduled":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getLabel = (s: SessionStatus) => {
    switch (s) {
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "review":
        return "Review";
      case "scheduled":
        return "Scheduled";
      default:
        return s;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(
          status,
        )}`}
      >
        {getLabel(status)}
      </span>
      {status !== "scheduled" && (
        <span className="text-xs text-slate-400 font-medium">
          Step {step}/4
        </span>
      )}
    </div>
  );
}
