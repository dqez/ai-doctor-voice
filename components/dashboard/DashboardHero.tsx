"use client";

import React from "react";
import { Plus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
export function DashboardHero() {
  const router = useRouter();

  return (
    <section className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-text font-display">
          AI Doctor Voice
        </h1>
        <p className="text-slate-500 mt-1">
          Welcome back, Dr. Smith. Here is your daily overview.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/patients/new")}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
          aria-label="Create new patient"
        >
          <UserPlus size={18} />
          <span className="hidden sm:inline">New Patient</span>
        </button>
        <button
          onClick={() => router.push("/patients/search")}
          className="flex items-center gap-2 px-4 py-2 bg-cta text-white rounded-lg font-medium hover:bg-green-600 transition-colors shadow-md hover:shadow-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
          aria-label="Start new session"
        >
          <Plus size={18} />
          <span>New Session</span>
        </button>
      </div>
    </section>
  );
}
