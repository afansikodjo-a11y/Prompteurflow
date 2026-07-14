# PrompteurFlow

**Progressive Web App** pour créer, organiser et exécuter vos prompts IA.
Structure de projet prête à l'emploi — les fonctionnalités restent à implémenter.

## Stack

| Domaine        | Technologie                          |
| -------------- | ------------------------------------ |
| Framework      | [Next.js 15](https://nextjs.org) (App Router, Turbopack) |
| UI             | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Styles         | [TailwindCSS v4](https://tailwindcss.com) |
| Composants     | [shadcn/ui](https://ui.shadcn.com)   |
| Animations     | [Framer Motion](https://www.framer.com/motion/) |
| Thème          | [next-themes](https://github.com/pacocoursey/next-themes) (dark mode) |
| PWA            | [Serwist](https://serwist.pages.dev) |
| Qualité        | ESLint · Prettier                    |

## Démarrage

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

> Le service worker n'est actif qu'en **production** (`npm run build && npm run start`).

## Scripts

| Script                 | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Serveur de développement (Turbopack)     |
| `npm run build`        | Build de production                      |
| `npm run start`        | Démarre le build de production           |
| `npm run lint`         | Analyse ESLint                           |
| `npm run typecheck`    | Vérification des types TypeScript        |
| `npm run format`       | Formate le code avec Prettier            |

## Architecture — Feature First

Le code est organisé par **feature** plutôt que par type technique. Chaque
feature est autonome et n'est consommée que par son barrel `index.ts`.

```
src/
├── app/                    # App Router : routes, layout, manifest, service worker
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── manifest.ts         # Manifest PWA
│   ├── sw.ts               # Source du service worker (Serwist)
│   ├── icon.svg            # Favicon
│   └── apple-icon.png      # Icône iOS
│
├── features/               # Fonctionnalités métier (autonomes)
│   └── prompts/            # ── Exemple de feature ──
│       ├── api/            #    Accès aux données
│       ├── components/     #    UI spécifique à la feature
│       ├── hooks/          #    Hooks spécifiques
│       ├── types/          #    Types du domaine
│       ├── utils/          #    Utilitaires spécifiques
│       └── index.ts        #    API publique (barrel)
│
├── components/             # Composants réutilisables transverses
│   ├── ui/                 #    Primitives shadcn/ui (Button, …)
│   ├── layout/             #    Coquilles de mise en page (Header, …)
│   ├── theme/              #    ThemeProvider + ModeToggle (dark mode)
│   └── motion/             #    Wrappers Framer Motion réutilisables
│
├── providers/             # Providers globaux côté client
├── config/                # Configuration (site, navigation)
├── hooks/                 # Hooks transverses partagés
├── lib/                   # Utilitaires bas niveau (cn, …)
└── types/                 # Types transverses partagés
```

### Conventions

- **Import d'une feature** : uniquement via son barrel — `@/features/prompts`.
- **Isolation** : une feature ne lit pas les fichiers internes d'une autre.
- **Remontée** : ce qui est partagé par plusieurs features vit dans `src/components`, `src/lib` ou `src/hooks`.
- **Alias** : `@/*` → `src/*`.

## PWA

- Manifest généré par Next.js : `src/app/manifest.ts` → `/manifest.webmanifest`.
- Service worker (Serwist) : `src/app/sw.ts` → `public/sw.js` (généré au build).
- Icônes : `public/icons/` (**placeholders** à remplacer par le design final).

## Dark mode

Géré par `next-themes` (`attribute="class"`, thème système par défaut). Bascule
via le composant `ModeToggle` de l'en-tête.
