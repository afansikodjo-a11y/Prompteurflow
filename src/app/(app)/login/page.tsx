import Link from "next/link";

import { AuthSplitPanel, LoginForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <AuthSplitPanel>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Connexion</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="underline">
            Créer un compte
          </Link>
        </p>
      </div>
      <LoginForm />
    </AuthSplitPanel>
  );
}
