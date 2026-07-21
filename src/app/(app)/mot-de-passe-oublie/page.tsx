import Link from "next/link";

import { AuthSplitPanel, ForgotPasswordForm } from "@/features/auth";

export default function ForgotPasswordPage() {
  return (
    <AuthSplitPanel>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mot de passe oublié</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Entrez votre email, on vous envoie un lien pour le réinitialiser.{" "}
          <Link href="/login" className="underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
      <ForgotPasswordForm />
    </AuthSplitPanel>
  );
}
