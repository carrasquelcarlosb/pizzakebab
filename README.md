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

## Hexagonal architecture onboarding

The code base is being reorganized into a ports-and-adapters (hexagonal) layout. The React app under `src/` and the
Fastify API under `services/api/` share the same principles, even though migrations are in-flight. Use the following
guidance when adding or updating features:

- **Add a new use case**:
  - For UI-facing flows, create a folder under `src/domain/<bounded-context>/use-cases/`. For the API service, place the
    module under `services/api/src/domain/<bounded-context>/use-cases/`.
  - Codify business rules as pure functions or classes. Define required dependencies as outgoing ports in the sibling
    `ports/` directory and surface an incoming port (the exported function or class).
  - Reuse shared domain types from `packages/domain-types` when cross-cutting contracts are needed.
- **Add an adapter**:
  - UI adapters (server actions, React hooks, data loaders) belong in `src/adapters/<technology>/<bounded-context>/`.
  - API adapters (HTTP handlers, persistence, queue bridges) live in `services/api/src/adapters/` and wire the Fastify
    plugins to the domain ports.
  - Keep adapters responsible for translating framework or transport specifics into domain-friendly structures and for
    instantiating use cases with concrete dependencies.
- **Add tests**:
  - Prefer colocated unit tests next to the domain module (`*.spec.ts`/`*.test.ts`), mocking outgoing ports.
  - Node's built-in test runner (via `npm test`) executes top-level suites under `tests/` as well as Fastify-specific
    suites in `services/api/tests/`. Use integration tests to exercise adapter wiring and end-to-end workflows.
  - Avoid importing legacy services once a feature has been migrated to a domain use case.

See `docs/architecture/hexagonal.md` for detailed layering conventions, directory maps, and migration checklists.

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
