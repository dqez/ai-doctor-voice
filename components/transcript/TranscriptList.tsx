"use client";

import React, { useState } from "react";
import { TranscriptSegment, updateTranscriptSegment } from "@/lib/mock-data";
import { TranscriptItem } from "./TranscriptItem";

interface TranscriptListProps {
  initialSegments: TranscriptSegment[];
  sessionId: string;
}

export const TranscriptList: React.FC<TranscriptListProps> = ({
  initialSegments,
  sessionId,
}) => {
  const [segments, setSegments] =
    useState<TranscriptSegment[]>(initialSegments);

  const handleUpdateSegment = async (id: string, newText: string) => {
    // Optimistic update
    setSegments((prev) =>
      prev.map((seg) =>
        seg.id === id ? { ...seg, text: newText, confidence: 1.0 } : seg,
      ),
    );

    try {
      await updateTranscriptSegment(sessionId, id, newText);
    } catch (error) {
      console.error("Failed to update transcript", error);
      // Revert on error (could use a previous state ref usually, or fetch again)
    }
  };

  return (
    <div className="space-y-4">
      {segments.map((segment) => (
        <TranscriptItem
          key={segment.id}
          segment={segment}
          onSave={handleUpdateSegment}
        />
      ))}

      {segments.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No transcript data available.
        </div>
      )}
    </div>
  );
};
