import React from "react";
import { cn } from "@/lib/utils";

interface WaveformVisualizerProps {
  isRecording: boolean;
  className?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isRecording,
  className,
}) => {
  // Generate a random set of bar heights for visual interest
  const bars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    height: Math.max(20, Math.random() * 100),
    delay: Math.random() * 0.5,
  }));

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 h-32 w-full bg-gray-50 rounded-lg overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      {bars.map((bar) => (
        <div
          key={bar.id}
          className={cn(
            "w-2 bg-primary rounded-full transition-all duration-300 ease-in-out",
            isRecording ? "animate-pulse" : "h-1 opacity-20",
          )}
          style={{
            height: isRecording ? `${bar.height}%` : "4px",
            animationDuration: isRecording ? "0.8s" : "0s",
            animationDelay: `${bar.delay}s`,
            animationPlayState: isRecording ? "running" : "paused",
          }}
        />
      ))}
      {!isRecording && (
        <div className="absolute text-gray-400 font-medium">
          Ready to Record
        </div>
      )}
    </div>
  );
};
