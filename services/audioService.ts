import { TranscriptSegment } from "@/lib/mock-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/** Maximum retry attempts for API calls */
const MAX_RETRIES = 3;

/** Base delay for exponential backoff (ms) */
const BASE_DELAY = 1000;

export interface AudioUploadResponse {
  segments: TranscriptSegment[];
  duration: number;
  sessionId: string;
}

export interface AudioUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class AudioServiceError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = "AudioServiceError";
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
        `[AudioService] Attempt ${attempt} failed, retrying in ${delay}ms...`,
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Audio service for uploading recordings and managing audio-related API calls
 */
export const audioService = {
  /**
   * Upload audio blob to backend for transcription
   * @param sessionId - The session ID to associate the audio with
   * @param audioBlob - The audio blob from MediaRecorder
   * @param onProgress - Optional callback for upload progress
   * @returns Transcript segments and duration
   */
  uploadAudio: async (
    sessionId: string,
    audioBlob: Blob,
    onProgress?: (progress: AudioUploadProgress) => void,
  ): Promise<AudioUploadResponse> => {
    return retryWithBackoff(async () => {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      // Use XMLHttpRequest for progress tracking
      return new Promise<AudioUploadResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable && onProgress) {
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            });
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch {
              reject(
                new AudioServiceError(
                  "Invalid response from server",
                  "PARSE_ERROR",
                  xhr.status,
                ),
              );
            }
          } else {
            let errorMessage = "Failed to upload audio";
            let errorCode = "UPLOAD_FAILED";

            try {
              const errorBody = JSON.parse(xhr.responseText);
              errorMessage = errorBody.message || errorMessage;
              errorCode = errorBody.error || errorCode;
            } catch {
              // Use default error message
            }

            reject(new AudioServiceError(errorMessage, errorCode, xhr.status));
          }
        });

        xhr.addEventListener("error", () => {
          reject(
            new AudioServiceError(
              "Network error during upload",
              "NETWORK_ERROR",
            ),
          );
        });

        xhr.addEventListener("timeout", () => {
          reject(new AudioServiceError("Upload timed out", "TIMEOUT_ERROR"));
        });

        xhr.open("POST", `${API_URL}/api/sessions/${sessionId}/audio`);
        xhr.timeout = 120000; // 2 minute timeout for large files
        xhr.send(formData);
      });
    });
  },

  /**
   * Get transcript segments for a session
   */
  getTranscript: async (sessionId: string): Promise<TranscriptSegment[]> => {
    return retryWithBackoff(async () => {
      const response = await fetch(
        `${API_URL}/api/sessions/${sessionId}/transcript`,
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new AudioServiceError(
          errorBody.message || "Failed to fetch transcript",
          errorBody.error || "FETCH_FAILED",
          response.status,
        );
      }

      return response.json();
    });
  },

  /**
   * Update a transcript segment
   */
  updateSegment: async (
    sessionId: string,
    segmentId: string,
    text: string,
  ): Promise<TranscriptSegment> => {
    return retryWithBackoff(async () => {
      const response = await fetch(
        `${API_URL}/api/sessions/${sessionId}/transcript/${segmentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        },
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new AudioServiceError(
          errorBody.message || "Failed to update segment",
          errorBody.error || "UPDATE_FAILED",
          response.status,
        );
      }

      return response.json();
    });
  },

  /**
   * Finalize transcript (mark as ready for analysis)
   */
  finalizeTranscript: async (sessionId: string): Promise<void> => {
    return retryWithBackoff(async () => {
      const response = await fetch(
        `${API_URL}/api/sessions/${sessionId}/transcript/finalize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new AudioServiceError(
          errorBody.message || "Failed to finalize transcript",
          errorBody.error || "FINALIZE_FAILED",
          response.status,
        );
      }
    });
  },
};
