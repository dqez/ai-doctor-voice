"use client";

import React, { useState, useCallback } from "react";
import {
  Mic,
  Square,
  Save,
  RotateCcw,
  Pause,
  Play,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Toast } from "@/components/ui-toast";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import {
  audioService,
  AudioUploadProgress,
  AudioServiceError,
} from "@/services/audioService";

type UploadState = "idle" | "uploading" | "success" | "error";

export default function CapturePage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  // Audio recorder hook
  const {
    state: recorderState,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
    isSupported,
  } = useAudioRecorder({
    onError: (error) => {
      setErrorMessage(error.message);
      setShowErrorToast(true);
    },
  });

  // Upload state
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] =
    useState<AudioUploadProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Toast states
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = useCallback(async () => {
    setErrorMessage("");
    await startRecording();
  }, [startRecording]);

  const handleStopRecording = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  const handlePauseRecording = useCallback(() => {
    pauseRecording();
  }, [pauseRecording]);

  const handleResumeRecording = useCallback(() => {
    resumeRecording();
  }, [resumeRecording]);

  const handleReset = useCallback(() => {
    reset();
    setUploadState("idle");
    setUploadProgress(null);
    setErrorMessage("");
  }, [reset]);

  const handleSaveAndContinue = useCallback(async () => {
    if (!audioBlob) return;

    setUploadState("uploading");
    setUploadProgress(null);
    setErrorMessage("");

    try {
      await audioService.uploadAudio(sessionId, audioBlob, (progress) => {
        setUploadProgress(progress);
      });

      setUploadState("success");
      setShowSuccessToast(true);

      // Navigate to transcript page after short delay
      setTimeout(() => {
        router.push(`/sessions/${sessionId}/transcript`);
      }, 1500);
    } catch (error) {
      setUploadState("error");

      if (error instanceof AudioServiceError) {
        setErrorMessage(`${error.message} (${error.code})`);
      } else {
        setErrorMessage("Failed to upload audio. Please try again.");
      }

      setShowErrorToast(true);
    }
  }, [audioBlob, sessionId, router]);

  const handleRetry = useCallback(() => {
    handleSaveAndContinue();
  }, [handleSaveAndContinue]);

  // Check browser support
  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-xl font-bold text-gray-800">
          Browser Not Supported
        </h2>
        <p className="text-gray-600 text-center max-w-md">
          Your browser does not support audio recording. Please use a modern
          browser like Chrome, Firefox, or Edge.
        </p>
      </div>
    );
  }

  const isRecording = recorderState === "recording";
  const isPaused = recorderState === "paused";
  const isStopped = recorderState === "stopped";
  const isUploading = uploadState === "uploading";

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 animate-in fade-in duration-500 relative">
      <div className="absolute top-0 left-0">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-display text-text">
          Record Session
        </h2>
        <p className="text-gray-500">
          Capture the conversation between doctor and patient.
        </p>
      </div>

      {/* Visualizer / Timer Circle */}
      <div className="relative group">
        <div
          className={`w-64 h-64 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
            isRecording
              ? "border-red-500 bg-red-50 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
              : isPaused
                ? "border-yellow-500 bg-yellow-50 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                : isUploading
                  ? "border-blue-500 bg-blue-50 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                  : "border-gray-200 bg-white"
          }`}
        >
          <div className="text-center">
            {isRecording && (
              <div className="animate-pulse text-red-500 font-bold mb-2">
                RECORDING
              </div>
            )}
            {isPaused && (
              <div className="text-yellow-600 font-bold mb-2">PAUSED</div>
            )}
            {isUploading && (
              <div className="text-blue-500 font-bold mb-2 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                UPLOADING
              </div>
            )}
            <div
              className={`text-5xl font-mono font-bold ${
                isRecording
                  ? "text-red-600"
                  : isPaused
                    ? "text-yellow-600"
                    : "text-gray-700"
              }`}
            >
              {formatTime(duration)}
            </div>

            {/* Upload Progress */}
            {isUploading && uploadProgress && (
              <div className="mt-4 w-40 mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {uploadProgress.percentage}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {/* Initial state - Start button */}
        {recorderState === "idle" && !audioBlob && (
          <button
            onClick={handleStartRecording}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <Mic className="w-8 h-8" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              Start Recording
            </span>
          </button>
        )}

        {/* Recording state - Pause and Stop buttons */}
        {isRecording && (
          <>
            <button
              onClick={handlePauseRecording}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-yellow-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Pause className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-600">Pause</span>
            </button>
            <button
              onClick={handleStopRecording}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Square className="w-6 h-6 fill-current" />
              </div>
              <span className="text-sm font-medium text-gray-600">Stop</span>
            </button>
          </>
        )}

        {/* Paused state - Resume and Stop buttons */}
        {isPaused && (
          <>
            <button
              onClick={handleResumeRecording}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-600">Resume</span>
            </button>
            <button
              onClick={handleStopRecording}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Square className="w-6 h-6 fill-current" />
              </div>
              <span className="text-sm font-medium text-gray-600">Stop</span>
            </button>
          </>
        )}

        {/* Post-Recording Actions */}
        {isStopped && audioBlob && !isUploading && (
          <div className="flex flex-col items-center gap-4">
            {/* Audio Preview */}
            {audioUrl && <audio controls src={audioUrl} className="mb-2" />}

            <div className="flex gap-4">
              <button
                onClick={handleReset}
                disabled={isUploading}
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Discard & Retake
              </button>
              <button
                onClick={handleSaveAndContinue}
                disabled={isUploading}
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-cta text-white font-bold shadow-lg hover:bg-green-600 transition-all hover:scale-105 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save & Analyze
              </button>
            </div>
          </div>
        )}

        {/* Error state with Retry */}
        {uploadState === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-red-500 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">{errorMessage}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Start Over
              </button>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-cta text-white font-bold shadow-lg hover:bg-green-600 transition-all hover:scale-105"
              >
                Retry Upload
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <Toast
        message="Audio saved! Generating transcript..."
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
      <Toast
        message={errorMessage || "An error occurred"}
        isVisible={showErrorToast}
        onClose={() => setShowErrorToast(false)}
        type="error"
      />
    </div>
  );
}
