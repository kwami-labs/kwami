import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  compareReleaseDesc,
  distTagFor,
  isStableTag,
  latestReleaseTag,
  latestUnpublishedTag,
  parseRegistryVersions,
  parseReleaseTag,
  planPublish,
} from './publish-latest.mjs';

const SHA = 'a'.repeat(40);
const OTHER = 'b'.repeat(40);

/** A tree that is allowed to publish, overridable field by field. */
function ctx(overrides = {}) {
  return {
    tag: 'v2.2.0-dev.1',
    pkgName: 'kwami',
    pkgVersion: '2.2.0-dev.1',
    publishedVersions: ['2.1.0', '2.1.1'],
    headSha: SHA,
    tagSha: SHA,
    ...overrides,
  };
}

describe('parseReleaseTag', () => {
  it('parses a stable tag', () => {
    assert.deepEqual(parseReleaseTag('v2.1.1'), {
      tag: 'v2.1.1',
      version: '2.1.1',
      major: 2,
      minor: 1,
      patch: 1,
      channel: null,
      n: 0,
    });
  });

  it('parses a channel prerelease', () => {
    assert.equal(parseReleaseTag('v2.2.0-dev.1')?.channel, 'dev');
    assert.equal(parseReleaseTag('v2.2.0-rc.3')?.n, 3);
  });

  it('rejects a tag without the v prefix', () => {
    assert.equal(parseReleaseTag('2.1.1'), null);
  });
});

describe('isStableTag', () => {
  it('accepts a plain vX.Y.Z tag', () => {
    assert.equal(isStableTag('v2.1.1'), true);
  });

  it('rejects prerelease channel tags', () => {
    assert.equal(isStableTag('v2.2.0-dev.1'), false);
    assert.equal(isStableTag('v2.2.0-rc.1'), false);
  });
});

describe('distTagFor', () => {
  it('maps each channel to its npm dist-tag', () => {
    assert.equal(distTagFor('2.1.1'), 'latest');
    assert.equal(distTagFor('2.2.0-dev.1'), 'dev');
    assert.equal(distTagFor('v2.2.0-rc.1'), 'rc');
  });
});

describe('latestReleaseTag / latestUnpublishedTag', () => {
  const tags = ['v2.1.0', 'v2.2.0-dev.4', 'v2.1.1', 'v2.2.0-rc.1', 'v2.2.0-dev.1'];

  it('picks the highest release, preferring rc over dev of the same version', () => {
    assert.equal(latestReleaseTag(tags), 'v2.2.0-rc.1');
  });

  it('prefers a stable release over a prerelease of the same version', () => {
    assert.equal(latestReleaseTag(['v2.2.0-rc.2', 'v2.2.0', 'v2.2.0-dev.9']), 'v2.2.0');
  });

  it('orders by semver, not string sort — 2.10.0 beats 2.9.0', () => {
    assert.equal(latestReleaseTag(['v2.9.0', 'v2.10.0', 'v2.1.11']), 'v2.10.0');
  });

  it('skips versions already on npm and returns the newest unpublished one', () => {
    assert.equal(latestUnpublishedTag(tags, ['2.1.0', '2.1.1', '2.2.0-rc.1']), 'v2.2.0-dev.4');
  });

  it('returns null when every release is already on npm', () => {
    assert.equal(latestUnpublishedTag(['v2.1.1', 'v2.2.0-dev.1'], ['2.1.1', '2.2.0-dev.1']), null);
  });
});

describe('compareReleaseDesc', () => {
  it('sorts a mixed list newest-first', () => {
    assert.deepEqual(['v2.1.1', 'v2.2.0-dev.1', 'v2.2.0', 'v2.2.0-rc.1'].sort(compareReleaseDesc), [
      'v2.2.0',
      'v2.2.0-rc.1',
      'v2.2.0-dev.1',
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
  it('publishes a prerelease to its channel tag when npm does not have it yet', () => {
    assert.deepEqual(planPublish(ctx()), {
      ok: true,
      skip: false,
      fromWorktree: false,
      version: '2.2.0-dev.1',
      tag: 'v2.2.0-dev.1',
      distTag: 'dev',
    });
  });

  it('publishes a stable release to latest', () => {
    assert.deepEqual(
      planPublish(
        ctx({
          tag: 'v2.1.1',
          pkgVersion: '2.1.1',
          publishedVersions: ['2.1.0'],
        }),
      ),
      {
        ok: true,
        skip: false,
        fromWorktree: false,
        version: '2.1.1',
        tag: 'v2.1.1',
        distTag: 'latest',
      },
    );
  });

  it('skips when that version is already on npm', () => {
    const result = planPublish(ctx({ publishedVersions: ['2.1.1', '2.2.0-dev.1'] }));
    assert.equal(result.ok, true);
    assert.equal(result.skip, true);
    assert.match(result.reason, /already on npm/);
  });

  it('refuses a different package name', () => {
    const result = planPublish(ctx({ pkgName: 'kwami-web' }));
    assert.equal(result.ok, false);
    assert.match(result.reason, /kwami-web/);
  });

  it('skips when every release is already on npm', () => {
    const result = planPublish(ctx({ tag: null, tagSha: null }));
    assert.equal(result.ok, true);
    assert.equal(result.skip, true);
    assert.match(result.reason, /already on npm/);
  });

  it('refuses when there is no release tag and the package was never published', () => {
    const result = planPublish(ctx({ tag: null, tagSha: null, publishedVersions: [] }));
    assert.equal(result.ok, false);
    assert.match(result.reason, /No v\* release tag/);
  });

  it("refuses when the tag's package.json does not match the tag", () => {
    const result = planPublish(ctx({ pkgVersion: '2.1.1' }));
    assert.equal(result.ok, false);
    assert.match(result.reason, /2\.1\.1/);
    assert.match(result.reason, /v2\.2\.0-dev\.1/);
  });

  it('publishes from a worktree when HEAD has moved past the tag', () => {
    assert.deepEqual(planPublish(ctx({ headSha: OTHER })), {
      ok: true,
      skip: false,
      fromWorktree: true,
      version: '2.2.0-dev.1',
      tag: 'v2.2.0-dev.1',
      distTag: 'dev',
    });
  });
});
