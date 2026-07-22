/** Construit un lien wa.me à partir d'un numéro (chiffres uniquement conservés) et d'un message pré-rempli. */
export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
