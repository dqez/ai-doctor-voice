"use client";

import React from "react";
import { ArrowRight, Clock } from "lucide-react";
import { DashboardSession } from "../../types/dashboard";
import { SessionStatusBadge } from "./SessionStatusBadge";

import { useRouter } from "next/navigation";

interface SessionListProps {
  sessions: DashboardSession[];
}

export function SessionList({ sessions }: SessionListProps) {
  const router = useRouter();

  const handleOpenSession = (session: DashboardSession) => {
    // Map status/step to the correct route
    // Defaulting to capture if unknown
    let path = `/sessions/${session.id}/capture`;

    if (session.currentStep === 2) {
      path = `/sessions/${session.id}/transcript`;
    } else if (session.currentStep === 3) {
      path = `/sessions/${session.id}/analysis`;
    } else if (session.currentStep === 4) {
      path = `/sessions/${session.id}/review`;
    } else if (session.status === "completed") {
      // Completed sessions might go to review or a summary page
      path = `/sessions/${session.id}/review`; // Assuming review page is the final view
    }

    router.push(path);
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-500">No recent sessions found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Recent Sessions</h2>
      </div>

      {/* Mobile View: Cards */}
      <div className="block md:hidden">
        <ul className="divide-y divide-slate-100">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => handleOpenSession(session)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-slate-800">
                    {session.patientName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ID: {session.patientId}
                  </p>
                </div>
                <button
                  className="p-2 text-slate-400 hover:text-primary transition-colors"
                  aria-label={`Open session for ${session.patientName}`}
                >
                  <ArrowRight size={18} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <SessionStatusBadge
                  status={session.status}
                  step={session.currentStep}
                />
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(session.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Patient</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Updated</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sessions.map((session) => (
              <tr
                key={session.id}
                className="hover:bg-slate-50 transition-colors group cursor-pointer"
                onClick={() => handleOpenSession(session)}
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">
                    {session.patientName}
                  </div>
                  <div className="text-xs text-slate-400">
                    {session.patientId}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <SessionStatusBadge
                    status={session.status}
                    step={session.currentStep}
                  />
                </td>
                <td className="px-6 py-4 text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    {new Date(session.lastUpdated).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    className="text-primary font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                    aria-label={`Open session ${session.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSession(session);
                    }}
                  >
                    Open Session
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
