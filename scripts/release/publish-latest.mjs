#!/usr/bin/env node
/**
 * Publish the latest stable release to npm as `kwami@latest`.
 *
 * semantic-release already publishes when `NPM_TOKEN` is set. This is the manual path: take
 * the newest non-prerelease `v*` tag (not whatever happens to be in the working tree), build
 * those bytes (`dist/` is not committed), and `pnpm publish` them. If HEAD is not that tag,
 * the build and publish run from a detached worktree so later commits cannot leak into the
 * tarball. Idempotent if that version is already on the registry.
 *
 * Prerelease tags (`-dev`, `-rc`) are ignored — those channels are `kwami@dev` / `kwami@rc`
 * and stay on the automated pipeline.
 *
 * Run: `pnpm publish:latest`
 * Dry: `pnpm publish:dry-run`
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const PACKAGE_NAME = 'kwami';

/** A release tag that belongs on npm `latest` — `v2.1.1`, not `v2.2.0-dev.1` / `v2.2.0-rc.1`. */
export function isStableTag(tag) {
  return /^v\d+\.\d+\.\d+$/.test(tag);
}

/** Newest-first compare for `vX.Y.Z` tags. */
export function compareSemverDesc(a, b) {
  const pa = a.replace(/^v/, '').split('.').map(Number);
  const pb = b.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pb[i] - pa[i];
  }
  return 0;
}

/** @param {string[]} tags @returns {string | null} */
export function latestStableTag(tags) {
  const stable = tags.filter(isStableTag);
  if (stable.length === 0) return null;
  return [...stable].sort(compareSemverDesc)[0];
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
 * Decide whether the latest stable tag may be published as `kwami@latest`.
 *
 * @param {PublishContext} ctx
 * @returns {{ ok: true, skip: boolean, fromWorktree: boolean, version: string, tag: string, reason?: string } | { ok: false, reason: string }}
 */
export function planPublish(ctx) {
  if (ctx.pkgName !== PACKAGE_NAME) {
    return {
      ok: false,
      reason: `Refusing to publish '${ctx.pkgName}' — this script publishes the '${PACKAGE_NAME}' npm package.`,
    };
  }
  if (!ctx.tag) {
    return {
      ok: false,
      reason: 'No stable v* tag found. Fetch tags (`git fetch --tags`) or cut a release first.',
    };
  }

  const version = ctx.tag.slice(1);
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
      reason: `${PACKAGE_NAME}@${version} is already on npm.`,
    };
  }
  return {
    ok: true,
    skip: false,
    fromWorktree: ctx.headSha !== ctx.tagSha,
    version,
    tag: ctx.tag,
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
  if (env.GITHUB_ACTIONS !== 'true') env.NPM_CONFIG_PROVENANCE = 'false';
  return env;
}

function publishArgs(dryRun) {
  const args = ['publish', '--access', 'public', '--tag', 'latest'];
  if (dryRun) args.push('--dry-run');
  return args;
}

function publishInPlace(dryRun) {
  run('pnpm', ['build']);
  run('pnpm', publishArgs(dryRun), { env: publishEnv() });
}

function publishFromWorktree(tag, dryRun) {
  const dir = mkdtempSync(join(tmpdir(), 'kwami-publish-'));
  try {
    run('git', ['worktree', 'add', '--detach', dir, tag]);
    run('pnpm', ['install', '--frozen-lockfile'], { cwd: dir });
    run('pnpm', ['build'], { cwd: dir });
    run('pnpm', publishArgs(dryRun), { cwd: dir, env: publishEnv() });
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
  const tag = latestStableTag(tags);
  const pkg = tag ? packageAt(tag) : { name: '', version: '' };
  const plan = planPublish({
    tag,
    pkgName: pkg.name,
    pkgVersion: pkg.version,
    publishedVersions: registryVersions(PACKAGE_NAME),
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
      `to npm (dist-tag latest)${plan.fromWorktree ? ` from ${plan.tag}` : ''}.`,
  );

  if (plan.fromWorktree) publishFromWorktree(plan.tag, dryRun);
  else publishInPlace(dryRun);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) main();
