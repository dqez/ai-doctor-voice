import { Patient, CreatePatientInput } from "@/types/patient";
import { DashboardStats, DashboardSession } from "@/types/dashboard";

export interface TranscriptSegment {
  id: string;
  speaker: "Doctor" | "Patient";
  text: string;
  startMs: number;
  confidence: number;
}

const MOCK_TRANSCRIPT: TranscriptSegment[] = [
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

export async function getTranscript(
  sessionId: string,
): Promise<TranscriptSegment[]> {
  console.log(`[Mock] Fetching transcript for session ${sessionId}`);
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [...MOCK_TRANSCRIPT];
}

export async function updateTranscriptSegment(
  sessionId: string,
  segmentId: string,
  text: string,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  console.log(
    `[Mock] Updated segment ${segmentId} for session ${sessionId}: ${text}`,
  );
}

export async function finalizeTranscript(sessionId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  console.log(`[Mock] Finalized transcript for session ${sessionId}`);
}

const MOCK_PATIENTS: Patient[] = [
  {
    id: "p1",
    name: "Nguyen Van An",
    dob: "1985-04-12",
    gender: "Male",
    phone: "0912345678",
    lastVisit: "2023-10-15",
  },
  {
    id: "p2",
    name: "Tran Thi Binh",
    dob: "1992-08-25",
    gender: "Female",
    phone: "0987654321",
    lastVisit: "2024-01-05",
  },
  {
    id: "p3",
    name: "Le Hoang Nam",
    dob: "1978-12-30",
    gender: "Male",
    phone: "0909090909",
  },
];

export async function searchPatients(query: string): Promise<Patient[]> {
  console.log(`[Mock] Searching patients with query: ${query}`);
  await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate delay

  if (!query) return [];

  const lowerQuery = query.toLowerCase();
  return MOCK_PATIENTS.filter(
    (p) => p.name.toLowerCase().includes(lowerQuery) || p.phone.includes(query),
  );
}

export async function createPatient(
  data: CreatePatientInput,
): Promise<Patient> {
  console.log(`[Mock] Creating patient:`, data);
  await new Promise((resolve) => setTimeout(resolve, 800));

  const newPatient: Patient = {
    id: `p${Date.now()}`,
    ...data,
    lastVisit: new Date().toISOString().split("T")[0],
  };
  MOCK_PATIENTS.push(newPatient); // In-memory update
  return newPatient;
}

export async function startSession(patientId: string): Promise<string> {
  console.log(`[Mock] Starting session for patient: ${patientId}`);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return `sess_${Date.now()}`;
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
