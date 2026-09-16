# Changelog

Released history is **[CHANGELOG.md](../CHANGELOG.md)** at the repository root. That file is
an **output** of [semantic-release](https://semantic-release.gitbook.io/). Do not hand-edit
it, and do not bump `package.json` `"version"` — both are rewritten on a green channel push.

How versions are chosen: [releases](./releases.md). How a commit reaches a channel:
[CI/CD](./ci-cd.md).

## How to read it

The file follows [Keep a Changelog](https://keepachangelog.com/) headings that semantic-release
fills from Conventional Commit types:

| Heading                 | Comes from                                      |
| ----------------------- | ----------------------------------------------- |
| Features                | `feat:`                                         |
| Bug Fixes               | `fix:`                                          |
| Performance             | `perf:`                                         |
| Refactoring             | `refactor:`                                     |
| Reverts                 | `revert:`                                       |
| Build & Dependencies    | `build(deps):`                                  |
| BREAKING CHANGES        | any type + `BREAKING CHANGE:` footer            |

`docs`, `test`, `ci`, `chore`, and `style` do not cut a version and do not appear.

Older reconstructed sections (pre-automation, ecosystem / playground lines) are annotated in
the file itself. Duplicate semvers from version resets are labeled by year.

## Channels

| npm tag   | Branch | What you are reading                     |
| --------- | ------ | ---------------------------------------- |
| `latest`  | `main` | Stable sections — what most people want  |
| `rc`      | `stg`  | Same notes, prerelease versions          |
| `dev`     | `dev`  | Tip of integration                       |

GitHub Releases are cut in lockstep. Pre-releases are marked as such on the Releases page.

## First-time contributors

A squash merge into `dev` uses the **PR title** as the changelog subject. A merge commit
promoting `dev → stg` or `stg → main` keeps the individual subjects. Both strings are
commitlint-gated — see [CI/CD](./ci-cd.md).
