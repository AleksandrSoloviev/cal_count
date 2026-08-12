# Cal Count

Mobile-first calorie & macro tracker Progressive Web App.

## Stack

- React 18 + TypeScript + Vite 6 + Tailwind CSS 4
- Browser `localStorage` persistence
- `vite-plugin-pwa` (installable; offline after first load)
- Deploy target: GitHub Pages project site at `/cal_count/`

## Local development

```bash
npm install
npm run dev
```

Preview with Pages base path:

```bash
npm run build
npm run preview
```

Open `http://localhost:4173/cal_count/`.

## Tests

```bash
npm test
```

## Deploy

Push to `main`. GitHub Actions builds and publishes `dist/` to GitHub Pages.

Enable **Settings → Pages → Source: GitHub Actions**.

Site URL: `https://<user>.github.io/cal_count/`

## Roadmap

1. **Web MVP (current)** — dogfood the PWA on GitHub Pages (flows, local data, install to home screen).
2. **React Native (next)** — after web validation, port the same functionality to a cross-platform React Native app (iOS/Android).
3. **Backend / sync** — only after native direction is underway; not part of the web MVP.

Details: `.specify/memory/context.md` and `.specify/memory/architecture/adr/2026-08-12-web-mvp-then-react-native.md`.

## Ideas inbox

Product/tech ideas go in [`IDEAS.md`](./IDEAS.md). Tell the agent «идея: …» to record, «какие идеи» to list, and only then «реализуй IDEA-00N» to build.

## Spec Kit

Feature artifacts live under `specs/001-calorie-pwa/` (see `quickstart.md`).
