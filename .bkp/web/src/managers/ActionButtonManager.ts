/**
 * Action Button Manager
 * Handles button clicks and navigation to different actions
 */

import { t } from '../i18n';

interface ActionConfig {
  url?: string;
  copy?: string;
  message: string;
}

const PLAYGROUND_URL = 'https://pg.kwami.io';

export const ACTION_ROUTES: Record<string, ActionConfig> = {
  'launch-playground': {
    url: PLAYGROUND_URL,
    message: t('action_feedback.launch_playground')
  },
  'view-demo': {
    url: `${PLAYGROUND_URL}?view=demo`,
    message: t('action_feedback.view_demo')
  },
  'run-playground': {
    copy: 'npm run playground',
    message: t('action_feedback.run_playground')
  },
  'swap-sidebars': {
    url: `${PLAYGROUND_URL}?panel=layout`,
    message: t('action_feedback.swap_sidebars')
  },
  'init-mind': {
    url: `${PLAYGROUND_URL}?panel=mind#initialize`,
    message: t('action_feedback.init_mind')
  },
  'randomize-blob': {
    url: `${PLAYGROUND_URL}?panel=body&action=randomize-blob`,
    message: t('action_feedback.randomize_blob')
  },
  'apply-soul': {
    url: `${PLAYGROUND_URL}?panel=soul&action=apply`,
    message: t('action_feedback.apply_soul')
  },
  'test-listening': {
    url: `${PLAYGROUND_URL}?action=test-listening`,
    message: t('action_feedback.test_listening')
  },
  'set-background': {
    url: `${PLAYGROUND_URL}?panel=body&action=background`,
    message: t('action_feedback.set_background')
  },
  'speak': {
    url: `${PLAYGROUND_URL}?action=speak`,
    message: t('action_feedback.speak')
  },
  'switch-provider': {
    url: 'https://github.com/alexcolls/kwami/blob/dev/docs/api/kwami.md#mindprovider',
    message: t('action_feedback.switch_provider')
  },
  'adjust-spikes': {
    url: `${PLAYGROUND_URL}?panel=body&action=spikes`,
    message: t('action_feedback.adjust_spikes')
  },
  'download-glb': {
    url: `${PLAYGROUND_URL}?action=download-glb`,
    message: t('action_feedback.download_glb')
  },
  'test-thinking': {
    url: `${PLAYGROUND_URL}?action=test-thinking`,
    message: t('action_feedback.test_thinking')
  },
  'upload-audio': {
    url: `${PLAYGROUND_URL}?action=upload-audio`,
    message: t('action_feedback.upload_audio')
  },
  'connect-services': {
    url: 'https://quami.io',
    message: t('action_feedback.connect_services')
  },
  'mint-nft': {
    url: 'https://candy.kwami.io',
    message: t('action_feedback.mint_nft')
  },
  'view-roadmap': {
    url: 'https://github.com/alexcolls/kwami/blob/dev/STATUS.md',
    message: t('action_feedback.view_roadmap')
  },
  'open-guides': {
    url: 'https://github.com/alexcolls/kwami/tree/dev/docs',
    message: t('action_feedback.open_guides')
  },
  'join-discord': {
    url: 'https://discord.gg/kwami',
    message: t('action_feedback.join_discord')
  },
  'contact-team': {
    url: 'mailto:hello@kwami.io?subject=Kwami%20Enterprise',
    message: t('action_feedback.contact_team')
  },
  'create-session': {
    url: `${PLAYGROUND_URL}?action=start-session`,
    message: t('action_feedback.create_session')
  }
};

export class ActionButtonManager {
  private buttons: NodeListOf<HTMLButtonElement>;

  constructor() {
    this.buttons = document.querySelectorAll('[data-action-key]');
    if (!this.buttons.length) return;
    this.attachListeners();
  }

  private attachListeners() {
    this.buttons.forEach(button => {
      button.addEventListener('click', this.handleClick.bind(this));
    });
  }

  private async handleClick(event: Event) {
    event.preventDefault();
    const button = event.currentTarget as HTMLButtonElement;
    const key = button.dataset.actionKey;
    if (!key) return;
    const config = ACTION_ROUTES[key];
    if (!config) return;

    button.classList.add('triggered');
    window.setTimeout(() => button.classList.remove('triggered'), 400);

    if (config.copy) {
      const success = await this.copyToClipboard(config.copy);
      this.showFeedback(button, success ? config.message : 'Copy unavailable');
      return;
    }

    if (config.url) {
      window.open(config.url, '_blank', 'noopener,noreferrer');
    }

    this.showFeedback(button, config.message);
  }

  private async copyToClipboard(value: string): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (error) {
      console.warn('Clipboard API failed, attempting fallback', error);
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      textarea.remove();
      return success;
    } catch (error) {
      console.error('Fallback clipboard copy failed', error);
      return false;
    }
  }

  private showFeedback(button: HTMLElement, message: string) {
    const existing = button.querySelector('.action-feedback');
    if (existing) {
      existing.remove();
    }
    const note = document.createElement('span');
    note.className = 'action-feedback';
    note.textContent = message;
    button.appendChild(note);
    window.setTimeout(() => {
      note.remove();
    }, 1400);
  }
}

