"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { finalizeTranscript } from "@/lib/mock-data";
import { ChevronRight } from "lucide-react";

interface FinalizeButtonProps {
  sessionId: string;
}

export const FinalizeButton: React.FC<FinalizeButtonProps> = ({
  sessionId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFinalize = async () => {
    setIsLoading(true);
    try {
      await finalizeTranscript(sessionId);
      // Navigate to next step
      router.push(`/sessions/${sessionId}/analysis`);
    } catch (error) {
      console.error("Failed to finalize:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFinalize}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 bg-cta hover:bg-cta/90 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-cta/20 disabled:opacity-70 disabled:cursor-not-allowed"
      aria-label="Finalize transcript and proceed to analysis"
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          <span>Finalize & Analyze</span>
          <ChevronRight size={18} />
        </>
      )}
    </button>
  );
};
