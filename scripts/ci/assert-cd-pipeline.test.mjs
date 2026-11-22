import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const read = (relative) => readFileSync(new URL(`../../${relative}`, import.meta.url), 'utf8');

const cd = read('.github/workflows/cd.yml');
const release = read('.github/workflows/release.yml');
const channel = read('.github/workflows/release-channel.yml');

describe('the production CD pipeline', () => {
  it('runs after a green push to main, not on the prerelease channels', () => {
    assert.match(cd, /workflows:\s*\[ci\]/);
    assert.match(cd, /branches:\s*\[main\]/);
    assert.match(cd, /publish_latest:\s*true/);
    assert.doesNotMatch(cd, /branches:\s*\[[^\]]*(dev|stg)/);
  });

  it('delegates the release job to the shared channel workflow', () => {
    assert.match(cd, /uses:\s*\.\/\.github\/workflows\/release-channel\.yml/);
    assert.match(channel, /workflow_call/);
    assert.match(channel, /pnpm publish:latest/);
  });
});

// The channel rulesets only let repository admins and deploy keys push directly, so a release
// that pushes with GITHUB_TOKEN dies on GH013 after it has already cut the version locally.
describe('the release push', () => {
  it('checks out with the release deploy key from the guarded environment', () => {
    assert.match(channel, /environment:\s*release/);
    assert.match(channel, /ssh-key:\s*\$\{\{\s*secrets\.RELEASE_DEPLOY_KEY\s*\}\}/);
    assert.match(channel, /persist-credentials:\s*true/);
    assert.doesNotMatch(channel, /x-access-token/);
  });

  it('points semantic-release at the SSH remote rather than the HTTPS package URL', () => {
    assert.match(
      channel,
      /pnpm release --repository-url "git@github\.com:\$\{GITHUB_REPOSITORY\}\.git"/,
    );
  });

  it('is handed the key by both callers', () => {
    for (const caller of [cd, release]) {
      assert.match(caller, /RELEASE_DEPLOY_KEY:\s*\$\{\{\s*secrets\.RELEASE_DEPLOY_KEY\s*\}\}/);
    }
  });

  // A deploy-key push triggers workflows; only the marker stops the release re-running itself.
  it('keeps [skip actions] on the release and back-merge commits', () => {
    assert.match(
      read('.releaserc.cjs'),
      /chore\(release\): \$\{nextRelease\.version\} \[skip actions\]/,
    );
    assert.match(read('scripts/release/sync-branches.mjs'), /after release \[skip actions\]/);
  });
});

describe('the prerelease workflow', () => {
  it('keeps main out so CD is the only stable publisher', () => {
    assert.match(release, /workflows:\s*\[ci\]/);
    assert.match(release, /branches:\s*\[dev, stg\]/);
    assert.doesNotMatch(release, /branches:\s*\[[^\]]*main/);
    assert.match(release, /uses:\s*\.\/\.github\/workflows\/release-channel\.yml/);
    assert.doesNotMatch(release, /publish_latest:\s*true/);
  });
});
