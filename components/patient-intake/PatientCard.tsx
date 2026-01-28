"use client";

import * as React from "react";
import { User, Calendar, Phone } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Patient } from "@/types/patient";

interface PatientCardProps {
  patient: Patient;
  onStartSession: (patientId: string) => void;
}

export function PatientCard({ patient, onStartSession }: PatientCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User size={24} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-text">
                {patient.name}
              </h3>
              <div className="mt-1 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar size={14} />
                  <span>DOB: {patient.dob}</span>
                  <span className="text-gray-300">|</span>
                  <span>{patient.gender}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone size={14} />
                  <span>{patient.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50/50 p-4 flex justify-end">
        <Button
          variant="primary"
          onClick={() => onStartSession(patient.id)}
          className="w-full sm:w-auto"
        >
          Start examination session
        </Button>
      </CardFooter>
    </Card>
  );
}
