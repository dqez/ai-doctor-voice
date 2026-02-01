import { useState, useRef, useCallback, useEffect } from "react";

export type RecorderState = "idle" | "recording" | "paused" | "stopped";

export interface UseAudioRecorderOptions {
  /** Audio MIME type. Default: 'audio/webm;codecs=opus' */
  mimeType?: string;
  /** Called when recording stops with the audio blob */
  onRecordingComplete?: (blob: Blob) => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

export interface UseAudioRecorderReturn {
  /** Current recorder state */
  state: RecorderState;
  /** Recording duration in seconds */
  duration: number;
  /** Audio blob after recording stops */
  audioBlob: Blob | null;
  /** Audio URL for playback */
  audioUrl: string | null;
  /** Start recording */
  startRecording: () => Promise<void>;
  /** Stop recording */
  stopRecording: () => void;
  /** Pause recording */
  pauseRecording: () => void;
  /** Resume recording */
  resumeRecording: () => void;
  /** Reset to initial state */
  reset: () => void;
  /** Whether browser supports recording */
  isSupported: boolean;
}

/**
 * React hook for audio recording using MediaRecorder API
 * @example
 * const { state, duration, startRecording, stopRecording, audioBlob } = useAudioRecorder({
 *   onRecordingComplete: (blob) => console.log('Recording complete:', blob),
 * });
 */
export function useAudioRecorder(
  options: UseAudioRecorderOptions = {},
): UseAudioRecorderReturn {
  const {
    mimeType = "audio/webm;codecs=opus",
    onRecordingComplete,
    onError,
  } = options;

  const [state, setState] = useState<RecorderState>("idle");
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);

  // Check browser support
  const isSupported =
    typeof window !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    !!window.MediaRecorder;

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  // Start timer
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - pausedDurationRef.current * 1000;
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setDuration(elapsed);
    }, 100);
  }, []);

  // Stop timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      onError?.(new Error("Audio recording is not supported in this browser"));
      return;
    }

    try {
      // Reset state
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);
      chunksRef.current = [];
      pausedDurationRef.current = 0;

      // Get microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      // Determine best supported MIME type
      let selectedMimeType = mimeType;
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Fallback options
        const fallbacks = [
          "audio/webm",
          "audio/ogg;codecs=opus",
          "audio/mp4",
          "",
        ];
        selectedMimeType =
          fallbacks.find(
            (type) => type === "" || MediaRecorder.isTypeSupported(type),
          ) || "";
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType || undefined,
      });
      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: selectedMimeType || "audio/webm",
        });
        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);
        setState("stopped");
        stopTimer();

        onRecordingComplete?.(blob);
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        const error = new Error(
          `MediaRecorder error: ${(event as ErrorEvent).message || "Unknown error"}`,
        );
        onError?.(error);
        cleanup();
        setState("idle");
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setState("recording");
      startTimer();
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error("Failed to start recording");
      onError?.(err);
      cleanup();
      setState("idle");
    }
  }, [
    isSupported,
    mimeType,
    onRecordingComplete,
    onError,
    cleanup,
    startTimer,
    stopTimer,
  ]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      stopTimer();
    }
  }, [stopTimer]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.pause();
      pausedDurationRef.current = duration;
      stopTimer();
      setState("paused");
    }
  }, [duration, stopTimer]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "paused"
    ) {
      mediaRecorderRef.current.resume();
      startTimer();
      setState("recording");
    }
  }, [startTimer]);

  // Reset to initial state
  const reset = useCallback(() => {
    cleanup();
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    pausedDurationRef.current = 0;
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setState("idle");
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    state,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
    isSupported,
  };
}
