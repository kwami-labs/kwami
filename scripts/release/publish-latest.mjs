#!/usr/bin/env node
/**
 * Publish the newest unpublished `v*` release to the `kwami` npm package.
 *
 * semantic-release already publishes when `NPM_TOKEN` is set. This is the manual path: take
 * the newest release tag that is not on the registry (not whatever happens to be in the
 * working tree), build those bytes (`dist/` is not committed), and `pnpm publish` them with
 * the channel dist-tag (`latest` / `dev` / `rc`). If HEAD is not that tag, the build and
 * publish run from a detached worktree so later commits cannot leak into the tarball.
 * Idempotent if every release tag is already on the registry.
 *
 * Run: `pnpm publish:latest`
 * Dry: `pnpm publish:dry-run`
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const PACKAGE_NAME = 'kwami';
const RELEASE_TAG = /^v(\d+)\.(\d+)\.(\d+)(?:-([a-z]+)\.(\d+))?$/;

/**
 * @typedef {object} Release
 * @property {string} tag
 * @property {string} version
 * @property {number} major
 * @property {number} minor
 * @property {number} patch
 * @property {string | null} channel
 * @property {number} n
 */

/** @param {string} tag @returns {Release | null} */
export function parseReleaseTag(tag) {
  const match = RELEASE_TAG.exec(tag);
  if (!match) return null;
  return {
    tag,
    version: tag.slice(1),
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    channel: match[4] ?? null,
    n: match[5] !== undefined && match[5] !== null ? Number(match[5]) : 0,
  };
}

/** A release tag that belongs on npm `latest` — `v2.1.1`, not `v2.2.0-dev.1`. */
export function isStableTag(tag) {
  const parsed = parseReleaseTag(tag);
  return Boolean(parsed && parsed.channel === null);
}

/** Dist-tag for a version: `2.2.0` → `latest`, `2.2.0-dev.1` → `dev`, `2.2.0-rc.1` → `rc`. */
export function distTagFor(version) {
  const parsed = parseReleaseTag(version.startsWith('v') ? version : `v${version}`);
  return parsed?.channel ?? 'latest';
}

/**
 * Newest-first. A stable X.Y.Z beats any prerelease of X.Y.Z; `rc` beats `dev`.
 * @param {string} aTag
 * @param {string} bTag
 */
export function compareReleaseDesc(aTag, bTag) {
  const a = parseReleaseTag(aTag);
  const b = parseReleaseTag(bTag);
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  if (a.major !== b.major) return b.major - a.major;
  if (a.minor !== b.minor) return b.minor - a.minor;
  if (a.patch !== b.patch) return b.patch - a.patch;
  if (a.channel === b.channel) return b.n - a.n;
  if (!a.channel) return -1;
  if (!b.channel) return 1;
  return b.channel.localeCompare(a.channel);
}

/** @param {string[]} tags @returns {string | null} */
export function latestReleaseTag(tags) {
  const known = tags.filter((tag) => parseReleaseTag(tag));
  if (known.length === 0) return null;
  return [...known].sort(compareReleaseDesc)[0];
}

/**
 * Newest release that is not yet on the registry.
 * @param {string[]} tags
 * @param {string[]} publishedVersions
 * @returns {string | null}
 */
export function latestUnpublishedTag(tags, publishedVersions) {
  const published = new Set(publishedVersions);
  const unpublished = tags.filter((tag) => {
    const parsed = parseReleaseTag(tag);
    return parsed && !published.has(parsed.version);
  });
  return latestReleaseTag(unpublished);
}

/**
 * @typedef {object} PublishContext
 * @property {string | null} tag
 * @property {string} pkgName
 * @property {string} pkgVersion
 * @property {string[]} publishedVersions
 * @property {string} headSha
 * @property {string | null} tagSha
 */

/**
 * Decide whether `tag` may be published to the `kwami` npm package.
 *
 * @param {PublishContext} ctx
 * @returns {{ ok: true, skip: boolean, fromWorktree: boolean, version: string, tag: string, distTag: string, reason?: string } | { ok: false, reason: string }}
 */
export function planPublish(ctx) {
  if (ctx.pkgName !== PACKAGE_NAME) {
    return {
      ok: false,
      reason: `Refusing to publish '${ctx.pkgName}' — this script publishes the '${PACKAGE_NAME}' npm package.`,
    };
  }
  if (!ctx.tag) {
    if (ctx.publishedVersions.length > 0) {
      return {
        ok: true,
        skip: true,
        fromWorktree: false,
        version: '',
        tag: '',
        distTag: 'latest',
        reason: 'Every v* release is already on npm.',
      };
    }
    return {
      ok: false,
      reason: 'No v* release tag found. Fetch tags (`git fetch --tags`) or cut a release first.',
    };
  }

  const version = ctx.tag.slice(1);
  const distTag = distTagFor(version);
  if (ctx.pkgVersion !== version) {
    return {
      ok: false,
      reason: `${ctx.tag}'s package.json is ${ctx.pkgVersion}, expected ${version}.`,
    };
  }
  if (!ctx.tagSha) {
    return { ok: false, reason: `Could not resolve ${ctx.tag} to a commit.` };
  }
  if (ctx.publishedVersions.includes(version)) {
    return {
      ok: true,
      skip: true,
      fromWorktree: false,
      version,
      tag: ctx.tag,
      distTag,
      reason: `${PACKAGE_NAME}@${version} is already on npm.`,
    };
  }
  return {
    ok: true,
    skip: false,
    fromWorktree: ctx.headSha !== ctx.tagSha,
    version,
    tag: ctx.tag,
    distTag,
  };
}

function git(args, { allowFailure = false } = {}) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
  } catch (error) {
    if (allowFailure) return null;
    throw error;
  }
}

function run(command, args, { cwd, env = process.env } = {}) {
  execFileSync(command, args, { stdio: 'inherit', cwd, env });
}

/** Versions of `name` already on the registry. An unpublished package is an empty list. */
export function parseRegistryVersions(stdout) {
  const parsed = JSON.parse(stdout);
  if (parsed === null || parsed === undefined) return [];
  return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
}

function registryVersions(name) {
  const result = spawnSync('pnpm', ['view', name, 'versions', '--json'], { encoding: 'utf8' });
  if (result.status === 0) {
    return parseRegistryVersions(result.stdout);
  }
  const err = `${result.stderr ?? ''}${result.stdout ?? ''}`;
  if (/E404|404 Not Found/i.test(err)) return [];
  throw new Error(`Could not query npm for ${name}: ${err.trim() || `exit ${result.status}`}`);
}

function packageAt(ref) {
  const source = git(['show', `${ref}:package.json`], { allowFailure: true });
  if (!source) return { name: '', version: '' };
  return JSON.parse(source);
}

function publishEnv() {
  const env = { ...process.env };
  // `publishConfig.provenance` is for the GitHub Actions OIDC attestation. A laptop cannot
  // mint that, and leaving the flag on makes a local publish fail before it reaches the registry.
  if (env.GITHUB_ACTIONS !== 'true') {
    env.NPM_CONFIG_PROVENANCE = 'false';
    env.npm_config_provenance = 'false';
  }
  return env;
}

/** Turn off `publishConfig.provenance` in a temp tree so npm does not demand OIDC. */
function disableProvenanceInPackage(dir) {
  const path = join(dir, 'package.json');
  const pkg = JSON.parse(readFileSync(path, 'utf8'));
  if (!pkg.publishConfig?.provenance) return;
  pkg.publishConfig.provenance = false;
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
}

function publishArgs(dryRun, distTag, { noGitChecks = false } = {}) {
  const args = ['publish', '--access', 'public', '--tag', distTag];
  if (dryRun) args.push('--dry-run');
  // A detached worktree is not on main; we already pinned the exact release tag.
  if (noGitChecks) args.push('--no-git-checks');
  return args;
}

function runPublish(dryRun, distTag, { cwd, noGitChecks = false } = {}) {
  const env = publishEnv();
  // Local publishes go through npm so `--provenance=false` actually overrides
  // `publishConfig.provenance`. pnpm's publish wrapper still forwards that field.
  if (env.GITHUB_ACTIONS !== 'true') {
    if (cwd) disableProvenanceInPackage(cwd);
    const args = ['publish', '--access', 'public', '--tag', distTag, '--provenance=false'];
    if (dryRun) args.push('--dry-run');
    run('npm', args, { cwd, env });
    return;
  }
  run('pnpm', publishArgs(dryRun, distTag, { noGitChecks }), { cwd, env });
}

function publishInPlace(dryRun, distTag) {
  run('pnpm', ['build']);
  runPublish(dryRun, distTag);
}

function publishFromWorktree(tag, dryRun, distTag) {
  const dir = mkdtempSync(join(tmpdir(), 'kwami-publish-'));
  try {
    run('git', ['worktree', 'add', '--detach', dir, tag]);
    run('pnpm', ['install', '--frozen-lockfile'], { cwd: dir });
    run('pnpm', ['build'], { cwd: dir });
    runPublish(dryRun, distTag, { cwd: dir, noGitChecks: true });
  } finally {
    try {
      execFileSync('git', ['worktree', 'remove', '--force', dir], { stdio: 'inherit' });
    } catch {
      rmSync(dir, { recursive: true, force: true });
      execFileSync('git', ['worktree', 'prune'], { stdio: 'ignore' });
    }
  }
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  const tags = git(['tag', '--list', 'v*'])
    .split('\n')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const published = registryVersions(PACKAGE_NAME);
  const tag = latestUnpublishedTag(tags, published);
  const pkg = tag ? packageAt(tag) : { name: PACKAGE_NAME, version: '' };
  const plan = planPublish({
    tag,
    pkgName: pkg.name || PACKAGE_NAME,
    pkgVersion: pkg.version,
    publishedVersions: published,
    headSha: git(['rev-parse', 'HEAD']),
    tagSha: tag ? git(['rev-parse', `${tag}^{commit}`], { allowFailure: true }) : null,
  });

  if (!plan.ok) {
    console.error(`error: ${plan.reason}`);
    process.exit(1);
  }
  if (plan.skip) {
    console.log(plan.reason);
    return;
  }

  console.log(
    `${dryRun ? 'Dry-run: would publish' : 'Publishing'} ${PACKAGE_NAME}@${plan.version} ` +
      `to npm (dist-tag ${plan.distTag})${plan.fromWorktree ? ` from ${plan.tag}` : ''}.`,
  );

  if (plan.fromWorktree) publishFromWorktree(plan.tag, dryRun, plan.distTag);
  else publishInPlace(dryRun, plan.distTag);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) main();
