# Contributing

We'd love to have you contribute to this repository!

## Setup Workflow

| Command | Description |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the app for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Check code style and common issues |
| `npm run lint:fix` | Auto-fix lint and formatting issues |
| `npm run typecheck` | Run the TypeScript type checker |

## Schema Workflow

- `app/` holds the Nuxt application: pages, layouts, components, and styles.
- `app/components/` groups UI into feature-oriented subfolders (e.g. `profile/`, `icons/`, `ui/`), with top-level components composing them into page sections.
- `app/utils/` holds frontend helper functions that are auto-imported across components.
- `server/api/` exposes the HTTP endpoints the frontend calls to fetch GitHub data.
- `server/routes/` exposes non-API server responses, such as `robots.txt` and `sitemap.xml`.
- `server/utils/` holds server-side helpers (like the GitHub API client) auto-imported across API routes.
- `types/` holds the shared TypeScript interfaces describing the data exchanged between the server and the frontend.
- `constants/` centralizes fixed values that are reused across the app and server layers.
- `public/` serves static, unprocessed assets straight from the site root.

## Contribution Workflow

Work happens on feature branches merged into `main` through pull requests, with commit messages following Conventional Commits.

---

This project is developed with the help of [Claude](https://claude.ai).
