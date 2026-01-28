"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowRight, Edit2, FileText } from "lucide-react";
import { Toast } from "@/components/ui-toast";

export default function TranscriptPage() {
  const router = useRouter();
  const params = useParams();
  const [transcript, setTranscript] = useState<string>(
    "Patient reported persistent dry cough for the last 3 days. No fever recorded today but felt warm yesterday. Describes throat pain as 'scratchy'. Appetite is normal. No known allergies.\n\nDoctor: Let's check your lungs.\nPatient: Okay.\nDoctor: Breathe in... deep breath. Good. Lungs sound clear. It's likely a viral upper respiratory infection.",
  );
  const [showToast, setShowToast] = useState(false);

  const handleConfirm = () => {
    setShowToast(true);
    setTimeout(() => {
      // Navigate to Analysis
      router.push(`/sessions/${params.id}/analysis`);
    }, 1500);
  };

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
            Review the automated transcription before AI Analysis.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <Edit2 className="w-4 h-4" />
            Edit Mode
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition-all hover:scale-105"
          >
            Confirm & Analyze
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-2">
          <span className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <FileText className="w-3 h-3" />
            Raw Text
          </span>
          <span className="text-xs text-gray-400">Confidence: 98%</span>
        </div>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          className="w-full h-[350px] resize-none outline-none text-base leading-relaxed text-gray-700 font-body p-2 focus:bg-gray-50 rounded-lg transition-colors"
        />
      </div>

      <Toast
        message="Transcript confirmed! Starting AI Analysis..."
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
