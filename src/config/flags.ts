/**
 * Indicateurs de configuration temporaires — phase de test, en attendant que
 * le paiement Moneroo soit prêt. Repasser à leurs valeurs normales
 * (`signupEnabled: true`, `pricingVisible: true`, `openAccess: false`) pour
 * relancer les paliers payants, sans autre changement de code.
 */
export const FEATURE_FLAGS = {
  /** Inscriptions publiques désactivées. */
  signupEnabled: false,
  /** Tarifs pas encore annoncés publiquement (section masquée sur la landing). */
  pricingVisible: false,
  /**
   * Accès complet (limites du plan Pro) pour tout le monde, connecté ou non.
   * Nécessaire tant que signup/tarifs sont coupés : sans ça, un testeur sur
   * le plan Basique buterait sur une limite sans aucun moyen de payer — ni
   * même de créer un compte — pour la lever.
   */
  openAccess: true,
} as const;
