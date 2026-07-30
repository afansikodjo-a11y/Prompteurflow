const XOF_FORMATTER = new Intl.NumberFormat("fr-FR");

/** Formate un montant XOF pour affichage (`0` → "Gratuit"). */
export function formatXof(priceXof: number): string {
  return priceXof === 0 ? "Gratuit" : `${XOF_FORMATTER.format(priceXof)} FCFA`;
}
