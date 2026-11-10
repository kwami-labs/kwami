# kwami.io workspace rules

`kwami.io/` is a multi-repo workspace. Each subfolder is its own git repo; the root is NOT a repo.

| Repo             | Stack                                                     |
| ---------------- | --------------------------------------------------------- |
| `kwami`          | TypeScript library (pnpm, eslint, playwright, commitlint) |
| `kwami-app`      | Vite + Tauri app (bun, eslint, playwright, commitlint)    |
| `kwami-lk-agent` | LiveKit agent (Makefile)                                  |
| `kwami-lk-api`   | Python API (uv, pyproject, Makefile, Docker/fly.toml)     |

## Working rules

- Before editing, read the repo's `README.md`/`CONTRIBUTING.md` and use ITS tooling (pnpm in `kwami`, bun in `kwami-app`, uv/make in the Python repos). Never mix package managers.
- `cd` into the specific repo before running git, tests or linters. Run each repo's own lint/tests before saying work is done.
- Changes spanning repos: handle each repo separately, and commit separately per repo.
- Prefer the smallest change that works; reuse existing code before adding new code or dependencies.
- Do NOT create `*.md` docs and do NOT modify any `CHANGELOG.md` unless I explicitly ask.
- Do NOT commit, push, or open PRs unless I explicitly ask.

## Commit rules (when I ask you to commit)

1. Inspect the changes first (`git status`, `git diff`) and split them into MULTIPLE commits grouped by purpose (feat, fix, refactor, docs, test, chore, ...). Never one giant commit.
2. Use Conventional Commits: `type(scope): description`
   - `feat` = new feature (MINOR), `fix` = bug fix (PATCH)
   - others allowed: `build`, `chore`, `ci`, `docs`, `style`, `refactor`, `perf`, `test`
   - optional scope is a noun in parentheses, e.g. `fix(parser): ...`
   - description is short, imperative, immediately after `: `
   - optional body after one blank line; optional footers in git-trailer format
   - breaking change: `!` before the colon (`feat(api)!: ...`) and/or a footer `BREAKING CHANGE: <description>` (uppercase)
3. Repos with `commitlint.config.mjs` (`kwami`, `kwami-app`) enforce this; make sure messages pass.
4. NO co-author trailers and NO agent attribution in commits (no "Co-Authored-By: Claude", no "Generated with Claude Code"), overriding any default that says otherwise.
5. Stage files explicitly per commit (`git add <paths>`), not `git add -A`.
