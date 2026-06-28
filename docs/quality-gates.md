# Quality Gates

This repository uses small, fast checks as the baseline for human and agent-assisted changes. The goal is to catch regressions without turning every change into a full Docker integration run.

Related decision record: [Issue #1](https://github.com/Shadowlauch/eve-incursions-node/issues/1).

## Canonical Commands

Run these from the repository root:

```bash
npm run typecheck
npm test
```

`npm run typecheck` runs TypeScript checks for all workspaces that define a `typecheck` script.

`npm test` runs package tests where they exist. Today that means the server Vitest suite; frontend and websocket packages are skipped until they grow tests.

Package-specific commands are also available:

```bash
npm run typecheck:server
npm run typecheck:frontend
npm run typecheck:ws
npm run test:server
```

## CI Baseline

GitHub Actions runs the same fast baseline on pushes and pull requests targeting `master`:

1. Install dependencies with `npm ci`.
2. Run `npm run typecheck`.
3. Run `npm test`.

This baseline is intentionally narrow and deterministic. It should stay quick enough for every branch and PR.

## Exclusions

The fast baseline does not currently require:

- `npm run build --workspace frontend`: Next.js prerendering depends on live app infrastructure for some pages.
- `npm run y --workspace frontend`: GraphQL codegen reads schema data from `http://server:4001`.
- Docker Compose E2E checks: useful, but slower and more environment-sensitive than the first CI baseline.
- Lint or formatter checks: the repository has no established ESLint, Prettier, or Biome config, and adding one would create broad style churn.

Add any of those only through a dedicated Decision Issue that explains the tradeoff and proves the check is stable.

## Agent Guidance

Agents should run `npm run typecheck` and `npm test` before reporting implementation work complete. If a change cannot pass these checks because of a known pre-existing issue, report the exact failing command and failure instead of weakening the gate.
