// Mock data and functions for AI Analysis
export interface SoapData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icd10: { code: string; description: string }[];
}

const MOCK_SOAP_DATA: SoapData = {
  subjective:
    "Patient presents with a 3-day history of sore throat, low-grade fever, and mild cough. Reports pain is worse when swallowing. No difficulty breathing.",
  objective:
    "Temp: 37.8°C, BP: 120/80, HR: 88. Pharynx is erythematous with mild tonsillar exudate. Lungs clear to auscultation. No cervical lymphadenopathy.",
  assessment:
    "Likely viral pharyngitis. Differential diagnosis includes streptococcal pharyngitis, strictly based on clinical presentation.",
  plan: "1. Supportive care: hydration, rest, salt water gargles.\n2. Acetaminophen for fever/pain.\n3. Return if symptoms worsen or persist > 5 days.",
  icd10: [
    { code: "J02.9", description: "Acute pharyngitis, unspecified" },
    { code: "R50.9", description: "Fever, unspecified" },
  ],
};

export const getAiDraft = async (sessionId: string): Promise<SoapData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...MOCK_SOAP_DATA });
    }, 1500); // Simulate network delay
  });
};

export const triggerFinalAnalysis = async (
  sessionId: string,
): Promise<SoapData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return slightly richer data to simulate "Final Analysis"
      resolve({
        ...MOCK_SOAP_DATA,
        assessment:
          "Viral pharyngitis. rapid strep test optional but likely negative given lack of exudates and adenopathy. Low probability of bacterial infection.",
        icd10: [
          { code: "J02.9", description: "Acute pharyngitis, unspecified" },
          { code: "R50.9", description: "Fever, unspecified" },
          { code: "J00", description: "Acute nasopharyngitis [common cold]" }, // Added suggestion
        ],
      });
    }, 2000);
  });
};

export const saveDraft = async (
  sessionId: string,
  data: SoapData,
): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 800);
  });
};

export const proceedToReview = async (sessionId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1000);
  });
};
