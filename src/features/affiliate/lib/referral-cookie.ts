import { REFERRAL_COOKIE_NAME } from "../constants";

/** Lit le code de parrainage posé par le middleware (`?ref=`), s'il existe. */
export function getReferralCodeFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${REFERRAL_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
