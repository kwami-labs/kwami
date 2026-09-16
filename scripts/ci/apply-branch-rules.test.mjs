import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadRulesets, withoutAppBypass, withResolvedAppId } from './apply-branch-rules.mjs';

const byName = Object.fromEntries(loadRulesets().map(({ ruleset }) => [ruleset.name, ruleset]));

const rule = (ruleset, type) => ruleset.rules.find((r) => r.type === type);
const checks = (ruleset) =>
  rule(ruleset, 'required_status_checks').parameters.required_status_checks.map((c) => c.context);

describe('the committed rulesets', () => {
  it('declares one per channel, plus the tags', () => {
    assert.deepEqual(Object.keys(byName).sort(), [
      'dev protection',
      'main protection',
      'release tags',
      'stg protection',
    ]);
  });

  it('enforces every one of them, rather than leaving it in evaluate mode', () => {
    for (const [name, ruleset] of Object.entries(byName)) {
      assert.equal(ruleset.enforcement, 'active', `${name} is not active`);
    }
  });

  // The whole point of the aggregate job in ci.yml: one check to require, not six that have to
  // be re-added by name whenever a job is renamed.
  it('requires `ci gate` on every channel', () => {
    for (const name of ['dev protection', 'stg protection', 'main protection']) {
      assert.ok(checks(byName[name]).includes('ci gate'), `${name} does not require ci gate`);
    }
  });

  // dev lets any feature branch in, so requiring the promotion gate there only adds a wait.
  it('requires the promotion gate on stg and main, but not on dev', () => {
    assert.ok(checks(byName['stg protection']).includes('enforce promotion path'));
    assert.ok(checks(byName['main protection']).includes('enforce promotion path'));
    assert.ok(!checks(byName['dev protection']).includes('enforce promotion path'));
  });

  it('demands a Code Owner review on main only', () => {
    const codeOwners = (name) => rule(byName[name], 'pull_request').parameters.require_code_owner_review;
    assert.equal(codeOwners('main protection'), true);
    assert.equal(codeOwners('stg protection'), false);
    assert.equal(codeOwners('dev protection'), false);
  });

  // Squash into dev so the PR title becomes the released subject; merge commits upward so the
  // individual subjects survive into the higher channel's changelog.
  it('allows squash into dev and merge commits into stg and main', () => {
    const methods = (name) => rule(byName[name], 'pull_request').parameters.allowed_merge_methods;
    assert.deepEqual(methods('dev protection'), ['squash']);
    assert.deepEqual(methods('stg protection'), ['merge']);
    assert.deepEqual(methods('main protection'), ['merge']);
  });

  it('blocks force pushes and deletion on every channel', () => {
    for (const name of ['dev protection', 'stg protection', 'main protection']) {
      assert.ok(rule(byName[name], 'deletion'), `${name} allows deletion`);
      assert.ok(rule(byName[name], 'non_fast_forward'), `${name} allows a force push`);
    }
  });
});

describe('the tag ruleset', () => {
  const tags = byName['release tags'];

  it('covers the v* tags semantic-release cuts', () => {
    assert.equal(tags.target, 'tag');
    assert.deepEqual(tags.conditions.ref_name.include, ['refs/tags/v*']);
  });

  // Creation is deliberately NOT blocked — semantic-release cuts a new tag on every release.
  // What is blocked is changing one after the fact.
  it('blocks deleting, moving or force-updating a released tag', () => {
    assert.deepEqual(
      tags.rules.map((r) => r.type).sort(),
      ['deletion', 'non_fast_forward', 'update'],
    );
  });

  // Every version, changelog entry and "what shipped" answer is derived from these tags, and
  // nothing in the release flow ever needs to move one.
  it('gives nobody a bypass, the release bot included', () => {
    assert.deepEqual(tags.bypass_actors, []);
  });
});

describe('withResolvedAppId', () => {
  const ruleset = {
    name: 'x',
    bypass_actors: [
      { actor_id: 5, actor_type: 'RepositoryRole', bypass_mode: 'always' },
      { actor_id: 15368, actor_type: 'Integration', bypass_mode: 'always' },
    ],
  };

  it('repoints the Integration actor at the resolved id', () => {
    const actors = withResolvedAppId(ruleset, 99).bypass_actors;
    assert.equal(actors.find((a) => a.actor_type === 'Integration').actor_id, 99);
  });

  it('leaves every other actor alone', () => {
    const actors = withResolvedAppId(ruleset, 99).bypass_actors;
    assert.deepEqual(actors.find((a) => a.actor_type === 'RepositoryRole'), {
      actor_id: 5,
      actor_type: 'RepositoryRole',
      bypass_mode: 'always',
    });
  });

  it('does not mutate the declaration it was handed', () => {
    withResolvedAppId(ruleset, 99);
    assert.equal(ruleset.bypass_actors[1].actor_id, 15368);
  });

  it('passes a ruleset with no bypass actors straight through', () => {
    const tags = { name: 'release tags', bypass_actors: [] };
    assert.equal(withResolvedAppId(tags, 99), tags);
  });
});

describe('withoutAppBypass', () => {
  it('drops the app but keeps the admin, for the 422 fallback', () => {
    const stripped = withoutAppBypass({
      bypass_actors: [
        { actor_id: 5, actor_type: 'RepositoryRole' },
        { actor_id: 15368, actor_type: 'Integration' },
      ],
    });
    assert.deepEqual(stripped.bypass_actors, [{ actor_id: 5, actor_type: 'RepositoryRole' }]);
  });

  it('tolerates a ruleset that declares none', () => {
    assert.deepEqual(withoutAppBypass({ name: 'x' }).bypass_actors, []);
  });
});
