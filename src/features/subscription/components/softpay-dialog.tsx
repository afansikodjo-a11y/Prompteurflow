"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SOFTPAY_OPERATOR_OPTIONS, type SoftpayOperatorOptionId } from "../constants/softpay-operators";
import { usePollSubscriptionStatus } from "../hooks/use-poll-subscription-status";
import { startSoftpayCheckout } from "../lib/softpay-client";
import type { BillingPeriod, Plan, PlanId } from "../types";

type Step = "form" | "submitting" | "waiting";

interface SoftpayDialogProps {
  /** Plan concerné, ou `null` pour fermer le dialogue. */
  plan: Plan | null;
  billingPeriod: BillingPeriod;
  onClose: () => void;
  /** "Payer par un autre moyen" — bascule sur le checkout hébergé classique. */
  onFallbackToHosted: (plan: Plan) => void;
}

/**
 * Paiement Mobile Money collecté sur place (PayDunya SoftPay) — jamais de
 * redirection tant que l'utilisateur n'a pas choisi cette option lui-même
 * ("Payer par un autre moyen"). La facture PayDunya reste valide même si le
 * softpay échoue (mauvais numéro...) : on reste sur le formulaire, jamais
 * besoin de repayer une facture pour réessayer.
 */
export function SoftpayDialog({ plan, billingPeriod, onClose, onFallbackToHosted }: SoftpayDialogProps) {
  const [operator, setOperator] = React.useState<SoftpayOperatorOptionId>(SOFTPAY_OPERATOR_OPTIONS[0].id);
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [step, setStep] = React.useState<Step>("form");
  const [error, setError] = React.useState<string | null>(null);
  const pollStatus = usePollSubscriptionStatus(step === "waiting");

  React.useEffect(() => {
    if (plan) {
      setStep("form");
      setError(null);
      setFullName("");
      setPhone("");
    }
  }, [plan]);

  React.useEffect(() => {
    if (pollStatus === "active") window.location.href = "/studio";
  }, [pollStatus]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!plan) return;
    setStep("submitting");
    setError(null);
    const result = await startSoftpayCheckout({
      planId: plan.id as Exclude<PlanId, "standard">,
      billingPeriod,
      operator,
      fullName,
      phone: phone.replace(/\D/g, ""),
    });
    if (!result.ok) {
      setError(result.error);
      setStep("form");
      return;
    }
    if (result.status === "redirect") {
      window.location.href = result.url;
      return;
    }
    setStep("waiting");
  };

  const selectedOption = SOFTPAY_OPERATOR_OPTIONS.find((option) => option.id === operator);

  return (
    <Dialog open={plan !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {plan && (
          <>
            <DialogHeader>
              <DialogTitle>Payer avec Mobile Money</DialogTitle>
              <DialogDescription>{plan.name} — paiement direct depuis cette page, sans redirection.</DialogDescription>
            </DialogHeader>

            {step === "waiting" ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="border-muted-foreground/30 border-t-foreground size-8 animate-spin rounded-full border-2" />
                <p className="text-sm">Validez le paiement sur votre téléphone…</p>
                {pollStatus === "timeout" && (
                  <p className="text-muted-foreground text-xs">
                    Ça prend plus de temps que prévu — vous pouvez fermer cette fenêtre, votre abonnement s&apos;activera
                    dès validation.
                  </p>
                )}
                {pollStatus === "failed" && <p className="text-destructive text-xs">Le paiement a échoué ou a été annulé.</p>}
              </div>
            ) : (
              <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
                <div className="flex gap-2">
                  {SOFTPAY_OPERATOR_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setOperator(option.id)}
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                        operator === option.id ? "border-brand bg-brand/10" : "border-white/15 hover:bg-white/5",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="softpay-name">Nom et prénom</Label>
                  <Input id="softpay-name" required value={fullName} onChange={(event) => setFullName(event.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="softpay-phone">Numéro de téléphone</Label>
                  <Input
                    id="softpay-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder={`Ex. ${selectedOption?.dialCode}90000000`}
                  />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button type="submit" disabled={step === "submitting"}>
                  {step === "submitting" ? "Envoi…" : "Payer"}
                </Button>
                <button
                  type="button"
                  onClick={() => onFallbackToHosted(plan)}
                  className="text-muted-foreground text-center text-xs underline"
                >
                  Payer par un autre moyen (carte, etc.)
                </button>
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
