import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  compareSemverDesc,
  isStableTag,
  latestStableTag,
  parseRegistryVersions,
  planPublish,
} from './publish-latest.mjs';

const SHA = 'a'.repeat(40);
const OTHER = 'b'.repeat(40);

/** A tree that is allowed to publish, overridable field by field. */
function ctx(overrides = {}) {
  return {
    tag: 'v2.1.1',
    pkgName: 'kwami',
    pkgVersion: '2.1.1',
    publishedVersions: ['2.1.0'],
    headSha: SHA,
    tagSha: SHA,
    ...overrides,
  };
}

describe('isStableTag', () => {
  it('accepts a plain vX.Y.Z tag', () => {
    assert.equal(isStableTag('v2.1.1'), true);
  });

  it('rejects prerelease channel tags', () => {
    assert.equal(isStableTag('v2.2.0-dev.1'), false);
    assert.equal(isStableTag('v2.2.0-rc.1'), false);
  });

  it('rejects a tag without the v prefix', () => {
    assert.equal(isStableTag('2.1.1'), false);
  });
});

describe('latestStableTag', () => {
  it('picks the highest stable tag and ignores prereleases', () => {
    assert.equal(latestStableTag(['v2.1.0', 'v2.2.0-dev.4', 'v2.1.1', 'v2.2.0-rc.1']), 'v2.1.1');
  });

  it('orders by semver, not string sort — 2.10.0 beats 2.9.0', () => {
    assert.equal(latestStableTag(['v2.9.0', 'v2.10.0', 'v2.1.11']), 'v2.10.0');
  });

  it('returns null when only prereleases exist', () => {
    assert.equal(latestStableTag(['v2.2.0-dev.1', 'v2.2.0-rc.1']), null);
  });
});

describe('compareSemverDesc', () => {
  it('sorts a mixed list newest-first', () => {
    assert.deepEqual(['v2.1.1', 'v2.10.0', 'v2.2.0'].sort(compareSemverDesc), [
      'v2.10.0',
      'v2.2.0',
      'v2.1.1',
    ]);
  });
});

describe('parseRegistryVersions', () => {
  it('accepts the array npm returns once a package has several versions', () => {
    assert.deepEqual(parseRegistryVersions('["2.1.0","2.1.1"]'), ['2.1.0', '2.1.1']);
  });

  it('wraps the single-string form a first publish returns', () => {
    assert.deepEqual(parseRegistryVersions('"2.1.0"'), ['2.1.0']);
  });
});

describe('planPublish', () => {
  it('publishes in place when HEAD is the latest stable tag and npm does not have it yet', () => {
    assert.deepEqual(planPublish(ctx()), {
      ok: true,
      skip: false,
      fromWorktree: false,
      version: '2.1.1',
      tag: 'v2.1.1',
    });
  });

  it('skips when that version is already on npm', () => {
    const result = planPublish(ctx({ publishedVersions: ['2.1.0', '2.1.1'] }));
    assert.equal(result.ok, true);
    assert.equal(result.skip, true);
    assert.match(result.reason, /already on npm/);
  });

  it('refuses a different package name', () => {
    const result = planPublish(ctx({ pkgName: 'kwami-web' }));
    assert.equal(result.ok, false);
    assert.match(result.reason, /kwami-web/);
  });

  it('refuses when there is no stable tag', () => {
    const result = planPublish(ctx({ tag: null, tagSha: null }));
    assert.equal(result.ok, false);
    assert.match(result.reason, /No stable v\* tag/);
  });

  it("refuses when the tag's package.json does not match the tag", () => {
    const result = planPublish(ctx({ pkgVersion: '2.1.0' }));
    assert.equal(result.ok, false);
    assert.match(result.reason, /2\.1\.0/);
    assert.match(result.reason, /v2\.1\.1/);
  });

  it('publishes from a worktree when HEAD has moved past the tag', () => {
    assert.deepEqual(planPublish(ctx({ headSha: OTHER })), {
      ok: true,
      skip: false,
      fromWorktree: true,
      version: '2.1.1',
      tag: 'v2.1.1',
    });
  });
});
