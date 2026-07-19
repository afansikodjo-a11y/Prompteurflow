/**
 * API publique de la feature « scripts » (gestion des scripts sauvegardés).
 */
export { useScripts, type UseScriptsResult } from "./hooks/use-scripts";
export { ScriptsLibrary } from "./components/scripts-library";
export { parseScriptFile, UnsupportedFileTypeError } from "./lib/parse-script-file";
export type { Script } from "./types";
