# Support

## Questions about using the library

1. Read [docs/getting-started.md](./docs/getting-started.md) and [docs/api.md](./docs/api.md).
2. Search [existing issues](https://github.com/kwami-labs/kwami/issues).
3. Open a question issue with the **question** label, or a discussion if the repository has
   Discussions enabled.

Include: `kwami` version (`Kwami.getVersion()` or the npm tag), bundler, browser, and whether
you are on `latest` / `rc` / `dev`.

## Bugs and features

Use the issue templates:

- [Bug report](https://github.com/kwami-labs/kwami/issues/new?template=bug_report.yml)
- [Feature request](https://github.com/kwami-labs/kwami/issues/new?template=feature_request.yml)

A failing `pnpm` command plus a minimal reproduction helps more than a screen recording.

## Security

**Do not open a public issue.**

[SECURITY.md](./SECURITY.md) — GitHub private advisory or email.

## Contributing a fix

[CONTRIBUTING.md](./CONTRIBUTING.md). Branch off `dev`; Conventional Commits; PR against
`dev`.

## What this project is not

This repository is the **`kwami` npm library** (3D companion + LiveKit client). Hosting a
LiveKit cluster, minting Solana NFTs, or operating MoonPay is your (or another repo's)
responsibility. Issues that are only "my token endpoint 401s" belong on that backend.
