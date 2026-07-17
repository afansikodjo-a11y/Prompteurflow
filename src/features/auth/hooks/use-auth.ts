"use client";

import * as React from "react";

import { AuthContext } from "../components/auth-provider";
import type { UseAuthResult } from "../types";

/** Session utilisateur courante + rôle. Doit être utilisé sous `<AuthProvider>`. */
export function useAuth(): UseAuthResult {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé sous <AuthProvider>.");
  return context;
}
