import Link from "next/link";
import { redirect } from "next/navigation";

import { FEATURE_FLAGS } from "@/config/flags";
import { AuthSplitPanel, SignupForm } from "@/features/auth";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/studio");

  if (!FEATURE_FLAGS.signupEnabled) {
    return (
      <AuthSplitPanel>
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Inscriptions fermées pour l&apos;instant</h1>
          <p className="text-muted-foreground mt-3 text-sm">
            PrompteurFlow est en phase de test. Les créations de compte sont temporairement
            suspendues — revenez bientôt.
          </p>
          <p className="text-muted-foreground mt-3 text-sm">
            Déjà un compte ?{" "}
            <Link href="/login" className="underline">
              Se connecter
            </Link>
          </p>
        </div>
      </AuthSplitPanel>
    );
  }

  return (
    <AuthSplitPanel>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Créer un compte</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Déjà un compte ?{" "}
          <Link href="/login" className="underline">
            Se connecter
          </Link>
        </p>
      </div>
      <SignupForm />
    </AuthSplitPanel>
  );
}
