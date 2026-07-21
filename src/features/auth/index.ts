/**
 * API publique de la feature « auth » (session Supabase + rôle).
 */
export { AuthProvider } from "./components/auth-provider";
export { AuthSplitPanel } from "./components/auth-split-panel";
export { LoginForm } from "./components/login-form";
export { SignupForm } from "./components/signup-form";
export { UserMenu } from "./components/user-menu";
export { useAuth } from "./hooks/use-auth";
export type { AuthUser, UseAuthResult } from "./types";
