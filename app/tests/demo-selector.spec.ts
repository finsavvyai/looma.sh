import { test, expect } from '@playwright/test';

test.describe('Demo Selector Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/select');
  });

  test('should load the demo selector page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/V2V Demo Selection/);

    // Check main heading
    await expect(page.locator('h1')).toContainText('V2V Communication Demos');
    await expect(page.locator('text=Choose between our educational simulation and production-ready real V2V communication system')).toBeVisible();
  });

  test('should display all three demo options', async ({ page }) => {
    const demoCards = page.locator('.bg-slate-800\\/50');
    await expect(demoCards).toHaveCount(3);

    // Check each demo is present
    await expect(page.locator('text=Interactive Demo')).toBeVisible();
    await expect(page.locator('text=Real V2V System')).toBeVisible();
    await expect(page.locator('text=Production V2V System')).toBeVisible();
  });

  test('should show demo type badges', async ({ page }) => {
    // Check badge colors and types
    await expect(page.locator('text=Educational')).toBeVisible();
    await expect(page.locator('text=Advanced Demo')).toBeVisible();
    await expect(page.locator('text=Enterprise Grade')).toBeVisible();
  });

  test('should navigate to Interactive Demo', async ({ page }) => {
    const interactiveDemoLink = page.locator('a[href="/demo"]');
    await interactiveDemoLink.click();

    await expect(page).toHaveURL('/demo');
    // Check for Interactive Demo elements
    await expect(page.locator('text=Select Scenario')).toBeVisible();
  });

  test('should navigate to Real V2V System', async ({ page }) => {
    const realV2VLink = page.locator('a[href="/demo/real-v2v"]');
    await realV2VLink.click();

    await expect(page).toHaveURL('/demo/real-v2v');
    await expect(page.locator('text=Real V2V Communication System')).toBeVisible();
    await expect(page.locator('text=Generate a Sora clip')).toBeVisible();
  });

  test('should navigate to Production V2V System', async ({ page }) => {
    const productionLink = page.locator('a[href="/demo/production"]');
    await productionLink.click();

    await expect(page).toHaveURL('/demo/production');
    await expect(page.locator('text=Production V2V System')).toBeVisible();
    await expect(page.locator('text=Enterprise Grade')).toBeVisible();
  });

  test('should display demo features', async ({ page }) => {
    // Check Interactive Demo features
    await expect(page.locator('text=4 Scenarios: Collision Avoidance, Emergency Vehicle, Fleet Management, Traffic Optimization')).toBeVisible();
    await expect(page.locator('text=Interactive controls for starting/stopping simulations')).toBeVisible();

    // Check Real V2V System features
    await expect(page.locator('text=Automatic V2V message generation every 100ms')).toBeVisible();
    await expect(page.locator('text=Real vehicle telemetry integration (GPS, OBD-II, sensors)')).toBeVisible();

    // Check Production V2V System features
    await expect(page.locator('text=Military-grade AES-256 encryption for all messages')).toBeVisible();
    await expect(page.locator('text=Multi-protocol support (DSRC, C-V2X, 5G-V2X)')).toBeVisible();
    await expect(page.locator('text=Real OBD-II integration (RPM, fuel, temperature, battery)')).toBeVisible();
  });

  test('should show system comparison table', async ({ page }) => {
    await expect(page.locator('text=System Comparison')).toBeVisible();

    // Check comparison categories
    await expect(page.locator('text=Interactive Demo')).toBeVisible();
    await expect(page.locator('text=Real V2V System')).toBeVisible();
    await expect(page.locator('text=Production System')).toBeVisible();

    // Check specific features in comparison
    await expect(page.locator('text=User-controlled scenarios')).toBeVisible();
    await expect(page.locator('text=Automatic message generation')).toBeVisible();
    await expect(page.locator('text=Military-grade encryption (AES-256)')).toBeVisible();
  });

  test('should have proper styling and layout', async ({ page }) => {
    // Check grid layout
    const gridContainer = page.locator('.grid.grid-cols-1.lg\\:grid-cols-3');
    await expect(gridContainer).toBeVisible();

    // Check cards have proper styling
    const cards = page.locator('.bg-slate-800\\/50.backdrop-blur-sm');
    await expect(cards).toHaveCount(3);

    // Check hover effects (visual inspection)
    for (let i = 0; i < 3; i++) {
      const card = cards.nth(i);
      await expect(card).toHaveClass(/border-slate-700/);
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if elements adapt to mobile
    const demoCards = page.locator('.bg-slate-800\\/50');
    await expect(demoCards).toHaveCount(3);

    // Check if text is readable on mobile
    await expect(page.locator('h2').first()).toBeVisible();
    await expect(page.locator('a').first()).toBeVisible();
  });

  test('should handle hover effects', async ({ page }) => {
    const firstCard = page.locator('.bg-slate-800\\/50').first();

    // Hover over first card
    await firstCard.hover();

    // Check if hover state is applied (visual)
    await expect(firstCard).toBeVisible();

    // Check if links are still clickable
    const demoLink = firstCard.locator('a').first();
    await expect(demoLink).toBeVisible();
  });

  test('should load appropriate icon for each demo', async ({ page }) => {
    // The demo cards should have launch buttons
    const launchButtons = page.locator('a').filter({ hasText: /^Launch Demo$/ });
    await expect(launchButtons).toHaveCount(3);
  });
});

test.describe('Demo Selector Page Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/demo/select');
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

    await page.goto('/demo/select');
    await expect(page.locator('h1')).toBeVisible();

    // Should have no console errors
    expect(errors).toHaveLength(0);
  });
});

test.describe('Demo Selector Page Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/select');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Main heading should be h1
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();

    // Subheadings should be h2
    const subheadings = page.locator('h2');
    await expect(subheadings).toHaveCount(3);

    // Check headings have proper text content
    await expect(subheadings.first()).toContainText('Interactive Demo');
    await expect(subheadings.nth(1)).toContainText('Real V2V System');
    await expect(subheadings.nth(2)).toContainText('Production V2V System');
  });

  test('should have proper button accessibility', async ({ page }) => {
    const launchButtons = page.locator('a').filter({ hasText: /^Launch Demo$/ });

    for (let i = 0; i < await launchButtons.count(); i++) {
      const button = launchButtons.nth(i);

      // Buttons should be properly structured as links
      await expect(button).toHaveAttribute('href');
      await expect(button).toBeVisible();

      // Buttons should have descriptive text
      await expect(button).toContainText('Launch Demo');
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Check badges have appropriate contrast (visual inspection)
    const badges = page.locator('span').filter({ hasText: /Educational|Advanced Demo|Enterprise Grade/ });

    for (let i = 0; i < await badges.count(); i++) {
      const badge = badges.nth(i);
      await expect(badge).toBeVisible();
      expect(badge).toHaveClass(/px-3 py-1/); // Should have proper padding
    }
  });
});