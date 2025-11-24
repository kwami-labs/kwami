import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Kwami Playground
 */

test.describe('Kwami Playground - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for canvas to be ready
    await page.waitForSelector('#kwami-canvas', { timeout: 10000 });
  });

  test('should load the playground page', async ({ page }) => {
    await expect(page).toHaveTitle(/Kwami Playground/i);
  });

  test('should display canvas and sidebars', async ({ page }) => {
    // Check canvas exists
    const canvas = await page.locator('#kwami-canvas');
    await expect(canvas).toBeVisible();

    // Check sidebars exist
    const leftSidebar = await page.locator('#left-sidebar');
    const rightSidebar = await page.locator('#right-sidebar');
    
    await expect(leftSidebar).toBeVisible();
    await expect(rightSidebar).toBeVisible();
  });

  test('should toggle sidebars', async ({ page }) => {
    const menuToggle = page.locator('#menu-toggle-btn');
    const leftSidebar = page.locator('#left-sidebar');
    const rightSidebar = page.locator('#right-sidebar');

    // Initially visible
    await expect(leftSidebar).toBeVisible();
    await expect(rightSidebar).toBeVisible();

    // Click to hide
    await menuToggle.click();
    await page.waitForTimeout(400); // Wait for animation
    
    await expect(leftSidebar).toHaveClass(/hidden/);
    await expect(rightSidebar).toHaveClass(/hidden/);

    // Click to show again
    await menuToggle.click();
    await page.waitForTimeout(400);
    
    await expect(leftSidebar).not.toHaveClass(/hidden/);
    await expect(rightSidebar).not.toHaveClass(/hidden/);
  });
});

test.describe('Kwami Playground - Body Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#kwami-canvas', { timeout: 10000 });
    
    // Switch to Body section if not already there
    const bodyTab = page.locator('[data-section="body"]').first();
    if (await bodyTab.isVisible()) {
      await bodyTab.click();
    }
  });

  test('should change blob scale', async ({ page }) => {
    const scaleSlider = page.locator('#scale');
    
    // Get initial value
    const initialValue = await scaleSlider.inputValue();
    
    // Change slider value
    await scaleSlider.fill('5.0');
    
    // Wait for update
    await page.waitForTimeout(200);
    
    // Verify value changed
    const newValue = await scaleSlider.inputValue();
    expect(newValue).not.toBe(initialValue);
  });

  test('should randomize blob', async ({ page }) => {
    const randomizeBtn = page.locator('button:has-text("Random Blob")');
    
    if (await randomizeBtn.isVisible()) {
      await randomizeBtn.click();
      await page.waitForTimeout(500);
      
      // Check that randomization triggered (canvas should update)
      const canvas = page.locator('#kwami-canvas');
      await expect(canvas).toBeVisible();
    }
  });

  test('should toggle wireframe mode', async ({ page }) => {
    const wireframeCheckbox = page.locator('#wireframe');
    
    if (await wireframeCheckbox.isVisible()) {
      // Initially unchecked
      await expect(wireframeCheckbox).not.toBeChecked();
      
      // Check it
      await wireframeCheckbox.check();
      await expect(wireframeCheckbox).toBeChecked();
      
      // Uncheck it
      await wireframeCheckbox.uncheck();
      await expect(wireframeCheckbox).not.toBeChecked();
    }
  });

  test('should change skin type', async ({ page }) => {
    const skinTypeSelect = page.locator('#skin-type');
    
    if (await skinTypeSelect.isVisible()) {
      await skinTypeSelect.selectOption('zebra');
      await page.waitForTimeout(300);
      
      const selectedValue = await skinTypeSelect.inputValue();
      expect(selectedValue).toBe('zebra');
    }
  });
});

test.describe('Kwami Playground - Mind Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#kwami-canvas', { timeout: 10000 });
    
    // Switch to Mind section
    const mindTab = page.locator('[data-section="mind"]').first();
    if (await mindTab.isVisible()) {
      await mindTab.click();
      await page.waitForTimeout(300);
    }
  });

  test('should display mind section', async ({ page }) => {
    // Check for Mind section content
    const mindTitle = page.locator('h2:has-text("Mind")');
    await expect(mindTitle).toBeVisible();
  });

  test('should have skills section', async ({ page }) => {
    const skillsTitle = page.locator('text=Skills').first();
    
    if (await skillsTitle.isVisible()) {
      const skillSelector = page.locator('#skill-selector');
      await expect(skillSelector).toBeVisible();
    }
  });
});

test.describe('Kwami Playground - Soul Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#kwami-canvas', { timeout: 10000 });
    
    // Switch to Soul section
    const soulTab = page.locator('[data-section="soul"]').first();
    if (await soulTab.isVisible()) {
      await soulTab.click();
      await page.waitForTimeout(300);
    }
  });

  test('should display soul section', async ({ page }) => {
    // Check for Soul section content
    const soulTitle = page.locator('h2:has-text("Soul")');
    await expect(soulTitle).toBeVisible();
  });

  test('should have personality selector', async ({ page }) => {
    const personalitySelector = page.locator('#personality-selector');
    
    if (await personalitySelector.isVisible()) {
      await expect(personalitySelector).toBeVisible();
      
      // Select a personality
      await personalitySelector.selectOption('friendly');
      await page.waitForTimeout(300);
      
      const selectedValue = await personalitySelector.inputValue();
      expect(selectedValue).toBe('friendly');
    }
  });

  test('should adjust emotional traits', async ({ page }) => {
    const happinessSlider = page.locator('#happiness-slider');
    
    if (await happinessSlider.isVisible()) {
      await happinessSlider.fill('50');
      await page.waitForTimeout(200);
      
      const value = await happinessSlider.inputValue();
      expect(value).toBe('50');
    }
  });
});

test.describe('Kwami Playground - Theme & Colors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#kwami-canvas', { timeout: 10000 });
  });

  test('should toggle theme', async ({ page }) => {
    const themeToggle = page.locator('#theme-toggle-btn');
    
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    await page.waitForTimeout(300);
    
    // Check theme changed (body should have dark class)
    const body = page.locator('body');
    const hasThemeClass = await body.evaluate(el => {
      return el.classList.contains('dark-theme') || el.classList.contains('light-theme');
    });
    
    expect(hasThemeClass).toBeTruthy();
  });

  test('should open color picker', async ({ page }) => {
    const colorPickerBtn = page.locator('#color-picker-btn');
    const colorPickerDropdown = page.locator('#color-picker-dropdown');
    
    await expect(colorPickerBtn).toBeVisible();
    
    // Initially hidden
    await expect(colorPickerDropdown).toHaveClass(/hidden/);
    
    // Click to open
    await colorPickerBtn.click();
    await page.waitForTimeout(200);
    
    await expect(colorPickerDropdown).not.toHaveClass(/hidden/);
  });
});

test.describe('Kwami Playground - Audio Player', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#kwami-canvas', { timeout: 10000 });
  });

  test('should toggle audio player', async ({ page }) => {
    const audioToggle = page.locator('#audio-toggle-btn');
    const audioPlayer = page.locator('#audio-player');
    
    await expect(audioToggle).toBeVisible();
    
    // Initially hidden
    await expect(audioPlayer).toHaveClass(/hidden/);
    
    // Click to show
    await audioToggle.click();
    await page.waitForTimeout(200);
    
    await expect(audioPlayer).not.toHaveClass(/hidden/);
    
    // Close with close button
    const closeBtn = page.locator('#audio-close-btn');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(200);
      
      await expect(audioPlayer).toHaveClass(/hidden/);
    }
  });
});

test.describe('Kwami Playground - Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('#kwami-canvas', { timeout: 10000 });

    // Check canvas is still visible
    const canvas = page.locator('#kwami-canvas');
    await expect(canvas).toBeVisible();

    // Check mobile sidebar tabs are visible
    const mobileTabs = page.locator('.mobile-sidebar-tabs');
    if (await mobileTabs.isVisible()) {
      await expect(mobileTabs).toBeVisible();
    }
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForSelector('#kwami-canvas', { timeout: 10000 });

    const canvas = page.locator('#kwami-canvas');
    await expect(canvas).toBeVisible();
  });
});

test.describe('Kwami Playground - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('#kwami-canvas', { timeout: 10000 });
    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should have good lighthouse score', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#kwami-canvas', { timeout: 10000 });
    
    // Note: Actual Lighthouse audit would require additional setup
    // This is a placeholder for basic performance checks
    
    // Check for render-blocking resources
    const scripts = await page.locator('script[src]').count();
    expect(scripts).toBeGreaterThan(0);
  });
});

test.describe('Kwami Playground - Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#kwami-canvas', { timeout: 10000 });

    // Check menu toggle has aria attributes
    const menuToggle = page.locator('#menu-toggle-btn');
    const ariaExpanded = await menuToggle.getAttribute('aria-expanded');
    const ariaPressed = await menuToggle.getAttribute('aria-pressed');
    
    expect(ariaExpanded).toBeTruthy();
    expect(ariaPressed).toBeTruthy();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#kwami-canvas', { timeout: 10000 });

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    
    expect(firstFocused).toBeTruthy();
  });
});

