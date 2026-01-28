"use client";

import React, { useState, useEffect } from "react";
import { Mic, Square, Save, RotateCcw } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Toast } from "@/components/ui-toast";

export default function CapturePage() {
  const router = useRouter();
  const params = useParams();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setAudioUrl(null); // Clear previous if any
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Mock saving an audio blob
    setAudioUrl("mock_audio_blob_url");
  };

  const handleReset = () => {
    setIsRecording(false);
    setDuration(0);
    setAudioUrl(null);
  };

  const handleSaveAndContinue = () => {
    setShowToast(true);
    // Simulate API delay
    setTimeout(() => {
      // In a real app, you'd upload audio here
      router.push(`/sessions/${params.id}/transcript`);
    }, 1500);
  };

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
        {/* Simple visual ring */}
        <div
          className={`w-64 h-64 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
            isRecording
              ? "border-red-500 bg-red-50 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="text-center">
            {isRecording && (
              <div className="animate-pulse text-red-500 font-bold mb-2">
                RECORDING
              </div>
            )}
            <div
              className={`text-5xl font-mono font-bold ${isRecording ? "text-red-600" : "text-gray-700"}`}
            >
              {formatTime(duration)}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {!isRecording && !audioUrl && (
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

        {isRecording && (
          <button
            onClick={handleStopRecording}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <Square className="w-6 h-6 fill-current" />
            </div>
            <span className="text-sm font-medium text-gray-600">Stop</span>
          </button>
        )}

        {/* Post-Recording Actions */}
        {audioUrl && !isRecording && (
          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Discard & Retake
            </button>
            <button
              onClick={handleSaveAndContinue}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-cta text-white font-bold shadow-lg hover:bg-green-600 transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" />
              Save & Analyze
            </button>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <Toast
        message="Audio saved! Generating transcript..."
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
