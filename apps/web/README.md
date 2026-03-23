This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

`dev` / `build` use **`--webpack`** so workspace packages (`@biblia-studio/door43`, `@biblia-studio/editing`, `@biblia-studio/formats`) with NodeNext-style `.js` imports to `.ts` sources resolve correctly. See `next.config.js` (`transpilePackages`, `resolve.extensionAlias`).

- **`/editor`** — minimal ProseMirror scripture editor (USFM via `formats` + `editing`).

## Smoke check (local)

1. From repo root: `bunx turbo run dev --filter=web` (or `cd apps/web && bun run dev`).
2. Open [http://localhost:3000/editor](http://localhost:3000/editor) — you should see the editor, USFM preview, and **Download USFM**.
3. CI-equivalent: `bun run turbo run build --filter=web` (compiles `/editor`).

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
