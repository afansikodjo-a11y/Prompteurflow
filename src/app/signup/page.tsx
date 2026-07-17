import Link from "next/link";

import { SignupForm } from "@/features/auth";

export default function SignupPage() {
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
