export type SessionStatus =
  | "scheduled"
  | "in-progress"
  | "review"
  | "completed";

export interface DashboardSession {
  id: string;
  patientName: string;
  patientId: string;
  date: string; // ISO string
  status: SessionStatus;
  currentStep: number; // 1-4
  lastUpdated: string; // ISO string
}

export interface DashboardStats {
  todaySessions: number;
  weekSessions: number;
  monthSessions: number;
  totalPatients: number;
  // Trends (optional for visual flair)
  todayTrend?: number; // percentage
  weekTrend?: number;
}
