import Link from "next/link";

import { FEATURE_FLAGS } from "@/config/flags";
import { SignupForm } from "@/features/auth";

export default function SignupPage() {
  if (!FEATURE_FLAGS.signupEnabled) {
    return (
      <section className="mx-auto flex max-w-sm flex-col gap-3 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Inscriptions fermées pour l&apos;instant</h1>
        <p className="text-muted-foreground text-sm">
          PrompteurFlow est en phase de test. Les créations de compte sont temporairement
          suspendues — revenez bientôt.
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Déjà un compte ?{" "}
          <Link href="/login" className="underline">
            Se connecter
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Créer un compte</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Déjà un compte ?{" "}
          <Link href="/login" className="underline">
            Se connecter
          </Link>
        </p>
      </div>
      <SignupForm />
    </section>
  );
}
