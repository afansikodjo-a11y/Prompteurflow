/**
 * Déclarations ambiantes globales.
 * Permet les imports « side-effect » de feuilles de style (ex. `import "./globals.css"`)
 * que TypeScript ne sait pas résoudre seul (l'inlining est géré par le bundler Next.js).
 */
declare module "*.css";
