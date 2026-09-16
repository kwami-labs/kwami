import { describe, expect, it } from 'vitest';
import { isAgentIdentity } from '../../src/agent/adapters/LiveKitAdapter';

/**
 * This gate decides who the adapter trusts. Everything authoritative hangs off it: the audio it
 * auto-plays, the transcripts it emits as agent text, the pipeline state it drives the UI from,
 * and — the reason this file exists — the `tool_call` data messages it executes against the host
 * application's registered tools.
 *
 * Before the fix this defended, `RoomEvent.DataReceived` ran `handleAgentData()` for a packet from
 * ANY participant, while every other handler in the same file gated on the agent check. A second
 * participant in the room could invoke a host tool with arguments of their choosing.
 */
describe('isAgentIdentity', () => {
  describe('with an exact agentIdentity configured', () => {
    const config = { agentIdentity: 'agent-7f3a' };

    it('accepts the configured identity', () => {
      expect(isAgentIdentity('agent-7f3a', config)).toBe(true);
    });

    it('rejects an identity that merely looks agent-shaped', () => {
      // The whole point of configuring an exact identity: the heuristic would accept this.
      expect(isAgentIdentity('agent-evil', config)).toBe(false);
      expect(isAgentIdentity('agent', config)).toBe(false);
      expect(isAgentIdentity('kwami-bot', config)).toBe(false);
    });

    it('is case-sensitive, because LiveKit identities are exact strings', () => {
      expect(isAgentIdentity('AGENT-7F3A', config)).toBe(false);
    });

    it('rejects a prefix or suffix of the configured identity', () => {
      expect(isAgentIdentity('agent-7f3a-impostor', config)).toBe(false);
      expect(isAgentIdentity('agent-7f3', config)).toBe(false);
    });
  });

  describe('with an agentIdentityPrefix configured', () => {
    const config = { agentIdentityPrefix: 'kwami-agent:' };

    it('accepts an identity under the namespace', () => {
      expect(isAgentIdentity('kwami-agent:session-42', config)).toBe(true);
    });

    it('rejects anything outside the namespace', () => {
      expect(isAgentIdentity('kwami-agentX', config)).toBe(false);
      expect(isAgentIdentity('evil-kwami-agent:session-42', config)).toBe(false);
    });

    it('is ignored when an exact identity is also set', () => {
      const both = { agentIdentity: 'agent-1', agentIdentityPrefix: 'kwami-agent:' };
      expect(isAgentIdentity('kwami-agent:session-42', both)).toBe(false);
      expect(isAgentIdentity('agent-1', both)).toBe(true);
    });
  });

  describe('falling back to the name heuristic', () => {
    // Kept so deployments that predate `agentIdentity` keep working. It is a guess about a
    // self-declared string; these tests pin the guess, they do not endorse it.
    it('accepts the legacy agent-ish names', () => {
      expect(isAgentIdentity('agent-123')).toBe(true);
      expect(isAgentIdentity('Agent')).toBe(true);
      expect(isAgentIdentity('my-kwami-bot')).toBe(true);
    });

    it('rejects ordinary user identities', () => {
      expect(isAgentIdentity('user_1699999')).toBe(false);
      expect(isAgentIdentity('kwami-user-9')).toBe(false);
      expect(isAgentIdentity('')).toBe(false);
    });

    it('is satisfied by an identity an attacker can choose — which is why it is the fallback', () => {
      expect(isAgentIdentity('agent-i-am-not-really')).toBe(true);
      expect(isAgentIdentity('agent-i-am-not-really', { agentIdentity: 'agent-real' })).toBe(false);
    });
  });
});
