"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Bot, Sparkles, CheckCircle2 } from "lucide-react";

export default function AnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const [stage, setStage] = useState<"analyzing" | "complete">("analyzing");
  const [progress, setProgress] = useState(0);

  // Simulate AI Processing
  useEffect(() => {
    if (stage === "analyzing") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStage("complete");
            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleProceed = () => {
    router.push(`/sessions/${params.id}/review`);
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
      {stage === "analyzing" && (
        <div className="text-center space-y-6 max-w-md w-full">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-secondary/20 rounded-full animate-ping" />
            <div className="relative bg-white border-4 border-secondary/50 rounded-full w-24 h-24 flex items-center justify-center">
              <Bot className="w-10 h-10 text-primary animate-bounce" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold font-display text-text">
              AI is Analyzing Conversation...
            </h2>
            <p className="text-gray-500 text-sm">
              Extracting medical terms, symptoms, and suggesting diagnosis.
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
            <span>Extracting SOAP...</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      {stage === "complete" && (
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

          <div className="pt-4">
            <button
              onClick={handleProceed}
              className="flex items-center justify-center w-full gap-2 px-8 py-3 rounded-xl bg-cta text-white font-bold shadow-lg hover:bg-green-600 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              View Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
