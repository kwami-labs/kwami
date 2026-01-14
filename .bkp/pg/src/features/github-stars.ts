/**
 * GitHub Stars
 *
 * Fetches and displays GitHub star count for the project.
 */

import { API_CONFIG } from '../core/config.js';
import { githubStarState } from '../core/state-manager.js';

async function fetchGitHubStars(): Promise<void> {
  const now = Date.now();
  if (now - githubStarState.lastFetchedAt < 5 * 60 * 1000) {
    return;
  }

  const starCountElement = document.getElementById('star-count');
  if (!starCountElement) {
    console.warn('Star count element not found; skipping fetch');
    return;
  }

  starCountElement.textContent = '…';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(API_CONFIG.GITHUB_API_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'kwami-playground',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }

    const data = (await response.json()) as { stargazers_count?: unknown };
    const stars = data?.stargazers_count;

    if (typeof stars === 'number' && Number.isFinite(stars)) {
      starCountElement.textContent = stars.toLocaleString();
      githubStarState.lastFetchedAt = now;
    } else {
      throw new Error('Invalid star count in response');
    }
  } catch (error) {
    console.warn('Failed to fetch GitHub stars:', error);
    starCountElement.textContent = 'N/A';
    starCountElement.title = 'Unable to fetch star count';
  } finally {
    clearTimeout(timeoutId);
  }
}

export function initializeGitHubStarButton(): void {
  if (githubStarState.initialized) {
    return;
  }

  const starButton = document.getElementById('github-star-btn');
  const starCountElement = document.getElementById('star-count');

  if (!starButton || !starCountElement) {
    console.warn('GitHub star button elements missing; skipping initialization');
    return;
  }

  starButton.addEventListener('mouseenter', () => {
    fetchGitHubStars().catch(() => {
      // errors handled in fetchGitHubStars
    });
  }, { once: true });

  starButton.addEventListener('focus', () => {
    fetchGitHubStars().catch(() => {
      // errors handled in fetchGitHubStars
    });
  }, { once: true });

  fetchGitHubStars().catch(() => {
    // errors handled in fetchGitHubStars
  });

  githubStarState.initialized = true;
}
