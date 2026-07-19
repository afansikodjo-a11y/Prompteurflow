/**
 * Extrait le texte d'un fichier importé (.txt, .docx, .pdf) pour créer un
 * script. Les librairies de parsing PDF/Word sont chargées en dynamique
 * (`import()`) — inutile d'alourdir le chargement initial de l'app pour une
 * action ponctuelle.
 */

export class UnsupportedFileTypeError extends Error {}

const UTF8_DECODER = new TextDecoder("utf-8", { fatal: true });
const WINDOWS1252_DECODER = new TextDecoder("windows-1252");

/**
 * Décode un `.txt` en UTF-8 ; replie sur Windows-1252 s'il ne l'est pas.
 *
 * Un fichier texte enregistré depuis Windows (Bloc-notes, export « texte
 * brut » de certains traitements de texte) est souvent en ANSI/Windows-1252,
 * pas en UTF-8 — décoder ça en UTF-8 « permissif » produit des caractères
 * incohérents sur tout accent français (é, è, ç…), silencieusement, sans
 * erreur. `fatal: true` fait échouer le décodage UTF-8 sur une séquence
 * invalide plutôt que de le corrompre, pour permettre ce repli.
 */
function decodeText(buffer: ArrayBuffer): string {
  try {
    return UTF8_DECODER.decode(buffer);
  } catch {
    return WINDOWS1252_DECODER.decode(buffer);
  }
}

async function parseTxt(file: File): Promise<string> {
  return decodeText(await file.arrayBuffer());
}

async function parseDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return value;
}

async function parsePdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }
  return pages.join("\n\n");
}

/** Extrait le texte d'un fichier `.txt`, `.docx` ou `.pdf`. */
export async function parseScriptFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx")) return parseDocx(file);
  if (name.endsWith(".pdf")) return parsePdf(file);
  if (name.endsWith(".txt") || file.type === "text/plain" || file.type === "") return parseTxt(file);
  throw new UnsupportedFileTypeError(`Format non pris en charge : ${file.name}`);
}
