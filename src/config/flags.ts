/**
 * Indicateurs de configuration temporaires — inscriptions et tarifs
 * rouverts, mais `openAccess` reste actif tant que le paiement Moneroo
 * n'encaisse pas réellement (clés déjà en `.env.local`, checkout/webhook pas
 * encore construits). Repasser `openAccess: false` une fois Moneroo prêt,
 * pour faire respecter les vraies limites de chaque palier.
 */
export const FEATURE_FLAGS = {
  /** Inscriptions publiques ouvertes. */
  signupEnabled: true,
  /** Tarifs annoncés publiquement (section visible sur la landing). */
  pricingVisible: true,
  /**
   * Accès complet (limites du plan Pro) pour tout le monde, connecté ou non.
   * Reste actif tant que Moneroo ne peut pas réellement encaisser : sans
   * ça, un compte Basique buterait sur une limite sans aucun moyen de payer
   * pour la lever, malgré des tarifs et des inscriptions déjà visibles.
   */
  openAccess: true,
} as const;
