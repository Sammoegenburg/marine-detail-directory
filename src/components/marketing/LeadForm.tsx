// src/components/marketing/LeadForm.tsx
// Multi-step "Get a Quote" form

"use client";

import { useLeadForm, FORM_STEPS } from "@/hooks/useLeadForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { BOAT_SIZE_LABELS } from "@/types";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type ServiceOption = { id: string; name: string };

type Props = {
  defaultServiceId?: string;
  services: ServiceOption[];
};

export function LeadForm({ defaultServiceId, services }: Props) {
  const {
    form,
    step,
    totalSteps,
    nextStep,
    prevStep,
    onSubmit,
    isSubmitting,
    isSuccess,
    error,
  } = useLeadForm(defaultServiceId);

  const { register, formState: { errors }, setValue, watch } = form;

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          Request Submitted!
        </h3>
        <p className="text-slate-500 text-sm">
          Local detailers in your area will reach out shortly. Check your email for confirmation.
        </p>
      </div>
    );
  }

  const progress = ((step - 1) / (totalSteps - 1)) * 100;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Step {step} of {totalSteps}: {FORM_STEPS[step - 1].title}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Boat Size *</Label>
            <Select onValueChange={(v) => setValue("boatSize", v as never)} value={watch("boatSize") ?? ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select boat size" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(BOAT_SIZE_LABELS) as [string, string][]).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.boatSize && <p className="text-xs text-red-500">{errors.boatSize.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Boat Type</Label>
            <Input placeholder="e.g. Sailboat, Pontoon, Yacht" {...register("boatType")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Year</Label>
              <Input type="number" placeholder="2020" {...register("boatYear")} />
            </div>
            <div className="space-y-2">
              <Label>Make/Brand</Label>
              <Input placeholder="e.g. Sea Ray" {...register("boatMake")} />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Service Needed *</Label>
            <Select onValueChange={(v) => setValue("serviceId", v ?? "")} value={watch("serviceId") ?? ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceId && <p className="text-xs text-red-500">{errors.serviceId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Zip Code *</Label>
            <Input placeholder="33101" maxLength={5} {...register("zipCode")} />
            {errors.zipCode && <p className="text-xs text-red-500">{errors.zipCode.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Preferred Date</Label>
            <Input type="date" {...register("preferredDate")} />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Any special requests or details about your boat..."
              className="resize-none"
              rows={3}
              {...register("notes")}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input placeholder="John Smith" {...register("customerName")} />
            {errors.customerName && <p className="text-xs text-red-500">{errors.customerName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" placeholder="john@example.com" {...register("customerEmail")} />
            {errors.customerEmail && <p className="text-xs text-red-500">{errors.customerEmail.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Phone *</Label>
            <Input type="tel" placeholder="(305) 555-0123" {...register("customerPhone")} />
            {errors.customerPhone && <p className="text-xs text-red-500">{errors.customerPhone.message}</p>}
          </div>

          <p className="text-xs text-slate-400">
            Your contact info is only shared with detailers you connect with. No spam.
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-md px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        {step > 1 && (
          <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        )}
        {step < totalSteps ? (
          <Button type="button" onClick={nextStep} className="flex-1 bg-blue-700 hover:bg-blue-800">
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-700 hover:bg-blue-800">
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
            ) : (
              "Get Free Quotes"
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
