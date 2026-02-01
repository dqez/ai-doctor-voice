"use client";

import React, { useState, useEffect, useRef } from "react";
import { Square, RefreshCw, CheckCircle, Loader2, Mic } from "lucide-react";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { cn } from "@/lib/utils";

type RecordingState =
  | "idle"
  | "recording"
  | "paused"
  | "processing"
  | "completed"
  | "error";

interface RecorderPanelProps {
  onComplete: () => void;
  onReset?: () => void;
  className?: string;
}

export const RecorderPanel: React.FC<RecorderPanelProps> = ({
  onComplete,
  onReset,
  className,
}) => {
  const [status, setStatus] = useState<RecordingState>("idle");
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setStatus("recording");
  };

  const handleStop = () => {
    setStatus("processing");
    // Simulate processing delay
    setTimeout(() => {
      setStatus("completed");
      onComplete();
    }, 1500);
  };

  const handleRedo = () => {
    if (confirm("Recording will be lost. Are you sure?")) {
      setStatus("idle");
      setDuration(0);
      if (onReset) onReset();
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-6 w-full max-w-2xl mx-auto", className)}
    >
      {/* Visualizer Area */}
      <div className="relative">
        <WaveformVisualizer
          isRecording={status === "recording"}
          className="border border-gray-200"
        />

        {/* Status Overlay */}
        {status === "processing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm font-medium text-gray-600">
                Processing Audio...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col items-center gap-4">
        {/* Timer Display */}
        <div className="text-4xl font-mono font-bold text-gray-800 tracking-wider">
          {formatTime(duration)}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          {status === "idle" && (
            <button
              onClick={handleStart}
              className="group flex items-center gap-2 px-8 py-4 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full shadow-lg hover:shadow-red-200 transition-all duration-300 ease-out transform hover:scale-105"
            >
              <Mic className="w-6 h-6" />
              <span className="font-semibold text-lg">Start Recording</span>
            </button>
          )}

          {status === "recording" && (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-900 text-white rounded-full shadow-lg transition-all transform hover:scale-105"
            >
              <Square className="w-6 h-6 fill-current" />
              <span className="font-semibold text-lg">Stop Capture</span>
            </button>
          )}

          {status === "completed" && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Audio Captured</span>
              </div>

              <button
                onClick={handleRedo}
                className="flex items-center gap-2 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Discard and record again"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Redo</span>
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-400">
          {status === "idle"
            ? "Click start to begin capturing the session."
            : status === "recording"
              ? "Listening..."
              : status === "completed"
                ? "Proceed to next step or record again."
                : ""}
        </p>
      </div>
    </div>
  );
};
