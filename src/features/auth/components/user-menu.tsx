"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gift, LogOut, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FEATURE_FLAGS } from "@/config/flags";
import { useAuth } from "../hooks/use-auth";

/** Connexion/déconnexion + lien admin (si le rôle le permet), dans l'en-tête. */
export function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) return null;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Connexion</Link>
        </Button>
        {FEATURE_FLAGS.signupEnabled && (
          <Button asChild size="sm">
            <Link href="/signup">Créer un compte</Link>
          </Button>
        )}
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/affiliation">
          <Gift className="size-4" />
          Affiliation
        </Link>
      </Button>
      {user.role === "admin" && (
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin">
            <Shield className="size-4" />
            Admin
          </Link>
        </Button>
      )}
      <span className="text-muted-foreground hidden text-sm sm:inline">{user.email}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => void handleSignOut()}
        aria-label="Se déconnecter"
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  );
}
