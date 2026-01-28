"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ManualNotesPanelProps {
  initialContent?: string;
  onContentChange: (content: string) => void;
  className?: string;
}

export const ManualNotesPanel: React.FC<ManualNotesPanelProps> = ({
  initialContent = "",
  onContentChange,
  className,
}) => {
  const [content, setContent] = useState(initialContent);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setContent(newVal);
    onContentChange(newVal);
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <label
            htmlFor="notes-area"
            className="text-sm font-semibold text-gray-700"
          >
            Manual Session Notes
          </label>
          <span className="text-xs text-gray-500 italic">
            {content.length > 0 ? "Changes saved locally" : "Start typing..."}
          </span>
        </div>
        <textarea
          id="notes-area"
          value={content}
          onChange={handleChange}
          placeholder="Type your examination notes here... (e.g., Patient presents with mild fever...)"
          className="w-full h-96 p-6 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/20 text-base leading-relaxed text-gray-800 placeholder:text-gray-300"
          spellCheck={false}
        />
      </div>
      <p className="mt-2 text-center text-sm text-gray-400">
        These notes will be used to generate the clinical documentation.
      </p>
    </div>
  );
};
