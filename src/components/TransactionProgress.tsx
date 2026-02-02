import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Circle, Loader2 } from "lucide-react";

type StepStatus = "pending" | "loading" | "complete";

interface TransactionStep {
  id: string;
  label: string;
  status: StepStatus;
}

interface TransactionProgressProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: TransactionStep[];
  isComplete: boolean;
  sharesReceived?: string;
}

export function TransactionProgress({
  open,
  onOpenChange,
  steps,
  isComplete,
  sharesReceived,
}: TransactionProgressProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            {isComplete ? "Deposit completed." : "Processing deposit..."}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {step.status === "complete" ? (
                    <div className="h-5 w-5 rounded-full bg-success flex items-center justify-center">
                      <Check className="h-3 w-3 text-success-foreground" />
                    </div>
                  ) : step.status === "loading" ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40" />
                  )}
                </div>
                <span
                  className={`text-sm ${
                    step.status === "complete"
                      ? "text-foreground"
                      : step.status === "loading"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {isComplete && (
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vault shares received</span>
                <span className="font-medium tabular-nums">{sharesReceived}</span>
              </div>
              <button className="text-sm text-primary hover:underline">
                View transaction details →
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
