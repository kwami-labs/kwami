#!/usr/bin/env node
/**
 * Apply this repository's rulesets, as code.
 *
 * The pipeline assumes protections that live in GitHub rather than in this repo (see
 * docs/ci-cd.md). Clicking them into the UI means they drift silently and nobody can diff them,
 * so they are declared as data in `.github/rulesets/*.json` — the literal API payloads — and
 * this script applies them idempotently: an existing ruleset with the same name is updated in
 * place rather than duplicated.
 *
 * The declarations are JSON rather than object literals in this file for one reason: a rule is
 * a decision about who can change what, and a decision should be reviewable on its own. A diff
 * of `.github/rulesets/main.json` says "the approval count went from 1 to 0" in one line, and
 * CODEOWNERS already puts `/.github/` behind a review.
 *
 *   main   PR + 1 approval + Code Owner review, `ci gate` and `enforce promotion path` required,
 *          up to date before merging, no force pushes, no deletion, merge commits only.
 *   stg    the same, minus the Code Owner review.
 *   dev    PR required and `ci gate` required, but no approval count and squash merges — this is
 *          where work lands, and blocking it on a reviewer stalls a solo repo.
 *   tags   `v*` cannot be deleted, moved or force-updated by anyone, bot included.
 *
 * Deploy keys bypass the branch rulesets: release.yml / cd.yml push the release commit and the
 * post-release back-merges over SSH with the `RELEASE_DEPLOY_KEY` secret (docs/ci-cd.md). It is
 * a deploy key rather than `github-actions[bot]` because a repository ruleset cannot name the
 * GitHub Actions app unless the owning organization has installed it — GitHub answers 422
 * "must be part of the ruleset source or owner organization". Nothing bypasses the tag rules —
 * nothing in the release flow ever needs to delete or move a tag, and semantic-release's entire
 * notion of "what shipped" is those tags.
 *
 * Usage:
 *   gh auth login                       # needs `repo` / admin on the repository
 *   node scripts/ci/apply-branch-rules.mjs [--dry-run] [--repo owner/name]
 */

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RULESETS_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../.github/rulesets');

/**
 * Read the ruleset declarations off disk, in a stable order.
 *
 * Exported for the unit test, which asserts the committed JSON still says what docs/ci-cd.md
 * claims it does — a ruleset that silently loses its status checks is the kind of thing nobody
 * notices until a red PR merges.
 */
export function loadRulesets(dir = RULESETS_DIR) {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => ({ file: name, ruleset: JSON.parse(readFileSync(join(dir, name), 'utf8')) }));
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const repoArg = args[args.indexOf('--repo') + 1];

function detectRepo() {
  const url = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
  const match = url.match(/github\.com[:/](.+?)(?:\.git)?$/);
  if (!match) throw new Error(`Could not read owner/name from origin: ${url}`);
  return match[1];
}

function gh(argv, body) {
  const input = body === undefined ? undefined : JSON.stringify(body);
  const withInput = body === undefined ? argv : [...argv, '--input', '-'];
  const out = execFileSync('gh', withInput, { encoding: 'utf8', input });
  return out.trim() ? JSON.parse(out) : null;
}

/**
 * Fail with an instruction rather than a stack trace. An expired `gh` token is by far the most
 * likely reason this script does not run, and the raw execFileSync error buries that in ten
 * lines of Node internals.
 */
function requireAuth() {
  try {
    // `gh auth status` exits 0 even when the stored token has been revoked or expired, so probe
    // an authenticated endpoint instead of trusting it.
    execFileSync('gh', ['api', 'user'], { stdio: 'pipe' });
  } catch {
    console.error('Not authenticated with GitHub.');
    console.error('');
    console.error('  gh auth login -h github.com');
    console.error('');
    console.error('The account needs admin on the repository to write rulesets.');
    process.exit(1);
  }
}

function main() {
  const REPO = args.includes('--repo') ? repoArg : detectRepo();

  requireAuth();
  console.log(`Repository: ${REPO}${dryRun ? '  (dry run — nothing will change)' : ''}`);
  console.log('');

  const declared = loadRulesets();
  if (declared.length === 0) {
    console.error(`No ruleset declarations found in ${RULESETS_DIR}`);
    process.exit(1);
  }

  const existing = gh(['api', `repos/${REPO}/rulesets`, '--jq', '[.[] | {id, name}]']) ?? [];

  for (const { file, ruleset } of declared) {
    const match = existing.find((entry) => entry.name === ruleset.name);
    console.log(`${match ? 'updating' : 'creating'} "${ruleset.name}"  (${file})`);

    if (dryRun) {
      console.log(JSON.stringify(ruleset, null, 2));
      continue;
    }

    const result = match
      ? gh(['api', '-X', 'PUT', `repos/${REPO}/rulesets/${match.id}`], ruleset)
      : gh(['api', '-X', 'POST', `repos/${REPO}/rulesets`], ruleset);
    console.log(`  → ruleset ${result.id} (${result.enforcement})`);
  }

  console.log(`\nDone. Verify at: https://github.com/${REPO}/settings/rules`);
}

// Importable by the test without shelling out to `gh`.
if (process.argv[1] === fileURLToPath(import.meta.url)) main();
