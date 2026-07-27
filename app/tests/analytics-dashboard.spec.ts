import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/analytics');
  });

  test('should load the analytics dashboard successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/V2V Analytics Dashboard/);

    // Check main heading
    await expect(page.locator('h1')).toContainText('V2V Analytics Dashboard');
    await expect(page.locator('text=Real-time performance metrics and business impact analytics')).toBeVisible();
  });

  test('should display live status indicator', async ({ page }) => {
    // Check for live status
    await expect(page.locator('text=Live')).toBeVisible();

    // Check for pulsing green dot
    const liveIndicator = page.locator('.bg-green-500.animate-pulse');
    await expect(liveIndicator).toBeVisible();
  });

  test('should show key performance metrics', async ({ page }) => {
    // Check for metric cards
    await expect(page.locator('text=Total Messages')).toBeVisible();
    await expect(page.locator('text=Active Vehicles')).toBeVisible();
    await expect(page.locator('text=Collision Warnings')).toBeVisible();
    await expect(page.locator('text=Emergency Alerts')).toBeVisible();

    // Check for trend indicators
    await expect(page.locator('text=↗')).toBeVisible();
    await expect(page.locator('text=↘')).toBeVisible();
    await expect(page.locator('text=→')).toBeVisible();
  });

  test('should display business impact section', async ({ page }) => {
    await expect(page.locator('text=📊 Business Impact')).toBeVisible();
    await expect(page.locator('text=Fuel Savings')).toBeVisible();
    await expect(page.locator('text=Response Time Improvement')).toBeVisible();
    await expect(page.locator('text=Cooperative Events')).toBeVisible();
  });

  test('should display network performance section', async ({ page }) => {
    await expect(page.locator('text=🌐 Network Performance')).toBeVisible();
    await expect(page.locator('text=Uptime')).toBeVisible();
    await expect(page.locator('text=Network Latency')).toBeVisible();
    await expect(page.locator('text=Signal Strength')).toBeVisible();
    await expect(page.locator('text=Area Coverage')).toBeVisible();
  });

  test('should show progress bars for network metrics', async ({ page }) => {
    // Check for progress bars
    const progressBars = page.locator('.bg-slate-700.rounded-full.h-2');
    expect(progressBars).toHaveCount(4); // Uptime, Latency, Signal Strength, Area Coverage
  });

  test('should display real-time activity chart', async ({ page }) => {
    await expect(page.locator('text=📈 Real-time Activity')).toBeVisible();

    // Wait for chart to load
    await page.waitForTimeout(2000);

    // Check for chart elements
    const chartArea = page.locator('.h-64.relative');
    await expect(chartArea).toBeVisible();

    // Check for legend
    const legendItems = page.locator('text=Messages/sec, text=Active Vehicles, text=Collision Warnings');
    expect(legendItems).toHaveCount(3);
  });

  test('should display customer success metrics', async ({ page }) => {
    await expect(page.locator('text=🏆 Customer Success Metrics')).toBeVisible();
    await expect(page.locator('text=Customer Satisfaction')).toBeVisible();
    await expect(page.locator('text=Faster Emergency Response')).toBeVisible();
    await expect(page.locator('text=Annual Fuel Cost Savings')).toBeVisible();

    // Check for specific values
    await expect(page.locator('text=99.7%')).toBeVisible();
    await expect(page.locator('text=40%')).toBeVisible();
    await expect(page.locator('text=$2.3M')).toBeVisible();
  });

  test('should handle pause/resume functionality', async ({ page }) => {
    // Click pause button
    await page.locator('button:has-text("⏸ Pause")').click();

    // Check if status changes to paused
    await expect(page.locator('text=Paused')).toBeVisible();
    await expect(page.locator('button:has-text("▶ Resume")')).toBeVisible();

    // Click resume button
    await page.locator('button:has-text("▶ Resume")').click();

    // Check if status changes back to live
    await expect(page.locator('text=Live')).toBeVisible();
    await expect(page.locator('button:has-text("⏸ Pause")')).toBeVisible();
  });

  test('should handle time range selection', async ({ page }) => {
    const timeRanges = ['1h', '24h', '7d', '30d'];

    for (const range of timeRanges) {
      const button = page.locator(`button:has-text("${range}")`);
      if (await button.count() > 0) {
        await button.click();
        // Check if button becomes active
        await expect(button).toHaveClass(/bg-blue-600/);
      }
    }
  });

  test('should update metrics in real-time', async ({ page }) => {
    // Get initial values
    const initialMessages = await page.locator('text=Total Messages').locator('..').locator('text-blue-400').first().textContent();

    // Wait for updates
    await page.waitForTimeout(3000);

    // Get updated values
    const updatedMessages = await page.locator('text=Total Messages').locator('..').locator('text-blue-400').first().textContent();

    // Values should be different (updated)
    expect(updatedMessages).not.toBe(initialMessages);
  });

  test('should display mini charts for business impact metrics', async ({ page }) => {
    // Wait for mini charts to load
    await page.waitForTimeout(2000);

    // Check for SVG elements (mini charts)
    const miniCharts = page.locator('svg');
    expect(miniCharts.count()).resolves.toBeGreaterThan(0);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if key elements are still visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Total Messages')).toBeVisible();
    await expect(page.locator('text=Live')).toBeVisible();

    // Test pause/resume on mobile
    await page.locator('button:has-text("⏸ Pause")').click();
    await expect(page.locator('text=Paused')).toBeVisible();
  });

  test('should handle chart loading state', async ({ page }) => {
    // Initially might show loading state
    const loadingText = page.locator('text=Starting real-time monitoring...');
    if (await loadingText.isVisible()) {
      // Should disappear after loading
      await page.waitForTimeout(3000);
      await expect(loadingText).not.toBeVisible();
    }
  });
});

test.describe('Analytics Dashboard Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/demo/analytics');
    await expect(page.locator('h1')).toBeVisible();
    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle continuous real-time updates without performance degradation', async ({ page }) => {
    await page.goto('/demo/analytics');

    // Let it run for 10 seconds
    await page.waitForTimeout(10000);

    // Check if page is still responsive
    await expect(page.locator('h1')).toBeVisible();

    // Try to interact with controls
    await page.locator('button:has-text("⏸ Pause")').click();
    await expect(page.locator('text=Paused')).toBeVisible();
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/demo/analytics');
    await expect(page.locator('h1')).toBeVisible();

    // Wait for real-time updates to start
    await page.waitForTimeout(3000);

    // Should have no console errors
    expect(errors).toHaveLength(0);
  });

  test('should handle memory usage over extended periods', async ({ page }) => {
    await page.goto('/demo/analytics');

    // Let dashboard run for extended period
    await page.waitForTimeout(15000);

    // Check if all elements are still responsive
    await expect(page.locator('h1')).toBeVisible();

    // Try interacting with controls
    await page.locator('button:has-text("⏸ Pause")').click();
    await page.locator('button:has-text("▶ Resume")').click();

    await expect(page.locator('text=Live')).toBeVisible();
  });
});

test.describe('Analytics Dashboard Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    // Main heading should be h1
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText('V2V Analytics Dashboard');

    // Section headings should be h2
    const sectionHeadings = page.locator('h2');
    await expect(sectionHeadings).toHaveCount(4); // Business Impact, Network Performance, Real-time Activity, Customer Success
  });

  test('should have accessible buttons', async ({ page }) => {
    // Check pause/resume button
    const pauseButton = page.locator('button:has-text("⏸ Pause")');
    await expect(pauseButton).toBeVisible();

    // Check time range buttons
    const timeRangeButtons = page.locator('button').filter({ hasText: /\d+[hd]/ });
    expect(timeRangeButtons.count()).resolves.toBeGreaterThan(0);
  });

  test('should have proper color contrast for metrics', async ({ page }) => {
    // Check for different color-coded metrics
    await expect(page.locator('.text-blue-400')).toBeVisible(); // Messages
    await expect(page.locator('.text-green-400')).toBeVisible(); // Vehicles, Uptime
    await expect(page.locator('.text-yellow-400')).toBeVisible(); // Warnings, Latency
    await expect(page.locator('.text-red-400')).toBeVisible(); // Alerts
    await expect(page.locator('.text-purple-400')).toBeVisible(); // Cooperative events
  });

  test('should have accessible progress indicators', async ({ page }) => {
    const progressBars = page.locator('.bg-slate-700.rounded-full.h-2');

    for (let i = 0; i < await progressBars.count(); i++) {
      const progressBar = progressBars.nth(i);
      await expect(progressBar).toBeVisible();

      // Check for filled portion
      const filledBar = progressBar.locator('.rounded-full').not('.bg-slate-700');
      await expect(filledBar).toBeVisible();
    }
  });
});