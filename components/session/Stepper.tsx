import React from "react";
import { Check } from "lucide-react";
import { StatusType } from "./StatusBadge";
import { cn } from "@/lib/utils";

interface StepperProps {
  currentStep: number;
  steps: {
    id: number;
    label: string;
    status: StatusType;
  }[];
  onStepClick?: (stepId: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ steps, onStepClick }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2" />

        {steps.map((step) => {
          const isCompleted = step.status === "done";
          const isActive = step.status === "active";
          const isError = step.status === "error";

          return (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center gap-2 bg-background px-2 cursor-pointer transition-all duration-300",
                isActive ? "scale-105" : "opacity-80 hover:opacity-100",
              )}
              onClick={() => onStepClick && onStepClick(step.id)}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                  isCompleted
                    ? "bg-cta border-cta text-white"
                    : isActive
                      ? "bg-background border-primary text-primary shadow-[0_0_0_4px_rgba(8,145,178,0.1)]"
                      : isError
                        ? "bg-red-50 border-red-500 text-red-500"
                        : "bg-gray-50 border-gray-300 text-gray-400",
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold font-display">
                    {step.id}
                  </span>
                )}
              </div>

              <span
                className={cn(
                  "text-xs font-semibold whitespace-nowrap font-body",
                  isActive ? "text-primary" : "text-gray-500",
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
