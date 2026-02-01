const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Default timeout for API calls (60 seconds)
const DEFAULT_TIMEOUT_MS = 60000;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Create fetch with timeout
 */
function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(
        new ApiError(
          `Request timeout after ${timeoutMs}ms: ${url}`,
          408, // Request Timeout
        ),
      );
    }, timeoutMs);

    fetch(url, { ...options, signal: controller.signal })
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        if (error.name === "AbortError") {
          reject(new ApiError(`Request aborted: ${url}`, 408));
        } else {
          reject(error);
        }
      });
  });
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorBody: unknown = {};
    try {
      errorBody = await response.json();
    } catch {
      // Response body is not JSON
      errorBody = { message: await response.text() };
    }

    const errorMessage =
      (errorBody as { message?: string })?.message ||
      "An error occurred while fetching the data.";
    console.error(`[API Error] ${response.status}: ${errorMessage}`, {
      url: response.url,
      status: response.status,
      body: errorBody,
    });

    throw new ApiError(errorMessage, response.status);
  }

  try {
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API Error] Failed to parse JSON response:", error);
    throw new ApiError("Invalid JSON response from server", 500);
  }
}

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    console.log(`[API GET] ${endpoint}`);
    const res = await fetchWithTimeout(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse<T>(res);
  },

  post: async <T>(endpoint: string, body: unknown): Promise<T> => {
    console.log(`[API POST] ${endpoint}`, body);
    const res = await fetchWithTimeout(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  put: async <T>(endpoint: string, body: unknown): Promise<T> => {
    console.log(`[API PUT] ${endpoint}`, body);
    const res = await fetchWithTimeout(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    console.log(`[API DELETE] ${endpoint}`);
    const res = await fetchWithTimeout(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse<T>(res);
  },
};
