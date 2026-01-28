import React from "react";
import { cn } from "../../lib/utils";
import { Check, Loader2, AlertCircle, Circle } from "lucide-react";

export type StatusType = "pending" | "active" | "done" | "error";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  showLabel?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showLabel = true,
}) => {
  const styles = {
    pending: "bg-gray-100 text-gray-500 border-gray-200",
    active: "bg-secondary/10 text-primary border-primary animate-pulse",
    done: "bg-green-100 text-cta border-cta", // cta is green #22C55E
    error: "bg-red-50 text-red-600 border-red-200",
  };

  const icons = {
    pending: <Circle className="w-4 h-4" />,
    active: <Loader2 className="w-4 h-4 animate-spin" />,
    done: <Check className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />,
  };

  const labels = {
    pending: "Pending",
    active: "In Progress",
    done: "Completed",
    error: "Error",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium transition-colors duration-200",
        styles[status],
        className,
      )}
    >
      {icons[status]}
      {showLabel && <span>{labels[status]}</span>}
    </div>
  );
};
