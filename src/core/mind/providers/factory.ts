import type { MindConfig } from '../../../types';
import type { MindProvider, MindProviderDependencies, MindProviderType } from './types';
import { ElevenLabsProvider } from '../11labs/ElevenLabsProvider';

export function createMindProvider(
  type: MindProviderType | undefined,
  dependencies: MindProviderDependencies,
  config: MindConfig
): MindProvider {
  switch (type ?? 'elevenlabs') {
    case 'elevenlabs':
      return new ElevenLabsProvider(dependencies, config);
    default:
      throw new Error(`Mind provider "${type}" is not implemented yet.`);
  }
}

