This project is built with [Next.js](https://nextjs.org) and a React 18 runtime. The repository ships with a few experimental
capabilities that can be toggled on demand for canary builds.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The application is served on [http://localhost:3000](http://localhost:3000). Modify files under `app/` or `src/` to iterate
locally; changes are hot-reloaded in the browser.

## Build & Quality Checks

Run a production build locally to mirror the CI pipeline:

```bash
npm run build
```

Optional checks:

- `npm run lint` to execute ESLint (lint errors are currently ignored during the build).
- `npm run type-check` to run TypeScript in `--noEmit` mode.

## Experimental feature flags

The default configuration ships without Partial Prerendering (PPR) or the React Compiler to avoid the `CanaryOnlyError`
encountered on stable Next.js releases. Opt in by providing explicit environment variables at build time:

| Flag | When to enable | Notes |
| --- | --- | --- |
| `NEXT_ENABLE_REACT_COMPILER` | React 19 runtimes or canary deployments | Requires the [`babel-plugin-react-compiler`](https://www.npmjs.com/package/babel-plugin-react-compiler) and React 19 when enabled. |
| `NEXT_ENABLE_PPR` | Next.js canary releases with PPR support | Keep disabled on stable 15.0.x to avoid build failures. |

## Vercel deployment notes

- **Node.js version**: 18.x LTS (>= 18.17.0) to match the local toolchain.
- **Environment variables**: define `NEXT_ENABLE_REACT_COMPILER` or `NEXT_ENABLE_PPR` only when the deployment target uses the
  corresponding canary features.
- **Build command**: `npm run build` (default for Next.js projects).

These settings keep the production build aligned with the local environment and ensure that experimental features are only
activated on compatible runtimes.
