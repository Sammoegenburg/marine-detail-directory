// src/hooks/useLeadForm.ts
// Multi-step quote request form state management

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";

const leadFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email"),
  customerPhone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(/^\+?[\d\s\-().]+$/, "Invalid phone format"),
  boatSize: z.enum([
    "UNDER_20FT",
    "TWENTY_TO_30FT",
    "THIRTY_TO_40FT",
    "OVER_40FT",
  ]),
  boatType: z.string().optional(),
  boatYear: z.coerce.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  boatMake: z.string().optional(),
  zipCode: z.string().length(5, "Enter a 5-digit zip code").regex(/^\d+$/),
  serviceId: z.string().min(1, "Please select a service"),
  notes: z.string().max(500).optional(),
  preferredDate: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const FORM_STEPS = [
  { id: 1, title: "Your Boat", fields: ["boatSize", "boatType", "boatYear", "boatMake"] },
  { id: 2, title: "Service", fields: ["serviceId", "zipCode", "preferredDate", "notes"] },
  { id: 3, title: "Contact", fields: ["customerName", "customerEmail", "customerPhone"] },
] as const;

export function useLeadForm(defaultServiceId?: string) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LeadFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: standardSchemaResolver(leadFormSchema) as Resolver<LeadFormValues, any>,
    defaultValues: {
      serviceId: defaultServiceId ?? "",
      boatSize: undefined,
      zipCode: "",
    },
    mode: "onTouched",
  });

  const totalSteps = FORM_STEPS.length;

  function nextStep() {
    setStep((s) => Math.min(s + 1, totalSteps));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function onSubmit(data: LeadFormValues) {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to submit request");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    step,
    totalSteps,
    nextStep,
    prevStep,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSubmit: form.handleSubmit(onSubmit as any),
    isSubmitting,
    isSuccess,
    error,
  };
}
