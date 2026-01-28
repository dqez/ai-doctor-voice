export interface SoapData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icd10: { code: string; description: string }[];
}

export interface AnalysisStatus {
  lastUpdated: string;
  status: "draft" | "finalized";
}

// Mock Data
const MOCK_SOAP: SoapData = {
  subjective:
    "Patient presented with a 3-day history of sore throat and mild fever (38°C). Reports dry cough, worse at night. No difficulty breathing. Denies recent travel or contact with sick individuals.",
  objective:
    "Temp 38.0°C, BP 120/80, HR 88, RR 18, SpO2 98% room air. Pharynx erythematous with no exudates. Lungs clear to auscultation bilaterally. No lymphadenopathy.",
  assessment: "1. Acute Pharyngitis - likely viral\n2. Fever",
  plan: "- Supportive care: Rest, hydration\n- Acetaminophen 500mg q6h prn fever/pain\n- Salt water gargles\n- Return to clinic if symptoms worsen or fever persists > 3 days",
  icd10: [
    { code: "J02.9", description: "Acute pharyngitis, unspecified" },
    { code: "R50.9", description: "Fever, unspecified" },
  ],
};

export const analysisService = {
  getAiDraft: async (
    sessionId: string,
  ): Promise<{ soap: SoapData; status: AnalysisStatus }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      soap: MOCK_SOAP,
      status: {
        lastUpdated: new Date().toISOString(),
        status: "draft",
      },
    };
  },

  triggerFinalAnalysis: async (sessionId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log(`[Analysis] Triggered final analysis for session ${sessionId}`);
  },

  saveDraft: async (sessionId: string, data: SoapData): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(`[Analysis] Saved draft for session ${sessionId}`, data);
  },

  proceedToReview: async (sessionId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(`[Analysis] Proceeding to review for session ${sessionId}`);
  },
};
