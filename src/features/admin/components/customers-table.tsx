"use client";

import * as React from "react";
import { MailCheck, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { useAdminCustomers } from "../hooks/use-admin-customers";
import type { AdminCustomerRow } from "../types";

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const WHATSAPP_MESSAGE = "Bonjour ! On voulait faire un point avec vous à propos de votre abonnement PrompteurFlow.";

interface CustomerRowProps {
  customer: AdminCustomerRow;
  onSavePhone: (phone: string) => Promise<void>;
  onToggleStatus: () => Promise<{ error: string | null }>;
  onConfirmEmail: () => Promise<{ error: string | null }>;
}

function CustomerRow({ customer, onSavePhone, onToggleStatus, onConfirmEmail }: CustomerRowProps) {
  const [phoneDraft, setPhoneDraft] = React.useState(customer.phone ?? "");
  const [toggleError, setToggleError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [confirmState, setConfirmState] = React.useState<"idle" | "busy" | "done" | "error">("idle");
  const [confirmError, setConfirmError] = React.useState<string | null>(null);

  React.useEffect(() => setPhoneDraft(customer.phone ?? ""), [customer.phone]);

  const handlePhoneBlur = () => {
    if (phoneDraft.trim() === (customer.phone ?? "")) return;
    void onSavePhone(phoneDraft);
  };

  const handleToggle = async () => {
    setBusy(true);
    setToggleError(null);
    const { error } = await onToggleStatus();
    setBusy(false);
    if (error) setToggleError(error);
  };

  const handleConfirmEmail = async () => {
    setConfirmState("busy");
    setConfirmError(null);
    const { error } = await onConfirmEmail();
    if (error) {
      setConfirmState("error");
      setConfirmError(error);
      return;
    }
    setConfirmState("done");
  };

  const isDisabled = customer.disabledAt !== null;
  const digitsOnly = (customer.phone ?? "").replace(/\D/g, "");

  return (
    <tr>
      <td className="py-2">
        {customer.email || "—"}
        {customer.role === "admin" && <span className="text-muted-foreground ml-1.5 text-xs">(admin)</span>}
      </td>
      <td className="py-2">
        <Input
          value={phoneDraft}
          onChange={(event) => setPhoneDraft(event.target.value)}
          onBlur={handlePhoneBlur}
          placeholder="Ex. 22890000000"
          className="h-8 w-40"
        />
      </td>
      <td className="py-2">
        <span
          className={
            isDisabled
              ? "bg-destructive/15 text-destructive rounded-full px-2 py-0.5 text-xs"
              : "bg-brand/15 text-brand-bright rounded-full px-2 py-0.5 text-xs"
          }
        >
          {isDisabled ? "Désactivé" : "Actif"}
        </span>
      </td>
      <td className="text-muted-foreground py-2 tabular-nums">
        {DATE_FORMATTER.format(new Date(customer.createdAt))}
      </td>
      <td className="py-2 text-right">
        <div className="flex justify-end gap-2">
          {digitsOnly && (
            <Button asChild type="button" size="sm" variant="outline">
              <a href={buildWhatsAppLink(customer.phone ?? "", WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void handleConfirmEmail()}
            disabled={confirmState === "busy" || confirmState === "done"}
          >
            <MailCheck className="size-4" />
            {confirmState === "done" ? "Email confirmé" : "Confirmer l'email"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={isDisabled ? "outline" : "ghost"}
            onClick={() => void handleToggle()}
            disabled={busy}
          >
            {isDisabled ? "Réactiver" : "Désactiver"}
          </Button>
        </div>
        {toggleError && <p className="text-destructive mt-1 text-xs">{toggleError}</p>}
        {confirmError && <p className="text-destructive mt-1 text-xs">{confirmError}</p>}
      </td>
    </tr>
  );
}

/** Table complète des clients — téléphone éditable, relance WhatsApp, activation/désactivation de compte. */
export function CustomersTable() {
  const { customers, loading, updatePhone, toggleStatus, confirmEmail } = useAdminCustomers();

  if (loading) return <p className="text-muted-foreground text-sm">Chargement…</p>;
  if (customers.length === 0) {
    return <p className="text-muted-foreground text-sm">Aucun client pour l&apos;instant.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground border-b text-left">
            <th className="pb-2 font-medium">Email</th>
            <th className="pb-2 font-medium">Téléphone</th>
            <th className="pb-2 font-medium">Statut</th>
            <th className="pb-2 font-medium">Inscrit le</th>
            <th className="pb-2 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {customers.map((customer) => (
            <CustomerRow
              key={customer.id}
              customer={customer}
              onSavePhone={(phone) => updatePhone(customer.id, phone)}
              onToggleStatus={() => toggleStatus(customer.id, !customer.disabledAt)}
              onConfirmEmail={() => confirmEmail(customer.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
