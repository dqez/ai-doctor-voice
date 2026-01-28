"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { CreatePatientInput } from "@/types/patient";

interface CreatePatientFormProps {
  onSubmit: (data: CreatePatientInput) => Promise<void>;
}

export function CreatePatientForm({ onSubmit }: CreatePatientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<CreatePatientInput>({
    name: "",
    dob: "",
    gender: "Male",
    phone: "",
  });
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof CreatePatientInput, string>>
  >({});

  const validateField = (name: keyof CreatePatientInput, value: string) => {
    if (!value.trim()) {
      return "This field is required";
    }
    return "";
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const error = validateField(name as keyof CreatePatientInput, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreatePatientInput]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all
    const newErrors: Partial<Record<keyof CreatePatientInput, string>> = {};
    let hasError = false;
    (Object.keys(formData) as Array<keyof CreatePatientInput>).forEach(
      (key) => {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
          hasError = true;
        }
      },
    );

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Create Patient Profile</CardTitle>
        <CardDescription>
          Enter the patient&apos;s basic information to start a new record.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <Input
            label="Full Name"
            name="name"
            placeholder="e.g. Nguyen Van A"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
            disabled={loading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Date of Birth"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.dob}
              disabled={loading}
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-text mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="0912..."
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phone}
            disabled={loading}
          />
        </CardContent>
        <CardFooter className="flex justify-between border-t border-gray-50 pt-6">
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Creating..." : "Create Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
