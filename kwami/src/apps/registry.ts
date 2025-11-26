import type { Kwami } from '../core/Kwami';

export interface AppConnectorButton {
  id: string;
  name: string;
  description: string;
  icon?: string;
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
    description: 'Import playlists, connect channels, and sync audio-reactive visuals.',
    icon: '📺',
    accent: 'linear-gradient(120deg, #ff6b6b, #ffa06e)',
    actionLabel: 'Open Connector',
    onLaunch: connectExternal('https://pg.kwami.io?panel=apps&app=youtube'),
  },
  {
    id: 'wallet',
    name: 'Solana Wallet',
    description: 'Connect Phantom, Solflare, or Backpack to drive on-chain automations.',
    icon: '🪙',
    accent: 'linear-gradient(120deg, #6EE7B7, #3B82F6)',
    actionLabel: 'Open Wallet',
    onLaunch: connectExternal('https://pg.kwami.io?panel=apps&app=wallet'),
  },
  {
    id: 'agents',
    name: 'Mind Agents',
    description: 'Spin up multimodal Kwami Minds that speak, listen, and trigger automations.',
    icon: '🧠',
    accent: 'linear-gradient(120deg, #a855f7, #6366f1)',
    actionLabel: 'Launch Agents',
    onLaunch: connectExternal('https://pg.kwami.io?panel=mind'),
  },
  {
    id: 'guides',
    name: 'Integration Guides',
    description: 'Deep dives into building custom apps, actions, and automations for Kwami.',
    icon: '📚',
    accent: 'linear-gradient(120deg, #38bdf8, #34d399)',
    actionLabel: 'Open Docs',
    onLaunch: connectExternal('https://github.com/alexcolls/kwami/tree/dev/docs'),
  },
];

export function getAppConnectors(): AppConnectorButton[] {
  return DEFAULT_CONNECTORS;
}

