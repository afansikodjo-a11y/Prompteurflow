/**
 * API publique de la feature « ai-writer ». Barrel volontairement minimal —
 * ce dossier ne contient aucun fichier `server-only` (le code touchant
 * `GROQ_API_KEY` et la base vit sous `src/app/api/ai/write/`, jamais ici) :
 * ne pas y ajouter un fichier serveur puis le ré-exporter ici, ça romprait
 * cette garantie pour tout composant client qui importe ce barrel.
 */
export { AiWriterDialog } from "./components/ai-writer-dialog";
