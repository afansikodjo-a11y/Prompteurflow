/** Bornes et valeur par défaut de la vitesse de lecture (mots par minute).
 *  ~130 WPM correspond à un débit de parole posé et confortable. */
export const SPEED = { min: 60, max: 240, step: 10, default: 130 } as const;

/** Bornes et valeur par défaut de la taille de police (pixels). */
export const FONT_SIZE = { min: 24, max: 96, step: 2, default: 44 } as const;

/** Clés localStorage des réglages persistés du prompteur. */
export const STORAGE_KEYS = {
  speed: "prompteurflow:speed",
  fontSize: "prompteurflow:font-size",
} as const;

/** Script d'exemple affiché au premier chargement. */
export const DEFAULT_SCRIPT = `Bienvenue sur PrompteurFlow.

Placez votre téléphone, regardez l'objectif, et laissez le texte défiler à votre rythme.

Ajustez la vitesse et la taille du texte pour une lecture confortable.

Quand vous êtes prêt, lancez l'enregistrement : votre vidéo est capturée pendant que vous lisez.

Ceci n'est qu'un exemple — remplacez ce texte par votre propre script et commencez à tourner.`;
