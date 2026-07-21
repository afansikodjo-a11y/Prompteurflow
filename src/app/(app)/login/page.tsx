import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthSplitPanel, LoginForm } from "@/features/auth";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/studio");

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
