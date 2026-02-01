import { api } from "@/services/api";

/** Maximum retry attempts for API calls */
const MAX_RETRIES = 3;

/** Base delay for exponential backoff (ms) */
const BASE_DELAY = 1000;

export interface SoapData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icd10: { code: string; description: string }[];
}

export interface AnalysisStatus {
  lastUpdated: string;
  status: "draft" | "finalized" | "processing" | "error";
}

export interface AnalysisResult {
  soap: SoapData;
  status: AnalysisStatus;
}

export class AnalysisServiceError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = "AnalysisServiceError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: 2s, 4s, 8s
      const delay = Math.pow(2, attempt) * BASE_DELAY;
      console.log(
        `[AnalysisService] Attempt ${attempt} failed, retrying in ${delay}ms...`,
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

export const analysisService = {
  /**
   * Get AI draft or current analysis for a session
   */
  getAiDraft: async (sessionId: string): Promise<AnalysisResult> => {
    return retryWithBackoff(async () => {
      const res = await api.get<{
        id?: string;
        subjective?: string;
        objective?: string;
        assessment?: string;
        plan?: string;
        icdCodes?: { code: string; description: string }[];
        icd10?: { code: string; description: string }[];
        status?: string;
        updatedAt?: string;
      }>(`/api/sessions/${sessionId}/analysis`);

      return {
        soap: {
          subjective: res.subjective || "",
          objective: res.objective || "",
          assessment: res.assessment || "",
          plan: res.plan || "",
          icd10: res.icdCodes || res.icd10 || [],
        },
        status: {
          lastUpdated: res.updatedAt || new Date().toISOString(),
          status: mapBackendStatus(res.status),
        },
      };
    });
  },

  /**
   * Trigger AI analysis on finalized transcript
   * This calls the Gemini API via backend
   */
  triggerFinalAnalysis: async (sessionId: string): Promise<AnalysisResult> => {
    return retryWithBackoff(async () => {
      const res = await api.post<{
        id?: string;
        subjective?: string;
        objective?: string;
        assessment?: string;
        plan?: string;
        icdCodes?: { code: string; description: string }[];
        icd10?: { code: string; description: string }[];
        status?: string;
        updatedAt?: string;
      }>(`/api/sessions/${sessionId}/analysis/trigger`, {});

      return {
        soap: {
          subjective: res.subjective || "",
          objective: res.objective || "",
          assessment: res.assessment || "",
          plan: res.plan || "",
          icd10: res.icdCodes || res.icd10 || [],
        },
        status: {
          lastUpdated: res.updatedAt || new Date().toISOString(),
          status: mapBackendStatus(res.status),
        },
      };
    });
  },

  /**
   * Save draft SOAP data (doctor edits)
   */
  saveDraft: async (sessionId: string, data: SoapData): Promise<void> => {
    return retryWithBackoff(async () => {
      await api.put(`/api/sessions/${sessionId}/analysis/draft`, {
        subjective: data.subjective,
        objective: data.objective,
        assessment: data.assessment,
        plan: data.plan,
        icdCodes: data.icd10,
      });
    });
  },

  /**
   * Proceed to review step (after saving final analysis)
   */
  proceedToReview: async (sessionId: string): Promise<void> => {
    console.log(`[Analysis] Proceeding to review for session ${sessionId}`);
    // Navigation is handled by the page component
  },

  /**
   * Create comparison record for review
   */
  createComparison: async (
    sessionId: string,
    data: {
      aiResults: SoapData;
      doctorResults: SoapData;
      matchScore: number;
    },
  ): Promise<{ id: string; matchScore: number }> => {
    return retryWithBackoff(async () => {
      return await api.post(`/api/sessions/${sessionId}/review/compare`, {
        aiResults: data.aiResults,
        doctorResults: data.doctorResults,
        matchScore: data.matchScore,
      });
    });
  },

  /**
   * Get analysis status (for polling)
   */
  getAnalysisStatus: async (sessionId: string): Promise<AnalysisStatus> => {
    return retryWithBackoff(async () => {
      const res = await api.get<{
        status?: string;
        updatedAt?: string;
      }>(`/api/sessions/${sessionId}/analysis/status`);

      return {
        lastUpdated: res.updatedAt || new Date().toISOString(),
        status: mapBackendStatus(res.status),
      };
    });
  },
};

/**
 * Map backend status to frontend status
 */
function mapBackendStatus(
  status?: string,
): "draft" | "finalized" | "processing" | "error" {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
    case "FINALIZED":
      return "finalized";
    case "PROCESSING":
    case "IN_PROGRESS":
      return "processing";
    case "ERROR":
    case "FAILED":
      return "error";
    case "DRAFT":
    default:
      return "draft";
  }
}
