import Link from "next/link";

import { LoginForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <section className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Connexion</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="underline">
            Créer un compte
          </Link>
        </p>
      </div>
      <LoginForm />
    </section>
  );
}
