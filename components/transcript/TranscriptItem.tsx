"use client";

import React, { useState, useRef, useEffect } from "react";
import { TranscriptSegment } from "@/lib/mock-data";
import { Pencil, Save, X, AlertTriangle } from "lucide-react";

interface TranscriptItemProps {
  segment: TranscriptSegment;
  onSave: (id: string, newText: string) => Promise<void>;
}

export const TranscriptItem: React.FC<TranscriptItemProps> = ({
  segment,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(segment.text);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Format timestamp (ms -> MM:SS)
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSave = async () => {
    if (text.trim() === segment.text) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(segment.id, text);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save segment", error);
      // Ideally show toast error here
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setText(segment.text);
    setIsEditing(false);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const isLowConfidence = segment.confidence < 0.8;

  return (
    <div
      className={`group p-4 border rounded-lg transition-all duration-200 ${
        isEditing
          ? "border-primary ring-1 ring-primary/20 bg-primary/5"
          : isLowConfidence
            ? "border-orange-200 bg-orange-50 hover:bg-orange-100/50"
            : "border-gray-100 hover:border-gray-300 hover:shadow-sm bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="shrink-0 w-24 pt-1">
          <div
            className={`text-sm font-bold ${
              segment.speaker === "Doctor"
                ? "text-primary"
                : "text-secondary-foreground"
            }`}
          >
            {segment.speaker}
          </div>
          <div className="text-xs text-gray-400 font-mono mt-1">
            {formatTime(segment.startMs)}
          </div>
          {isLowConfidence && !isEditing && (
            <div
              className="flex items-center gap-1 mt-2 text-xs text-orange-600 font-medium"
              title="Low confidence"
            >
              <AlertTriangle size={12} />
              <span>Check</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="grow min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onBlur={handleSave} // save on blur as requested
                className="w-full p-2 text-base text-gray-800 bg-white border border-gray-200 rounded-md focus:border-primary focus:ring-0 resize-none outline-none font-body"
                rows={1}
                disabled={isSaving}
              />
              <div className="flex items-center gap-2">
                <button
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur so click registers
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary/90 transition-colors"
                >
                  {isSaving ? (
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Save
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md hover:bg-gray-200 transition-colors"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p
              onClick={() => setIsEditing(true)}
              className={`text-base leading-relaxed cursor-text whitespace-pre-wrap font-body ${
                isLowConfidence ? "text-orange-900" : "text-gray-700"
              }`}
            >
              {text}
            </p>
          )}
        </div>

        {/* Actions (visible on hover or when focusing inside) */}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-all"
            aria-label="Edit segment"
          >
            <Pencil size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
