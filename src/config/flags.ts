/**
 * Indicateurs de configuration — phase de test terminée : inscriptions,
 * tarifs et vraies limites de plan sont maintenant tous actifs. Checkout +
 * webhook Moneroo sont branchés, donc `openAccess` n'est plus nécessaire
 * pour éviter de coincer un compte Basique sans moyen de payer.
 */
export const FEATURE_FLAGS = {
  /** Inscriptions publiques ouvertes. */
  signupEnabled: true,
  /** Tarifs annoncés publiquement (section visible sur la landing). */
  pricingVisible: true,
  /**
   * Désactivé : chaque compte est maintenant soumis aux vraies limites de
   * son plan (Basique par défaut, Standard/Pro seulement via un abonnement
   * actif et non expiré — voir `useSubscription`/`useMySubscriptionDetails`).
   */
  openAccess: false,
} as const;
