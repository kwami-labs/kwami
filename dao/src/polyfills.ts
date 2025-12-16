/**
 * Browser polyfills for Node.js globals required by Solana/crypto stack.
 * IMPORTANT: This file must be imported FIRST, before any other dependencies.
 */
import { Buffer } from 'buffer';
import process from 'process';

// Set up global references
const g = globalThis as any;

// Critical: Set up Buffer before any crypto dependencies initialize
g.global = g;
g.Buffer = Buffer;
g.process = process;

// Ensure process.env exists
if (!g.process.env) {
  g.process.env = {};
}

// Mark as browser environment
if (g.process.browser == null) {
  g.process.browser = true;
}

// Set process.version (readable-stream checks this at import time)
if (typeof g.process.version !== 'string' || g.process.version.length === 0) {
  g.process.version = 'v22.0.0';
}

// Export for explicit imports if needed
export { Buffer, process };
