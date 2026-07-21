import { type NextRequest } from "next/server";

import { REFERRAL_CODE_PATTERN, REFERRAL_COOKIE_MAX_AGE_SECONDS, REFERRAL_COOKIE_NAME } from "@/features/affiliate/constants";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Capture `?ref=<code>` en cookie pour l'attribution de parrainage — lu
  // plus tard par `signUp()` (auth-client.ts) au moment de l'inscription.
  // Ne pose/rafraîchit le cookie que si `?ref=` est présent dans la requête
  // courante : le lien visité en dernier gagne, pas de logique
  // premier-clic-vs-dernier-clic à gérer en plus de ça.
  const ref = request.nextUrl.searchParams.get("ref")?.toUpperCase();
  if (ref && REFERRAL_CODE_PATTERN.test(ref)) {
    response.cookies.set(REFERRAL_COOKIE_NAME, ref, {
      maxAge: REFERRAL_COOKIE_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
      // `secure: true` en dur empêcherait silencieusement le cookie de se
      // poser en local (http://localhost).
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|apple-icon.png|icon.svg|manifest.webmanifest|sw.js).*)",
  ],
};
