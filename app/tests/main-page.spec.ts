import { test, expect } from '@playwright/test';

test.describe('Main Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the main page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Looma\.sh/);

    // Check if hero section is visible
    await expect(page.locator('h1')).toContainText('Looma.sh');
    await expect(page.locator('text=Next-generation vehicle communication network')).toBeVisible();
  });

  test('should display version information', async ({ page }) => {
    // Check version display component
    const versionDisplay = page.locator('.fixed.bottom-4.left-4');
    await expect(versionDisplay).toBeVisible();
    await expect(versionDisplay).toContainText('v');
    await expect(versionDisplay).toContainText('V2V Demo');
  });

  test('should have working navigation links', async ({ page }) => {
    // Test the "Try Live Demo" button
    const demoButton = page.locator('a[href="/demo/select"]');
    await expect(demoButton).toBeVisible();
    await expect(demoButton).toContainText('Try Live Demo');

    // Test other navigation elements
    await expect(page.locator('text=Features')).toBeVisible();
    await expect(page.locator('text=How It Works')).toBeVisible();
  });

  test('should display investor highlights', async ({ page }) => {
    // Check investment metrics section
    await expect(page.locator('text=🚀 Investor Highlights')).toBeVisible();
    await expect(page.locator('text=$15.7 Billion')).toBeVisible(); // Smart City Market
    await expect(page.locator('text=35x ROI')).toBeVisible(); // ROI
    await expect(page.locator('text=5-Year Target')).toBeVisible();
  });

  test('should show key features with animated elements', async ({ page }) => {
    // Check for animated status indicators
    const statusIndicators = page.locator('.animate-pulse');
    await expect(statusIndicators).toHaveCount(3);

    // Check feature labels
    await expect(page.locator('text=Live Network')).toBeVisible();
    await expect(page.locator('text=Encrypted')).toBeVisible();
    await expect(page.locator('text=Security')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if elements adapt to mobile
    const heroTitle = page.locator('h1');
    await expect(heroTitle).toBeVisible();

    // Check button responsiveness
    const demoButton = page.locator('a[href="/demo/select"]');
    await expect(demoButton).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBe('Vehicle-to-Vehicle Realtime Communication Network');

    // Check title
    await expect(page).toHaveTitle(/Looma\.sh/);
  });

  test('should have language switcher functionality', async ({ page }) => {
    // Look for language switcher
    const languageSwitcher = page.locator('button').filter({ hasText: /English|العربية|עברית|Español|Français|Deutsch/ });

    // If language switcher exists, test it
    if (await languageSwitcher.count() > 0) {
      await languageSwitcher.first().click();
      // Language switcher should show options
      await expect(page.locator('a').filter({ hasText: /English|العربية|עברית|Español|Français|Deutsch/ }).first()).toBeVisible();
    }
  });
});

test.describe('Main Page Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to demo selector when clicking Try Live Demo', async ({ page }) => {
    const demoButton = page.locator('a[href="/demo/select"]');
    await demoButton.click();

    await expect(page).toHaveURL('/demo/select');
    await expect(page.locator('h1')).toContainText('V2V Communication Demos');
  });

  test('should handle section navigation', async ({ page }) => {
    // Test if hash navigation works (if implemented)
    const featuresLink = page.locator('a[href="#features"]');
    if (await featuresLink.count() > 0) {
      await featuresLink.click();
      await expect(page.locator('#features')).toBeVisible();
    }
  });
});

test.describe('Main Page Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.locator('h1').toBeVisible();

    // Should have no console errors
    expect(errors).toHaveLength(0);
  });
});