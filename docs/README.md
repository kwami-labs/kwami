# Documentation

Guides for the published `kwami` library — the browser package that renders a 3D companion,
shapes its personality, and connects a LiveKit voice session.

The product pitch (mint, fund, challenge) lives in the [root README](../README.md). This folder
is how the library is built, shipped, and kept safe.

## Start here

| Document                                | Read it when you want to…                              |
| --------------------------------------- | ------------------------------------------------------ |
| [Getting started](./getting-started.md) | embed Kwami in an app                                  |
| [Architecture](./architecture.md)       | see how the modules fit together (diagrams)            |
| [API](./api.md)                         | look up the public surface                             |
| [Security](./security.md)               | deploy without leaking keys or trusting the wrong peer |
| [Testing](./testing.md)                 | add a test at the right layer                          |
| [CI/CD](./ci-cd.md)                     | understand the promotion gate                          |
| [Releases](./releases.md)               | know what a commit will version                        |
| [Changelog](./changelog.md)             | read the history semantic-release writes               |

## Project docs (repository root)

These stay at the root because GitHub, npm, and most OSS tooling look for them there.

| Document                                 | Role                                                 |
| ---------------------------------------- | ---------------------------------------------------- |
| [README](../README.md)                   | What Kwami is, install, scripts                      |
| [CONTRIBUTING](../CONTRIBUTING.md)       | Branches, commits, PR checklist                      |
| [CODE_OF_CONDUCT](../CODE_OF_CONDUCT.md) | How we treat each other                              |
| [GOVERNANCE](../GOVERNANCE.md)           | Who decides, how releases land                       |
| [SECURITY](../SECURITY.md)               | Supported versions and how to report a vulnerability |
| [SUPPORT](../SUPPORT.md)                 | Where to ask for help                                |
| [CHANGELOG](../CHANGELOG.md)             | Released changes (generated — do not edit)           |
| [LICENSE](../LICENSE)                    | Apache-2.0                                           |

## Reading order

**Consuming the package**

1. [Getting started](./getting-started.md)
2. [API](./api.md)
3. [Security](./security.md) — especially agent identity and provider keys

**Changing the library**

1. [CONTRIBUTING](../CONTRIBUTING.md)
2. [Architecture](./architecture.md)
3. [Testing](./testing.md)
4. [CI/CD](./ci-cd.md) · [Releases](./releases.md)
