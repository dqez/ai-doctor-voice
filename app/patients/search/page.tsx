"use client";

import * as React from "react";
import { SearchBar } from "@/components/patient-intake/SearchBar";
import { PatientResultList } from "@/components/patient-intake/PatientResultList";
import { Patient } from "@/types/patient";
import { searchPatients, startSession } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/ui-toast";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function PatientSearchPage() {
  const router = useRouter();
  const [results, setResults] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [toast, setToast] = React.useState({ show: false, message: "" });

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await searchPatients(query);
      setResults(data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (patientId: string) => {
    try {
      setToast({ show: true, message: "Starting session..." });
      const sessionId = await startSession(patientId);
      // Simulate navigation to session page (using mock ID)
      // For now, staying on page or going to home as session page might not be fully ready in this task scope
      // But based on prompt "Include a clear CTA to 'Start examination session' after selecting a patient",
      // normally this would navigate to /sessions/[id] or similar.
      // I will navigate to a placeholder or assume /sessions/${sessionId} exists or just show success.

      router.push(`/sessions/${sessionId}/capture`); // Fixed route to match capture page
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-(--color-bg) py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[800px] mx-auto space-y-12">
        <div>
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="gap-2 pl-0 hover:bg-transparent hover:text-primary"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-display font-bold text-text tracking-tight">
            Patient Intake
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Search for an existing patient to start a new examination session,
            or create a new profile.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div className="text-center">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search by name or phone number..."
            />
          </div>

          <div className="min-h-[300px]">
            <PatientResultList
              results={results}
              loading={loading}
              hasSearched={hasSearched}
              onStartSession={handleStartSession}
            />
          </div>
        </div>
      </div>
      <Toast
        isVisible={toast.show}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
