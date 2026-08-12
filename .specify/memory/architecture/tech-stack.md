# Architecture Tech Stack

## Languages and Runtimes

- TypeScript 5.x, React 18.x (SPA)
- Spec Kit scripts use Bash (`sh`)

## Frameworks and Libraries

- Vite 6, Tailwind CSS 4, `vite-plugin-pwa`, Lucide React, Recharts, date-fns
- Persistence: browser `localStorage` (versioned `cal_count.v1`)

## Tooling

- Vitest + jsdom for domain/storage unit tests
- Git repository + Spec Kit under `.specify/`
- Cursor Agent commands via `.cursor/commands/`

## Infrastructure and Delivery

- GitHub Pages project site (`base: /cal_count/`)
- Deploy workflow: `.github/workflows/deploy-pages.yml`

## Notes

- AI assistant: `cursor-agent`
- Script type: `sh`
