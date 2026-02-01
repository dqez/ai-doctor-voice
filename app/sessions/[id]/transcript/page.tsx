"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowRight,
  Edit2,
  FileText,
  Check,
  X,
  AlertCircle,
  Loader2,
  User,
  Stethoscope,
} from "lucide-react";
import { Toast } from "@/components/ui-toast";
import { audioService, AudioServiceError } from "@/services/audioService";
import { TranscriptSegment } from "@/lib/mock-data";

type PageState = "loading" | "ready" | "error" | "submitting";

interface EditingSegment {
  id: string;
  text: string;
}

export default function TranscriptPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  // Page state
  const [pageState, setPageState] = useState<PageState>("loading");
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Editing state
  const [editingSegment, setEditingSegment] = useState<EditingSegment | null>(
    null,
  );
  const [isSavingSegment, setIsSavingSegment] = useState(false);

  // Toast states
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Fetch transcript on mount
  useEffect(() => {
    async function fetchTranscript() {
      try {
        setPageState("loading");
        const data = await audioService.getTranscript(sessionId);
        setSegments(data);
        setPageState("ready");
      } catch (error) {
        setPageState("error");
        if (error instanceof AudioServiceError) {
          setErrorMessage(`${error.message} (${error.code})`);
        } else {
          setErrorMessage("Failed to load transcript. Please try again.");
        }
      }
    }

    fetchTranscript();
  }, [sessionId]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600";
    if (confidence >= 0.75) return "text-yellow-600";
    return "text-red-600";
  };

  const handleEditStart = useCallback((segment: TranscriptSegment) => {
    setEditingSegment({ id: segment.id, text: segment.text });
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingSegment(null);
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editingSegment) return;

    setIsSavingSegment(true);
    try {
      const updatedSegment = await audioService.updateSegment(
        sessionId,
        editingSegment.id,
        editingSegment.text,
      );

      // Update local state
      setSegments((prev) =>
        prev.map((s) =>
          s.id === editingSegment.id ? { ...s, text: updatedSegment.text } : s,
        ),
      );

      setEditingSegment(null);
      setToastMessage("Segment updated successfully");
      setShowSuccessToast(true);
    } catch (error) {
      if (error instanceof AudioServiceError) {
        setToastMessage(error.message);
      } else {
        setToastMessage("Failed to save changes");
      }
      setShowErrorToast(true);
    } finally {
      setIsSavingSegment(false);
    }
  }, [editingSegment, sessionId]);

  const handleConfirmAndAnalyze = useCallback(async () => {
    setPageState("submitting");
    try {
      await audioService.finalizeTranscript(sessionId);
      setToastMessage("Transcript confirmed! Starting AI Analysis...");
      setShowSuccessToast(true);

      setTimeout(() => {
        router.push(`/sessions/${sessionId}/analysis`);
      }, 1500);
    } catch (error) {
      setPageState("ready");
      if (error instanceof AudioServiceError) {
        setToastMessage(error.message);
      } else {
        setToastMessage("Failed to finalize transcript");
      }
      setShowErrorToast(true);
    }
  }, [sessionId, router]);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // Loading state
  if (pageState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-gray-600">Loading transcript...</p>
      </div>
    );
  }

  // Error state
  if (pageState === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-xl font-bold text-gray-800">
          Failed to Load Transcript
        </h2>
        <p className="text-gray-600 text-center max-w-md">{errorMessage}</p>
        <button
          onClick={handleRetry}
          className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold font-display text-text">
            Review Transcript
          </h2>
          <p className="text-gray-500 text-sm">
            Review and edit the automated transcription before AI Analysis.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleConfirmAndAnalyze}
            disabled={pageState === "submitting"}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pageState === "submitting" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm & Analyze
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transcript Segments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <span className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <FileText className="w-3 h-3" />
            Transcript Segments ({segments.length})
          </span>
          <span className="text-xs text-gray-400">Click a segment to edit</span>
        </div>

        {segments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No transcript segments found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {segments.map((segment) => (
              <div
                key={segment.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  segment.confidence < 0.8 ? "bg-yellow-50/50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Speaker icon */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      segment.speaker === "Doctor"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {segment.speaker === "Doctor" ? (
                      <Stethoscope className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-700">
                        {segment.speaker}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(segment.startMs)}
                      </span>
                      <span
                        className={`text-xs ${getConfidenceColor(segment.confidence)}`}
                      >
                        {Math.round(segment.confidence * 100)}%
                      </span>
                      {segment.confidence < 0.8 && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                          Low confidence
                        </span>
                      )}
                    </div>

                    {/* Text or Edit input */}
                    {editingSegment?.id === segment.id ? (
                      <div className="flex items-start gap-2">
                        <textarea
                          value={editingSegment.text}
                          onChange={(e) =>
                            setEditingSegment((prev) =>
                              prev ? { ...prev, text: e.target.value } : null,
                            )
                          }
                          className="flex-1 p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 resize-none"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={handleEditSave}
                            disabled={isSavingSegment}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                            aria-label="Save changes"
                          >
                            {isSavingSegment ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={handleEditCancel}
                            disabled={isSavingSegment}
                            className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                            aria-label="Cancel edit"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditStart(segment)}
                        className="text-left w-full group"
                      >
                        <p className="text-gray-700 leading-relaxed group-hover:text-gray-900">
                          {segment.text}
                        </p>
                        <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1">
                          <Edit2 className="w-3 h-3" />
                          Click to edit
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <Toast
        message={toastMessage}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
      <Toast
        message={toastMessage}
        isVisible={showErrorToast}
        onClose={() => setShowErrorToast(false)}
        type="error"
      />
    </div>
  );
}
