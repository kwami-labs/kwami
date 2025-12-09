/**
 * E2E Tests - Basic Functionality
 * 
 * Tests core playground features from a user perspective
 */

import { test, expect } from '@playwright/test';

test.describe('Kwami Playground - Basic', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the blob to initialize
    await page.waitForSelector('#kwami-canvas', { state: 'visible' });
  });

  test('should load the playground successfully', async ({ page }) => {
    // Check that main elements are present
    await expect(page.locator('#app')).toBeVisible();
    await expect(page.locator('#kwami-canvas')).toBeVisible();
    await expect(page.locator('#left-sidebar')).toBeVisible();
    await expect(page.locator('#right-sidebar')).toBeVisible();
  });

  test('should have correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Kwami Playground');
  });

  test('should toggle sidebars when menu button is clicked', async ({ page }) => {
    const leftSidebar = page.locator('#left-sidebar');
    const rightSidebar = page.locator('#right-sidebar');
    const menuToggle = page.locator('#menu-toggle-btn');

    // Sidebars should be visible initially
    await expect(leftSidebar).toBeVisible();
    await expect(rightSidebar).toBeVisible();

    // Click menu toggle
    await menuToggle.click();

    // Sidebars should have 'hidden' class
    await expect(leftSidebar).toHaveClass(/hidden/);
    await expect(rightSidebar).toHaveClass(/hidden/);

    // Click again to restore
    await menuToggle.click();
    
    // Sidebars should be visible again
    await expect(leftSidebar).toBeVisible();
    await expect(rightSidebar).toBeVisible();
  });

  test('should display version info', async ({ page }) => {
    const versionDisplay = page.locator('#version-display');
    await expect(versionDisplay).toBeVisible();
    await expect(versionDisplay).toContainText('1.5.11');
  });

  test('should have working theme toggle', async ({ page }) => {
    const themeToggle = page.locator('#theme-toggle-btn');
    await expect(themeToggle).toBeVisible();

    // Click to toggle theme
    await themeToggle.click();
    
    // Check that body class changed
    const body = page.locator('body');
    const hasLightOrDark = await body.evaluate((el) => {
      return el.classList.contains('light') || el.classList.contains('dark');
    });
    expect(hasLightOrDark).toBeTruthy();
  });
});

test.describe('Kwami Playground - Blob Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#kwami-canvas', { state: 'visible' });
  });

  test('should allow canvas interaction', async ({ page }) => {
    const canvas = page.locator('#kwami-canvas');
    
    // Get canvas bounding box
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();

    if (box) {
      // Click on canvas center
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      
      // Canvas should still be visible after interaction
      await expect(canvas).toBeVisible();
    }
  });
});

test.describe('Kwami Playground - Sidebar Sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#kwami-canvas', { state: 'visible' });
  });

  test('should switch between sidebar sections', async ({ page }) => {
    const leftSwapButton = page.locator('#left-swap-btn');
    
    // Click to rotate sections
    await leftSwapButton.click();
    
    // Check that content updated (swap text should change)
    const swapText = page.locator('#left-swap-text');
    await expect(swapText).toBeVisible();
  });

  test('should have Mind, Body, and Soul sections', async ({ page }) => {
    // Check that templates exist
    const mindTemplate = page.locator('#mind-template');
    const bodyTemplate = page.locator('#body-template');
    const soulTemplate = page.locator('#soul-template');

    await expect(mindTemplate).toBeAttached();
    await expect(bodyTemplate).toBeAttached();
    await expect(soulTemplate).toBeAttached();
  });
});

test.describe('Kwami Playground - Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#kwami-canvas', { state: 'visible' });
  });

  test('should have color picker button', async ({ page }) => {
    const colorPickerBtn = page.locator('#color-picker-btn');
    await expect(colorPickerBtn).toBeVisible();

    // Click to open dropdown
    await colorPickerBtn.click();

    // Dropdown should be visible
    const dropdown = page.locator('#color-picker-dropdown');
    await expect(dropdown).toBeVisible();
    await expect(dropdown).not.toHaveClass(/hidden/);
  });

  test('should have GitHub star button', async ({ page }) => {
    const githubBtn = page.locator('#github-star-btn');
    await expect(githubBtn).toBeVisible();
    await expect(githubBtn).toHaveAttribute('href', 'https://github.com/alexcolls/kwami');
  });

  test('should have audio toggle button', async ({ page }) => {
    const audioToggle = page.locator('#audio-toggle-btn');
    await expect(audioToggle).toBeVisible();

    // Click to show audio player
    await audioToggle.click();

    // Audio player should be visible
    const audioPlayer = page.locator('#audio-player');
    await expect(audioPlayer).toBeVisible();
    await expect(audioPlayer).not.toHaveClass(/hidden/);
  });
});

test.describe('Kwami Playground - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#kwami-canvas', { state: 'visible' });

    // Check that canvas is visible
    const canvas = page.locator('#kwami-canvas');
    await expect(canvas).toBeVisible();

    // Check that mobile sidebar tabs exist
    const mobileTabs = page.locator('.mobile-sidebar-tabs');
    await expect(mobileTabs).toBeVisible();
  });

  test('should have mobile sidebar close button', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#kwami-canvas', { state: 'visible' });

    const closeBtn = page.locator('.sidebar-close-btn');
    await expect(closeBtn).toBeAttached();
  });
});

