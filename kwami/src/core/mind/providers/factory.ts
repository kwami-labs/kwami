import type { MindConfig } from '../../../types';
import type { MindProvider, MindProviderDependencies } from './types';
import type { MindProviderType } from '../../../types';
import { LiveKitProvider } from './livekit/LiveKitProvider';
import { LiveKitAPIProvider } from './livekit-api/LiveKitAPIProvider';

export function createMindProvider(
  type: MindProviderType | undefined,
  dependencies: MindProviderDependencies,
  config: MindConfig
): MindProvider {
  switch (type ?? 'livekit') {
    case 'livekit':
      return new LiveKitProvider(dependencies, config);
    case 'livekit-api':
      return new LiveKitAPIProvider(dependencies, config);
    default:
      throw new Error(`Mind provider "${type}" is not implemented yet.`);
  }
}
