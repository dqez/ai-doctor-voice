import React from "react";
import { Bot, UserPen, AlertCircle } from "lucide-react";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export type SoapStatus = "ai" | "doctorEdited" | "empty";

interface SoapSectionCardProps {
  title: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  status: SoapStatus;
  placeholder?: string;
  className?: string;
}

export const SoapSectionCard: React.FC<SoapSectionCardProps> = ({
  title,
  description,
  value,
  onChange,
  status,
  placeholder = "Không có thông tin bệnh nhân",
  className,
}) => {
  const isAi = status === "ai";
  const isEdited = status === "doctorEdited";
  const isEmpty = status === "empty";

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold font-display text-text">{title}</h3>
          {description && (
            <p className="text-xs text-gray-500 font-body">{description}</p>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isAi && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-primary text-xs font-semibold border border-secondary/20">
              <Bot className="w-3.5 h-3.5" />
              AI Suggested
            </span>
          )}
          {isEdited && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cta/10 text-cta text-xs font-semibold border border-cta/20">
              <UserPen className="w-3.5 h-3.5" />
              Doctor Edited
            </span>
          )}
          {isEmpty && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold border border-gray-200">
              <AlertCircle className="w-3.5 h-3.5" />
              Empty
            </span>
          )}
        </div>
      </div>

      <textarea
        className={cn(
          "w-full min-h-[120px] p-4 rounded-lg bg-gray-50 border transition-all duration-200 font-body text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/20",
          isEmpty
            ? "border-dashed border-gray-300 text-gray-400 italic"
            : "border-gray-200 text-text focus:border-primary",
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};
