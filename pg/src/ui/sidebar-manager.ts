/**
 * Sidebar Manager
 * 
 * Manages the rotating 3-section sidebar system (Mind/Body/Soul)
 */

import type { SidebarSection } from '../types/index.js';

import { sidebarState, sectionLabels } from '../core/state-manager.js';
import { UI_CONFIG } from '../core/config.js';

type SidebarSide = 'left' | 'right';
type SidebarRenderHook = (side: SidebarSide, section: SidebarSection) => void;

let sidebarRenderHook: SidebarRenderHook | null = null;

export function setSidebarRenderHook(hook: SidebarRenderHook | null) {
  sidebarRenderHook = hook;
}

/**
 * Initialize sidebar system
 */
export function initializeSidebars() {
  renderSidebar('left', sidebarState.left as SidebarSection);
  renderSidebar('right', sidebarState.right as SidebarSection);
  updateSwapButtons();
  applySidebarVisibility();
  updateMenuToggleButton();
}

/**
 * Render sidebar content
 * @param {string} side - 'left' or 'right'
 * @param {string} section - 'mind', 'body', or 'soul'
 */
export function renderSidebar(side: SidebarSide, section: SidebarSection) {
  const container = document.getElementById(`${side}-content`);
  const template = document.getElementById(`${section}-template`) as HTMLTemplateElement | null;

  if (!container || !template) {
    console.error(`Missing ${side} sidebar or ${section} template`);
    return;
  }

  container.innerHTML = '';
  const content = template.content.cloneNode(true);
  container.appendChild(content);

  // Allow the app to re-bind section-specific DOM listeners after render.
  if (sidebarRenderHook) {
    try {
      sidebarRenderHook(side, section);
    } catch (error) {
      console.warn('[Sidebar Manager] sidebarRenderHook error:', error);
    }
  }
}

/**
 * Swap left sidebar with hidden section
 */
export function swapLeftSidebar() {
  window.kwami?.body?.pauseResizeDetection?.();
  
  const temp = sidebarState.left;
  sidebarState.left = sidebarState.hidden;
  sidebarState.hidden = temp;
  
  renderSidebar('left', sidebarState.left as SidebarSection);
  updateSwapButtons();
  
  setTimeout(() => {
    window.kwami?.body?.resumeResizeDetection?.();
  }, UI_CONFIG.SIDEBAR_TRANSITION_DURATION);
}

/**
 * Swap right sidebar with hidden section
 */
export function swapRightSidebar() {
  window.kwami?.body?.pauseResizeDetection?.();
  
  const temp = sidebarState.right;
  sidebarState.right = sidebarState.hidden;
  sidebarState.hidden = temp;
  
  renderSidebar('right', sidebarState.right as SidebarSection);
  updateSwapButtons();
  
  setTimeout(() => {
    window.kwami?.body?.resumeResizeDetection?.();
  }, UI_CONFIG.SIDEBAR_TRANSITION_DURATION);
}

/**
 * Update swap button labels
 */
export function updateSwapButtons() {
  const leftSwapText = document.getElementById('left-swap-text');
  const rightSwapText = document.getElementById('right-swap-text');
  
  if (leftSwapText) {
    leftSwapText.textContent = sectionLabels[sidebarState.hidden];
  }
  
  if (rightSwapText) {
    rightSwapText.textContent = sectionLabels[sidebarState.hidden];
  }
}

/**
 * Apply sidebar visibility based on collapsed state
 */
export function applySidebarVisibility() {
  const leftSidebar = document.getElementById('left-sidebar');
  const rightSidebar = document.getElementById('right-sidebar');
  
  [leftSidebar, rightSidebar].forEach((sidebar) => {
    if (!sidebar) return;
    sidebar.classList.toggle('hidden', sidebarState.menusCollapsed);
    sidebar.setAttribute('aria-hidden', sidebarState.menusCollapsed ? 'true' : 'false');
  });
}

/**
 * Update menu toggle button state
 */
export function updateMenuToggleButton() {
  const icon = document.getElementById('menu-toggle-icon');
  const toggleButton = document.getElementById('menu-toggle-btn');
  
  if (icon) {
    icon.textContent = '👻';
  }
  
  if (toggleButton) {
    toggleButton.setAttribute('aria-expanded', String(!sidebarState.menusCollapsed));
    toggleButton.setAttribute('aria-pressed', String(!sidebarState.menusCollapsed));
    toggleButton.setAttribute('title', sidebarState.menusCollapsed ? 'Show Sidebars' : 'Hide Sidebars');
  }
}

/**
 * Toggle sidebars visibility
 */
export function toggleMenus() {
  window.kwami?.body?.pauseResizeDetection?.();
  
  sidebarState.menusCollapsed = !sidebarState.menusCollapsed;
  applySidebarVisibility();
  updateMenuToggleButton();
  
  setTimeout(() => {
    window.kwami?.body?.resumeResizeDetection?.();
  }, UI_CONFIG.SIDEBAR_TRANSITION_DURATION);
}

/**
 * Switch mobile sidebar tab
 * @param {string} section - Section to display
 */
export function switchMobileSidebarTab(section: SidebarSection) {
  // Update active tab
  const tabs = document.querySelectorAll('.mobile-sidebar-tab');
  tabs.forEach((tab) => {
    const el = tab as HTMLElement;
    const isActive = el.dataset.section === section;
    el.classList.toggle('active', isActive);
    el.setAttribute('aria-selected', String(isActive));
  });
  
  // Render the selected section in left sidebar
  sidebarState.left = section;
  renderSidebar('left', section);
}

// Export to window for HTML onclick handlers
window.swapLeftSidebar = swapLeftSidebar;
window.swapRightSidebar = swapRightSidebar;
window.toggleMenus = toggleMenus;
window.switchMobileSidebarTab = switchMobileSidebarTab;

