import { AuthSplitPanel, ResetPasswordForm } from "@/features/auth";

export default function ResetPasswordPage() {
  return (
    <AuthSplitPanel>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouveau mot de passe</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">Choisissez un nouveau mot de passe pour votre compte.</p>
      </div>
      <ResetPasswordForm />
    </AuthSplitPanel>
  );
}
