/**
 * Métadonnées d'affichage des opérateurs SoftPay — id/label/OTP uniquement,
 * jamais les noms de champs PayDunya (ceux-là restent server-only, voir
 * `api/checkout/lib/paydunya-softpay.ts`). Les deux listes doivent rester
 * synchronisées manuellement (mêmes id). Carte bancaire et wallet PayDunya
 * exclus (voir le commentaire dans `paydunya-softpay.ts`).
 *
 * Volontairement absents ici bien que codés côté serveur (prêts, juste pas
 * exposés) — vérifié par un appel réel le 2026-09-07 :
 * - Cameroun (MTN) : "Accès restreint pour effectuer des opérations dans
 *   cette région" — la région Cameroun n'est pas activée sur le compte
 *   PayDunya. Rien à voir avec la devise (XAF vs XOF).
 * - Wizall Sénégal : "service momentanément indisponible" — panne
 *   ponctuelle ou non activé sur le compte, à reconfirmer plus tard.
 * Remettre une entrée ici suffit à la réexposer une fois le blocage levé
 * côté compte PayDunya (aucun changement de code nécessaire ailleurs).
 */
export interface SoftpayOperatorOption {
  id: string;
  label: string;
  /** Un formulaire OTP (obtenu par l'utilisateur via USSD) est affiché avant l'envoi. */
  requiresOtp?: boolean;
  /** Instruction affichée sous le champ OTP — spécifique à chaque opérateur (code USSD différent). */
  otpHint?: string;
}

export interface SoftpayCountryOption {
  code: string;
  label: string;
  dialCode: string;
  operators: SoftpayOperatorOption[];
}

export const SOFTPAY_COUNTRIES: SoftpayCountryOption[] = [
  {
    code: "tg",
    label: "Togo",
    dialCode: "228",
    operators: [
      { id: "t-money-togo", label: "T-Money" },
      { id: "moov-togo", label: "Moov Money / Mixx" },
    ],
  },
  {
    code: "sn",
    label: "Sénégal",
    dialCode: "221",
    operators: [
      { id: "orange-money-sn", label: "Orange Money" },
      { id: "free-money-sn", label: "Free Money" },
      { id: "expresso-sn", label: "Expresso" },
      { id: "wave-sn", label: "Wave" },
      { id: "djamo-sn", label: "Djamo" },
    ],
  },
  {
    code: "ci",
    label: "Côte d'Ivoire",
    dialCode: "225",
    operators: [
      {
        id: "orange-money-ci",
        label: "Orange Money",
        requiresOtp: true,
        otpHint: "Composez #144*82# puis l'option 2 sur votre téléphone pour obtenir ce code.",
      },
      { id: "mtn-ci", label: "MTN Money" },
      { id: "moov-ci", label: "Moov Money" },
      { id: "wave-ci", label: "Wave" },
      { id: "djamo-ci", label: "Djamo" },
    ],
  },
  {
    code: "bj",
    label: "Bénin",
    dialCode: "229",
    operators: [
      { id: "moov-benin", label: "Moov Money" },
      { id: "mtn-benin", label: "MTN Money" },
    ],
  },
  {
    code: "bf",
    label: "Burkina Faso",
    dialCode: "226",
    operators: [
      {
        id: "orange-money-bf",
        label: "Orange Money",
        requiresOtp: true,
        // Procédure d'obtention non détaillée dans la doc PayDunya (contrairement à CI) —
        // volontairement générique plutôt que d'inventer un code USSD non confirmé.
        otpHint: "Code de paiement fourni par Orange Money.",
      },
      { id: "moov-bf", label: "Moov Money" },
    ],
  },
  {
    code: "ml",
    label: "Mali",
    dialCode: "223",
    operators: [
      { id: "orange-money-ml", label: "Orange Money" },
      { id: "moov-ml", label: "Moov Money" },
    ],
  },
];
