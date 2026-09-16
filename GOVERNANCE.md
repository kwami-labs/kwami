# Governance

Kwami is a small open-source project. This document is how decisions are made — not a
foundation charter.

## Maintainers

| Role       | Who                                        |
| ---------- | ------------------------------------------ |
| Maintainer | [@alexcolls](https://github.com/alexcolls) |

[CODEOWNERS](./.github/CODEOWNERS) routes review: everything defaults to the maintainer;
`/.github/`, `/scripts/`, release config, and the public API (`src/index.ts`, `src/types/`)
are called out explicitly.

## Decisions

- **Day-to-day** — the maintainer merges PRs that pass **`ci gate`** (and **`enforce promotion
path`** into `stg` / `main`).
- **Public API** — additive changes are ordinary `feat` PRs. Removals and meaning changes need
  a `BREAKING CHANGE:` footer and a migration note in the PR.
- **Release automation** — versions, tags, `CHANGELOG.md`, and npm publishes are owned by
  semantic-release. Humans do not bump `version` or rewrite the changelog.
- **Promotion** — `feature/* → dev → stg → main` only, from this repository's current tip.
  Documented in [docs/ci-cd.md](./docs/ci-cd.md).

## Becoming a maintainer

There is no formal nominating committee. Consistent, high-quality contributions (reviews,
releases, incident response) can lead to write access at the current maintainer's discretion.
Ask on a discussion or issue if you want to take on a defined area (avatar, agent, CI).

## Conduct and security

- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- [SECURITY.md](./SECURITY.md) — private reports only
