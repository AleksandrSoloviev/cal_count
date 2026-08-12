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

## Spec Kit

Feature artifacts live under `specs/001-calorie-pwa/` (see `quickstart.md`).
