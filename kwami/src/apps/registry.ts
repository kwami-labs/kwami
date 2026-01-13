import type { Kwami } from '../core/Kwami';
import { getYouTubeConnector, type YouTubeConfig } from './youtube';
import { logger } from '../utils/logger';
import { createIcon } from '../ui/components/Icon';

export interface AppConnectorButton {
  id: string;
  name: string;
  description: string;
  icon?: string | HTMLElement;
  accent?: string;
  docsUrl?: string;
  actionLabel?: string;
  onLaunch?: (ctx: { kwami?: Kwami }) => Promise<void> | void;
}

const connectExternal = (url: string) => () => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

const DEFAULT_CONNECTORS: AppConnectorButton[] = [
  {
    id: 'youtube',
    name: 'YouTube Studio',
    description: 'Connect your channel to import playlists and drive Kwami with video audio.',
    icon: createIcon({ name: 'heroicons:tv', size: 'md' }).element,
    accent: 'linear-gradient(120deg, #ff6b6b, #ffa06e)',
    actionLabel: 'Connect',
    onLaunch: async ({ kwami }) => {
      if (typeof window === 'undefined') {
        logger.warn('[Kwami] YouTube connector requires a browser environment.');
        return;
      }

      const config = extractYouTubeConfig(kwami);
      const connector = getYouTubeConnector(config);

      const initialized = await connector.initialize();
      if (!initialized) {
        logger.warn('[Kwami] Missing YouTube credentials. Provide clientId/apiKey when calling getYouTubeConnector().');
        return;
      }

      const auth = await connector.signIn();
      if (auth.success) {
        logger.info('[Kwami] Connected to YouTube as', auth.user?.email ?? auth.user?.name ?? 'unknown user');
      } else {
        logger.error('[Kwami] YouTube sign-in failed:', auth.error);
      }
    },
  },
  {
    id: 'wallet',
    name: 'Solana Wallet',
    description: 'Connect Phantom, Solflare, or Backpack to drive on-chain automations.',
    icon: createIcon({ name: 'heroicons:currency-dollar', size: 'md' }).element,
    accent: 'linear-gradient(120deg, #6EE7B7, #3B82F6)',
    actionLabel: 'Open Wallet',
    onLaunch: connectExternal('https://pg.kwami.io?panel=apps&app=wallet'),
  },
  {
    id: 'agents',
    name: 'Mind Agents',
    description: 'Spin up multimodal Kwami Minds that speak, listen, and trigger automations.',
    icon: createIcon({ name: 'heroicons:cpu-chip', size: 'md' }).element,
    accent: 'linear-gradient(120deg, #a855f7, #6366f1)',
    actionLabel: 'Launch Agents',
    onLaunch: connectExternal('https://pg.kwami.io?panel=mind'),
  },
  {
    id: 'guides',
    name: 'Integration Guides',
    description: 'Deep dives into building custom apps, actions, and automations for Kwami.',
    icon: createIcon({ name: 'heroicons:book-open', size: 'md' }).element,
    accent: 'linear-gradient(120deg, #38bdf8, #34d399)',
    actionLabel: 'Open Docs',
    onLaunch: connectExternal('https://github.com/alexcolls/kwami/tree/dev/docs'),
  },
];

export function getAppConnectors(): AppConnectorButton[] {
  return DEFAULT_CONNECTORS;
}

function extractYouTubeConfig(kwami?: Kwami): YouTubeConfig | undefined {
  const appsConfig = kwami?.getAppsConfig?.();
  return appsConfig?.youtube;
}

