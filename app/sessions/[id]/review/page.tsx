"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SoapEditor, SoapData } from "@/components/emr/SoapEditor";

// Mock Initial AI Data
const MOCK_AI_DATA = {
  subjective:
    "Patient presented with a 3-day history of persistent dry cough. Reports feeling 'warm' yesterday but afebrile today. Complains of scratchy throat pain. Denies appetite loss. No known allergies (NKA).",
  objective:
    "Vitals: Temp 37.1 C, HR 78, BP 120/80, RR 18. General: Alert and oriented x3. HEENT: Pharynx slightly erythematous, no exudates. Lungs: Clear to auscultation bilaterally (CTAB), no wheezes or rales.",
  assessment: "1. Acute viral upper respiratory infection (URI).",
  plan: "1. Supportive care: rest, fluids.\n2. Acetaminophen 500mg PRN for pain/fever.\n3. Monitor symptoms, return if respiratory distress or high fever occurs (>38.5 C).\n4. No antibiotics indicated at this time (Likely viral).",
  icd10: [
    {
      code: "J06.9",
      description: "Acute upper respiratory infection, unspecified",
    },
    { code: "R05", description: "Cough" },
  ],
};

export default function ReviewPage() {
  const router = useRouter();

  const handleSave = (data: SoapData, isDraft: boolean) => {
    console.log("Saved Data:", data, "Draft:", isDraft);
    // In a real app, we would make an API call here.

    if (!isDraft) {
      // Show success feedback and redirect
      // Assuming we have a toast context or similar or just direct route
      // Adding a small delay for effect
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } else {
      // If draft, maybe just show toast
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>
      </div>
      <SoapEditor initialData={MOCK_AI_DATA} onSave={handleSave} />
    </div>
  );
}
