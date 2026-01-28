"use client";

import React from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import { Stepper } from "@/components/session/Stepper";
import { StatusType } from "@/components/session/StatusBadge";

export default function SessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  // params might be a Promise in newer Next versions but useParams hook is safe in client components
  const params = useParams();
  const sessionId = params.id as string;

  // Determine current step based on URL
  const getStepInfo = () => {
    if (pathname.includes("/capture")) return 1;
    if (pathname.includes("/transcript")) return 2;
    if (pathname.includes("/analysis")) return 3;
    if (pathname.includes("/review")) return 4;
    return 1;
  };

  const currentStep = getStepInfo();

  // Mock status logic - in a real app this would come from a backend/context
  const getStepStatus = (stepId: number): StatusType => {
    if (stepId < currentStep) return "done";
    if (stepId === currentStep) return "active";
    return "pending";
  };

  const steps = [
    { id: 1, label: "Capture Audio", status: getStepStatus(1) },
    { id: 2, label: "Transcript", status: getStepStatus(2) },
    { id: 3, label: "AI Analysis", status: getStepStatus(3) },
    { id: 4, label: "Doctor Review", status: getStepStatus(4) },
  ];

  const handleStepClick = (stepId: number) => {
    // Optional: Allow navigation if the step is done or active (simple guard)
    if (stepId <= currentStep) {
      const paths = ["", "capture", "transcript", "analysis", "review"];
      router.push(`/sessions/${sessionId}/${paths[stepId]}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Top Navigation Bar - reusable header could go here */}
      <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-display text-text">
              Session #{sessionId}
            </h1>
            <p className="text-xs text-gray-500 font-body">
              Patient Visit • Oct 24, 2026
            </p>
          </div>
          {/* Simple Save/Exit placeholder */}
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm font-medium text-gray-500 hover:text-text transition-colors"
          >
            Save & Exit
          </button>
        </div>
      </div>

      {/* Stepper Container */}
      <div className="w-full max-w-3xl mx-auto mt-6 mb-2 px-4">
        <Stepper
          currentStep={currentStep}
          steps={steps}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Page Content */}
      <main className="w-full max-w-5xl mx-auto px-4 py-6 flex-1">
        {children}
      </main>
    </div>
  );
}
