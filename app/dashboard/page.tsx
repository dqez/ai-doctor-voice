import React from "react";
import { Activity, Users, Calendar, CheckCircle2 } from "lucide-react";
import { getDashboardStats, getRecentSessions } from "../../lib/mock-data";
import { DashboardHero } from "../../components/dashboard/DashboardHero";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { SessionList } from "../../components/dashboard/SessionList";

export default async function DashboardPage() {
  // Fetch data in parallel
  const [stats, sessions] = await Promise.all([
    getDashboardStats(),
    getRecentSessions(),
  ]);

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1200px] mx-auto">
        <DashboardHero />

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            label="Sessions Today"
            value={stats.todaySessions}
            icon={Activity}
            trend={stats.todayTrend}
            trendLabel="from yesterday"
          />
          <StatsCard
            label="Total Patients"
            value={stats.totalPatients}
            icon={Users}
            trend={stats.weekTrend}
            trendLabel="new this week"
          />
          <StatsCard
            label="This Week"
            value={stats.weekSessions}
            icon={Calendar}
          />
          <StatsCard
            label="Completed (Month)"
            value={stats.monthSessions}
            icon={CheckCircle2}
          />
        </section>

        {/* Recent Sessions */}
        <section>
          <SessionList sessions={sessions} />
        </section>
      </div>
    </main>
  );
}
