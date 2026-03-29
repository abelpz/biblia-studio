This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

`dev` / `build` use **`--webpack`** so workspace packages (`@biblia-studio/door43`, `@biblia-studio/editing`, `@biblia-studio/formats`) with NodeNext-style `.js` imports to `.ts` sources resolve correctly. See `next.config.js` (`transpilePackages`, `resolve.extensionAlias`).

- **`/editor`** — minimal ProseMirror scripture editor (USFM via `formats` + `editing`).
- **`/translation-helps`** — tc-ready catalog (`lang`, `org`, `limit`); GL→GL `compare`; optional **book matrix** `matrix=1` and `matrixMax` (metadata `projects` book ids per matched resource); **source-first** `srcLang`/`srcId`/`srcVer`; **repo** / **metadata** / **bundle** links when catalog has coords. Port + adapter use `door43` / `translation`.
- **`/docs/translation-helps-api`** — human-readable **library API** documentation (renders `docs/18-translation-helps-domain-api.md` from the monorepo root when available).

## Smoke check (local)

1. From repo root: `bunx turbo run dev --filter=web` (or `cd apps/web && bun run dev`).
2. Open [http://localhost:3000/editor](http://localhost:3000/editor) — you should see the editor, USFM preview, and **Download USFM**.
3. Open [http://localhost:3000/translation-helps?lang=en](http://localhost:3000/translation-helps?lang=en) — catalog table loads (network to Door43). Source-first: `lang=es&srcLang=en&srcId=tn`. Book matrix (with compare): `lang=en&compare=es&matrix=1&matrixMax=10`.
4. Open [http://localhost:3000/docs/translation-helps-api](http://localhost:3000/docs/translation-helps-api) — API docs page (reads `docs/18-translation-helps-domain-api.md` from repo root).
5. CI-equivalent: `bun run turbo run build --filter=web` (compiles `/editor`, `/translation-helps`, and `/docs/translation-helps-api`).
6. Tests: `bun run turbo run test --filter=web` — Vitest for **`translation-helps` driven adapter** (mocked `door43` / `translation`).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
