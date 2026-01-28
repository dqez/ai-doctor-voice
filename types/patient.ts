export interface Patient {
  id: string;
  name: string;
  dob: string; // YYYY-MM-DD
  gender: "Male" | "Female" | "Other";
  phone: string;
  lastVisit?: string;
}

export interface CreatePatientInput {
  name: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  phone: string;
}
