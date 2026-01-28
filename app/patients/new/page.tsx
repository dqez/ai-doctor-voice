"use client";

import * as React from "react";
import { CreatePatientForm } from "@/components/patient-intake/CreatePatientForm";
import { CreatePatientInput } from "@/types/patient";
import { createPatient as createPatientMock } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/ui-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function CreatePatientPage() {
  const router = useRouter();
  const [toast, setToast] = React.useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const handleSubmit = async (data: CreatePatientInput) => {
    try {
      await createPatientMock(data);
      setToast({
        show: true,
        message: "Patient profile created successfully!",
        type: "success",
      });

      // Delay to show toast then redirect to search or start session
      setTimeout(() => {
        router.push("/patients/search");
      }, 1500);
    } catch (error) {
      setToast({
        show: true,
        message: "Failed to create profile. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[800px] mx-auto space-y-8">
        <div>
          <Link href="/patients/search">
            <Button
              variant="ghost"
              className="gap-2 pl-0 hover:bg-transparent hover:text-primary"
            >
              <ArrowLeft size={20} />
              Back to Patient Search
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold text-text">
            New Patient Profile
          </h1>
          <p className="text-gray-600">
            Create a new record for a first-time patient.
          </p>
        </div>

        <CreatePatientForm onSubmit={handleSubmit} />
      </div>

      <Toast
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
