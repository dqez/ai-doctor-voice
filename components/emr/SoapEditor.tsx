"use client";

import React, { useState } from "react";
import { SoapSectionCard, SoapStatus } from "./SoapSectionCard";
import { Icd10Picker } from "./Icd10Picker";
import { Save } from "lucide-react";
import { Toast } from "@/components/ui-toast";

export interface SoapData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icd10: { code: string; description: string }[];
}

interface SoapEditorProps {
  initialData?: Partial<SoapData>;
  onSave?: (data: SoapData, isDraft: boolean) => void;
}

export const SoapEditor: React.FC<SoapEditorProps> = ({
  initialData,
  onSave,
}) => {
  const [data, setData] = useState<SoapData>({
    subjective: initialData?.subjective || "",
    objective: initialData?.objective || "",
    assessment: initialData?.assessment || "",
    plan: initialData?.plan || "",
    icd10: initialData?.icd10 || [],
  });

  const [statuses, setStatuses] = useState<
    Record<keyof Omit<SoapData, "icd10">, SoapStatus>
  >({
    subjective: initialData?.subjective ? "ai" : "empty",
    objective: initialData?.objective ? "ai" : "empty",
    assessment: initialData?.assessment ? "ai" : "empty",
    plan: initialData?.plan ? "ai" : "empty",
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Handle Input Changes and override status to 'doctorEdited'
  const handleChange = (
    field: keyof SoapData,
    value: string | { code: string; description: string }[],
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));

    // If field is text, update status
    if (typeof value === "string" && field in statuses) {
      setStatuses((prev) => ({
        ...prev,
        [field]: value.trim() === "" ? "empty" : "doctorEdited",
      }));
    }
  };

  const handleSave = (isDraft: boolean) => {
    // Basic validation
    if (!isDraft && (!data.subjective || !data.objective)) {
      setToast({
        show: true,
        message: "Please complete all required fields",
        type: "error",
      });
      return;
    }

    onSave?.(data, isDraft);
    setToast({
      show: true,
      message: isDraft
        ? "Draft saved successfully"
        : "Medical record finalized!",
      type: "success",
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-display text-text">
          Review & Edit Record
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => handleSave(true)}
            className="px-4 py-2 text-primary font-semibold hover:bg-primary/5 rounded-lg border border-transparent transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave(false)}
            className="flex items-center gap-2 px-6 py-2 bg-cta text-white font-bold rounded-lg hover:bg-green-600 transition-shadow shadow-md hover:shadow-lg"
          >
            <Save className="w-4 h-4" />
            Finalize
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <SoapSectionCard
          title="Subjective"
          description="Symptoms, patient complaints, history."
          value={data.subjective}
          onChange={(val) => handleChange("subjective", val)}
          status={statuses.subjective}
        />

        <SoapSectionCard
          title="Objective"
          description="Vital signs, physical exam findings, lab results."
          value={data.objective}
          onChange={(val) => handleChange("objective", val)}
          status={statuses.objective}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <SoapSectionCard
          title="Assessment"
          description="Diagnosis and analysis."
          value={data.assessment}
          onChange={(val) => handleChange("assessment", val)}
          status={statuses.assessment}
        />

        <SoapSectionCard
          title="Plan"
          description="Treatment, medications, follow-up."
          value={data.plan}
          onChange={(val) => handleChange("plan", val)}
          status={statuses.plan}
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <Icd10Picker
          selectedCodes={data.icd10}
          onSelectionChange={(codes) => handleChange("icd10", codes)}
        />
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type as "success" | "error"}
          isVisible={toast.show}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
};
