import type { MindConfig } from '../../../types';
import type { MindProvider, MindProviderDependencies } from './types';
import type { MindProviderType } from '../../../types';
import { ElevenLabsProvider } from './elevenlabs/ElevenLabsProvider';
import { OpenAIProvider } from './openai/OpenAIProvider';

export function createMindProvider(
  type: MindProviderType | undefined,
  dependencies: MindProviderDependencies,
  config: MindConfig
): MindProvider {
  switch (type ?? 'elevenlabs') {
    case 'elevenlabs':
      return new ElevenLabsProvider(dependencies, config);
    case 'openai':
      return new OpenAIProvider(dependencies, config);
    default:
      throw new Error(`Mind provider "${type}" is not implemented yet.`);
  }
}
