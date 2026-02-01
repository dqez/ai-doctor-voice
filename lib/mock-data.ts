import { Patient, CreatePatientInput } from "@/types/patient";
import { DashboardStats, DashboardSession } from "@/types/dashboard";
import { api } from "@/services/api";
import { audioService } from "@/services/audioService";

export interface TranscriptSegment {
  id: string;
  speaker: "Doctor" | "Patient";
  text: string;
  startMs: number;
  confidence: number;
}

// MOCK_TRANSCRIPT kept as fallback for development/testing
export const MOCK_TRANSCRIPT: TranscriptSegment[] = [
  {
    id: "1",
    speaker: "Doctor",
    text: "Good morning, how are you feeling today?",
    startMs: 0,
    confidence: 0.98,
  },
  {
    id: "2",
    speaker: "Patient",
    text: "I have been having some headaches lately.",
    startMs: 2500,
    confidence: 0.95,
  },
  {
    id: "3",
    speaker: "Doctor",
    text: "I see. Can you describe the pain? Is it sharp or dull?",
    startMs: 6000,
    confidence: 0.92,
  },
  {
    id: "4",
    speaker: "Patient",
    text: "It is mostly a dull throbbing pain in the forehead.",
    startMs: 10000,
    confidence: 0.88,
  },
  {
    id: "5",
    speaker: "Doctor",
    text: "Okay, let me check your blood pressure.",
    startMs: 15000,
    confidence: 0.99,
  },
  {
    id: "6",
    speaker: "Patient",
    text: "Sure.",
    startMs: 18000,
    confidence: 0.75, // Low confidence example
  },
];

/**
 * Get transcript segments for a session
 * Uses real API call, falls back to mock data in development
 */
export async function getTranscript(
  sessionId: string,
): Promise<TranscriptSegment[]> {
  try {
    const segments = await audioService.getTranscript(sessionId);
    return segments;
  } catch (error) {
    // In development, fall back to mock data if API not available
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[getTranscript] API failed, using mock data for session ${sessionId}:`,
        error,
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      return [...MOCK_TRANSCRIPT];
    }
    throw error;
  }
}

/**
 * Update a transcript segment
 * Uses real API call
 */
export async function updateTranscriptSegment(
  sessionId: string,
  segmentId: string,
  text: string,
): Promise<void> {
  try {
    await audioService.updateSegment(sessionId, segmentId, text);
  } catch (error) {
    // In development, log and continue
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[updateTranscriptSegment] API failed for session ${sessionId}, segment ${segmentId}:`,
        error,
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
      return;
    }
    throw error;
  }
}

/**
 * Finalize transcript (mark ready for AI analysis)
 * Uses real API call
 */
export async function finalizeTranscript(sessionId: string): Promise<void> {
  try {
    await audioService.finalizeTranscript(sessionId);
  } catch (error) {
    // In development, log and continue
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[finalizeTranscript] API failed for session ${sessionId}:`,
        error,
      );
      await new Promise((resolve) => setTimeout(resolve, 800));
      return;
    }
    throw error;
  }
}

// Replaced MOCK_PATIENTS with API calls
export async function searchPatients(query: string): Promise<Patient[]> {
  if (!query) return [];
  try {
    const data = await api.get<Patient[]>(
      `/api/patients?name=${encodeURIComponent(query)}`,
    );
    return data;
  } catch (error) {
    console.error("Failed to search patients:", error);
    return [];
  }
}

export async function createPatient(
  data: CreatePatientInput,
): Promise<Patient> {
  return await api.post<Patient>("/api/patients", data);
}

export async function startSession(patientId: string): Promise<string> {
  const session = await api.post<{
    id: string;
    visitNumber: number;
    patientId: string;
  }>("/api/sessions", { patientId });
  return session.id;
}

const MOCK_STATS: DashboardStats = {
  todaySessions: 12,
  weekSessions: 45,
  monthSessions: 182,
  totalPatients: 1250,
  todayTrend: 15,
  weekTrend: 8,
};

const MOCK_RECENT_SESSIONS: DashboardSession[] = [
  {
    id: "s1",
    patientName: "Nguyen Van An",
    patientId: "p1",
    date: new Date().toISOString(),
    status: "in-progress",
    currentStep: 2,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    id: "s2",
    patientName: "Tran Thi Binh",
    patientId: "p2",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: "review",
    currentStep: 4,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
  },
  {
    id: "s3",
    patientName: "Le Hoang Nam",
    patientId: "p3",
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    status: "completed",
    currentStep: 4,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
  },
  {
    id: "s4",
    patientName: "Pham Thi Dung",
    patientId: "p4",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "scheduled",
    currentStep: 1,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];

export async function getDashboardStats(): Promise<DashboardStats> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_STATS;
}

export async function getRecentSessions(): Promise<DashboardSession[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));
  return MOCK_RECENT_SESSIONS;
}
