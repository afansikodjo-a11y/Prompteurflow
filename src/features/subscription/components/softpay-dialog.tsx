"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SOFTPAY_COUNTRIES } from "../constants/softpay-operators";
import { usePollSubscriptionStatus } from "../hooks/use-poll-subscription-status";
import { confirmWizallCheckout, startSoftpayCheckout } from "../lib/softpay-client";
import type { BillingPeriod, Plan, PlanId } from "../types";

type Step = "form" | "submitting" | "wizall-code" | "wizall-confirming" | "waiting";

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
 *
 * Wizall (Sénégal) est le seul opérateur du catalogue en deux étapes :
 * `startSoftpayCheckout` renvoie `wizall_pending`, on affiche un champ pour
 * le code reçu par SMS, puis `confirmWizallCheckout` — le crédit final vient
 * du webhook existant dans les deux cas, jamais de ces appels eux-mêmes.
 */
export function SoftpayDialog({ plan, billingPeriod, onClose, onFallbackToHosted }: SoftpayDialogProps) {
  const [countryCode, setCountryCode] = React.useState(SOFTPAY_COUNTRIES[0].code);
  const country = SOFTPAY_COUNTRIES.find((c) => c.code === countryCode) ?? SOFTPAY_COUNTRIES[0];
  const [operatorId, setOperatorId] = React.useState(country.operators[0].id);
  const operator = country.operators.find((o) => o.id === operatorId) ?? country.operators[0];

  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [wizallCode, setWizallCode] = React.useState("");
  const [wizallTransactionId, setWizallTransactionId] = React.useState<string | null>(null);

  const [step, setStep] = React.useState<Step>("form");
  const [error, setError] = React.useState<string | null>(null);
  const pollStatus = usePollSubscriptionStatus(step === "waiting");

  React.useEffect(() => {
    if (plan) {
      setStep("form");
      setError(null);
      setFullName("");
      setPhone("");
      setOtp("");
      setWizallCode("");
      setWizallTransactionId(null);
    }
  }, [plan]);

  // Le pays change ⇒ l'opérateur sélectionné doit rester valide pour ce pays.
  const handleCountryChange = (nextCode: string) => {
    setCountryCode(nextCode);
    const nextCountry = SOFTPAY_COUNTRIES.find((c) => c.code === nextCode);
    if (nextCountry) setOperatorId(nextCountry.operators[0].id);
  };

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
      operator: operatorId,
      fullName,
      phone: phone.replace(/\D/g, ""),
      otp: operator.requiresOtp ? otp : undefined,
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
    if (result.status === "wizall_pending") {
      setWizallTransactionId(result.transactionId);
      setStep("wizall-code");
      return;
    }
    setStep("waiting");
  };

  const handleWizallConfirm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!wizallTransactionId) return;
    setStep("wizall-confirming");
    setError(null);
    const result = await confirmWizallCheckout({
      transactionId: wizallTransactionId,
      phone: phone.replace(/\D/g, ""),
      authorizationCode: wizallCode,
    });
    if (!result.ok) {
      setError(result.error);
      setStep("wizall-code");
      return;
    }
    setStep("waiting");
  };

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
            ) : step === "wizall-code" || step === "wizall-confirming" ? (
              <form onSubmit={(event) => void handleWizallConfirm(event)} className="flex flex-col gap-4">
                <p className="text-muted-foreground text-sm">Entrez le code reçu par SMS pour valider le paiement Wizall.</p>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="wizall-code">Code reçu par SMS</Label>
                  <Input
                    id="wizall-code"
                    required
                    value={wizallCode}
                    onChange={(event) => setWizallCode(event.target.value)}
                  />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button type="submit" disabled={step === "wizall-confirming"}>
                  {step === "wizall-confirming" ? "Validation…" : "Valider"}
                </Button>
              </form>
            ) : (
              <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="softpay-country">Pays</Label>
                    <select
                      id="softpay-country"
                      value={countryCode}
                      onChange={(event) => handleCountryChange(event.target.value)}
                      className="border-input bg-transparent h-9 rounded-md border px-3 text-sm"
                    >
                      {SOFTPAY_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="softpay-operator">Opérateur</Label>
                    <select
                      id="softpay-operator"
                      value={operatorId}
                      onChange={(event) => setOperatorId(event.target.value)}
                      className="border-input bg-transparent h-9 rounded-md border px-3 text-sm"
                    >
                      {country.operators.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    placeholder={`Ex. ${country.dialCode}90000000`}
                  />
                </div>
                {operator.requiresOtp && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="softpay-otp">Code de paiement</Label>
                    <Input id="softpay-otp" required value={otp} onChange={(event) => setOtp(event.target.value)} />
                    {operator.otpHint && <p className="text-muted-foreground text-xs">{operator.otpHint}</p>}
                  </div>
                )}
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
