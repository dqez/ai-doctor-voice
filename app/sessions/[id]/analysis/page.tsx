"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Bot,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { analysisService, AnalysisResult } from "@/services/analysisService";
import { Toast } from "@/components/ui-toast";

type AnalysisStage =
  | "idle"
  | "triggering"
  | "processing"
  | "complete"
  | "error";

const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_ATTEMPTS = 60; // 2 minutes max

export default function AnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [stage, setStage] = useState<AnalysisStage>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);

  // Prevent double trigger on mount/re-render
  const hasTriggeredRef = useRef(false);

  // Toast states
  const [showErrorToast, setShowErrorToast] = useState(false);

  // Timer ref cho fake progress
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate progress animation logic
  const startSimulatedProgress = useCallback(() => {
    // Clear any existing timer
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    setProgress(0);
    const startTime = Date.now();
    const DURATION = 20000; // Dự kiến mất 20s

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // Hàm easing: nhanh lúc đầu, chậm dần về sau. Max 95%.
      // Formula: 95 * (1 - e^(-5 * elapsed / duration))
      const nextProgress = Math.min(
        95,
        95 * (1 - Math.exp((-5 * elapsed) / DURATION)),
      );

      setProgress(nextProgress);
    }, 100);
  }, []);

  const stopSimulatedProgress = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopSimulatedProgress();
  }, [stopSimulatedProgress]);

  // Trigger AI analysis
  const triggerAnalysis = useCallback(async () => {
    setStage("triggering");
    setErrorMessage("");
    // Start fake progress
    startSimulatedProgress();

    try {
      const analysisResult =
        await analysisService.triggerFinalAnalysis(sessionId);

      // Stop fake progress once we have result
      stopSimulatedProgress();

      if (
        analysisResult.status.status === "finalized" ||
        (analysisResult.status.status === "draft" &&
          (analysisResult.soap.subjective || analysisResult.soap.assessment))
      ) {
        // Analysis completed immediately (either finalized or draft with content)
        setResult(analysisResult);
        setStage("complete");
        setProgress(100);
      } else {
        // Analysis is processing, start polling but maintain current progress
        setStage("processing");
        startPolling();
      }
    } catch (error) {
      // Ensure we stop fake progress on error
      stopSimulatedProgress();
      setStage("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to trigger AI analysis. Please try again.",
      );
      setShowErrorToast(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, startSimulatedProgress, stopSimulatedProgress]); // startPolling creates circular dependency - intentional

  // Check for existing analysis on mount
  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasTriggeredRef.current) {
      return;
    }
    hasTriggeredRef.current = true;

    async function checkExistingAnalysis() {
      try {
        const existing = await analysisService.getAiDraft(sessionId);

        if (
          existing.status.status === "finalized" ||
          (existing.status.status === "draft" &&
            (existing.soap.subjective || existing.soap.assessment))
        ) {
          // Analysis already complete
          setResult(existing);
          setStage("complete");
          setProgress(100);
        } else if (existing.status.status === "processing") {
          // Analysis in progress, start polling
          setStage("processing");
          startPolling();
        } else {
          // No analysis yet, trigger it
          triggerAnalysis();
        }
      } catch {
        // No existing analysis, trigger new one
        triggerAnalysis();
      }
    }

    checkExistingAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, triggerAnalysis]); // startPolling creates circular dependency - intentional

  const startPolling = useCallback(() => {
    let attempts = 0;

    // Nếu polling bắt đầu từ trạng thái processing, tiếp tục fake progress chậm hơn
    if (!progressTimerRef.current) {
      // Simple linear progress for polling fallback
      progressTimerRef.current = setInterval(() => {
        setProgress((prev) => Math.min(prev + 0.5, 98));
      }, 500);
    }

    const poll = async () => {
      attempts++;

      try {
        const status = await analysisService.getAnalysisStatus(sessionId);

        if (status.status === "finalized" || status.status === "draft") {
          // Fetch complete analysis to check content
          const analysisResult = await analysisService.getAiDraft(sessionId);

          if (
            analysisResult.status.status === "finalized" ||
            analysisResult.soap.subjective ||
            analysisResult.soap.assessment
          ) {
            stopSimulatedProgress();
            setResult(analysisResult);
            setStage("complete");
            setProgress(100);
            return;
          }
          // If draft but empty, continue polling (rare case)
        } else if (status.status === "error") {
          stopSimulatedProgress();
          setStage("error");
          setErrorMessage("AI analysis failed. Please try again.");
          setShowErrorToast(true);
          return;
        }

        // Continue polling if not complete
        if (attempts < MAX_POLL_ATTEMPTS) {
          setTimeout(poll, POLL_INTERVAL);
        } else {
          stopSimulatedProgress();
          setStage("error");
          setErrorMessage(
            "Analysis is taking too long. Please try again later.",
          );
          setShowErrorToast(true);
        }
      } catch {
        // If status endpoint fails, try to get the full analysis
        try {
          const analysisResult = await analysisService.getAiDraft(sessionId);
          if (
            analysisResult.soap.subjective ||
            analysisResult.soap.assessment
          ) {
            stopSimulatedProgress();
            setResult(analysisResult);
            setStage("complete");
            setProgress(100);
            return;
          }
        } catch {
          // Continue polling
        }

        if (attempts < MAX_POLL_ATTEMPTS) {
          setTimeout(poll, POLL_INTERVAL);
        } else {
          stopSimulatedProgress();
          setStage("error");
          setErrorMessage("Failed to check analysis status.");
          setShowErrorToast(true);
        }
      }
    };

    poll();
  }, [sessionId, stopSimulatedProgress]);

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    triggerAnalysis();
  }, [triggerAnalysis]);

  const handleProceed = useCallback(() => {
    router.push(`/sessions/${sessionId}/review`);
  }, [router, sessionId]);

  // Processing stages for UI
  const processingStages = [
    "Extracting medical terms...",
    "Identifying symptoms...",
    "Generating SOAP notes...",
    "Analyzing diagnosis patterns...",
    "Suggesting ICD-10 codes...",
    "Finalizing analysis...",
  ];

  const currentProcessingStage = Math.min(
    Math.floor(progress / (100 / processingStages.length)),
    processingStages.length - 1,
  );

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

      {/* Triggering / Processing State */}
      {(stage === "triggering" ||
        stage === "processing" ||
        stage === "idle") && (
        <div className="text-center space-y-6 max-w-md w-full">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-secondary/20 rounded-full animate-ping" />
            <div className="relative bg-white border-4 border-secondary/50 rounded-full w-24 h-24 flex items-center justify-center">
              <Bot className="w-10 h-10 text-primary animate-bounce" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold font-display text-text">
              {stage === "triggering"
                ? "Starting AI Analysis..."
                : "AI is Analyzing Conversation..."}
            </h2>
            <p className="text-gray-500 text-sm">
              {processingStages[currentProcessingStage]}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-linear-to-r from-primary to-secondary h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 font-medium">
            <span>{processingStages[currentProcessingStage]}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      {/* Complete State */}
      {stage === "complete" && result && (
        <div className="text-center space-y-6 max-w-md w-full animate-in zoom-in duration-300">
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center border-4 border-green-200">
            <CheckCircle2 className="w-12 h-12 text-cta" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-text">
              Analysis Complete
            </h2>
            <p className="text-gray-500">
              SOAP Notes and ICD-10 codes generated successfully.
            </p>
          </div>

          {/* Quick Summary */}
          <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase">
                Assessment
              </span>
              <p className="text-sm text-gray-700 line-clamp-2">
                {result.soap.assessment || "No assessment available"}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase">
                ICD-10 Codes
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {result.soap.icd10.length > 0 ? (
                  result.soap.icd10.slice(0, 3).map((code) => (
                    <span
                      key={code.code}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                    >
                      {code.code}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">
                    No codes suggested
                  </span>
                )}
                {result.soap.icd10.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{result.soap.icd10.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleProceed}
              className="flex items-center justify-center w-full gap-2 px-8 py-3 rounded-xl bg-cta text-white font-bold shadow-lg hover:bg-green-600 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              View Full Results
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {stage === "error" && (
        <div className="text-center space-y-6 max-w-md w-full animate-in fade-in duration-300">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center border-4 border-red-200">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-text">
              Analysis Failed
            </h2>
            <p className="text-gray-500">{errorMessage}</p>
            {retryCount > 0 && (
              <p className="text-xs text-gray-400">
                Retry attempt: {retryCount}/3
              </p>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push(`/sessions/${sessionId}/transcript`)}
              className="px-6 py-2 text-gray-600 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Transcript
            </button>
            {retryCount < 3 && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Analysis
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        message={errorMessage}
        isVisible={showErrorToast}
        onClose={() => setShowErrorToast(false)}
        type="error"
      />
    </div>
  );
}
