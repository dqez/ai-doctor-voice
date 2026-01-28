"use client";

import * as React from "react";
import { PatientCard } from "./PatientCard";
import { Patient } from "@/types/patient";
import { SearchX, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface PatientResultListProps {
  results: Patient[];
  loading?: boolean;
  hasSearched: boolean;
  onStartSession: (patientId: string) => void;
}

export function PatientResultList({
  results,
  loading,
  hasSearched,
  onStartSession,
}: PatientResultListProps) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (hasSearched && results.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-6">
          <SearchX className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-text mb-2">
          No patients found
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-8">
          We couldn&apos;t find any patient matching your search. Try checking
          the phone number or spelling.
        </p>
        <Link href="/patients/new">
          <Button variant="primary" className="gap-2">
            <UserPlus size={18} />
            Create new patient profile
          </Button>
        </Link>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Start typing to search for a patient...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="text-sm font-medium text-gray-500 mb-2">
        Found {results.length} result{results.length !== 1 ? "s" : ""}
      </div>
      {results.map((patient) => (
        <PatientCard
          key={patient.id}
          patient={patient}
          onStartSession={onStartSession}
        />
      ))}
    </div>
  );
}
