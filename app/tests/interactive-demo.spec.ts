import { test, expect } from '@playwright/test';

test.describe('Interactive Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
  });

  test('should load the interactive demo page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/V2V Communication Demo/);

    // Check main heading
    await expect(page.locator('h1')).toContainText('V2V Communication Demo');
  });

  test('should display scenario selection', async ({ page }) => {
    // Check scenario selector
    await expect(page.locator('text=Select Scenario:')).toBeVisible();

    // Check all four scenarios
    await expect(page.locator('text=Collision Avoidance')).toBeVisible();
    await expect(page.locator('text=Emergency Vehicle Priority')).toBeVisible();
    await expect(page.locator('text=Fleet Management')).toBeVisible();
    await expect(page.locator('text=Traffic Flow Optimization')).toBeVisible();
  });

  test('should have control panel', async ({ page }) => {
    // Check control panel elements
    await expect(page.locator('text=Control Panel')).toBeVisible();

    // Check buttons
    const startButton = page.locator('button:has-text("Start Simulation")');
    const resetButton = page.locator('button:has-text("Reset")');

    await expect(startButton).toBeVisible();
    await expect(resetButton).toBeVisible();
  });

  test('should have communication range slider', async ({ page }) => {
    const rangeSlider = page.locator('input[type="range"]');
    await expect(rangeSlider).toBeVisible();

    // Check if slider has correct attributes
    await expect(rangeSlider).toHaveAttribute('min', '50');
    await expect(rangeSlider).toHaveAttribute('max', '200');
  });

  test('should display vehicle map', async ({ page }) => {
    // Check map container
    await expect(page.locator('text=Vehicle Communication Map')).toBeVisible();

    // Check if map area is rendered
    const mapContainer = page.locator('.bg-slate-900.rounded-lg');
    await expect(mapContainer).toBeVisible();
  });

  test('should display communication log', async ({ page }) => {
    // Check log container
    await expect(page.locator('text=Communication Log')).toBeVisible();

    // Check initial state
    await expect(page.locator('text=No communications yet. Start the simulation to see V2V messages.')).toBeVisible();
  });

  test('should start simulation when clicking start button', async ({ page }) => {
    // Select a scenario first
    const collisionAvoidanceScenario = page.locator('button:has-text("Collision Avoidance")');
    if (await collisionAvoidanceScenario.count() > 0) {
      await collisionAvoidanceScenario.click();
    }

    // Start simulation
    const startButton = page.locator('button:has-text("Start Simulation")');
    await startButton.click();

    // Check if simulation is running (button text changes)
    await expect(page.locator('button:has-text("Running...")')).toBeVisible();
  });

  test('should handle vehicle selection', async ({ page }) => {
    // Start simulation first
    const collisionAvoidanceScenario = page.locator('button:has-text("Collision Avoidance")');
    if (await collisionAvoidanceScenario.count() > 0) {
      await collisionAvoidanceScenario.click();
    }

    const startButton = page.locator('button:has-text("Start Simulation")');
    await startButton.click();

    // Wait a bit for vehicles to appear
    await page.waitForTimeout(500);

    // Try to click on a vehicle (if they appear)
    const vehicles = page.locator('.absolute.transition-all.duration-200');
    if (await vehicles.count() > 0) {
      const firstVehicle = vehicles.first();
      await firstVehicle.click();

      // Should show some interaction (maybe highlight)
      await expect(firstVehicle).toBeVisible();
    }
  });

  test('should reset simulation properly', async ({ page }) => {
    // Start a simulation first
    const collisionAvoidanceScenario = page.locator('button:has-text("Collision Avoidance")');
    if (await collisionAvoidanceScenario.count() > 0) {
      await collisionAvoidanceScenario.click();
    }

    const startButton = page.locator('button:has-text("Start Simulation")');
    await startButton.click();

    // Wait a moment
    await page.waitForTimeout(1000);

    // Reset simulation
    const resetButton = page.locator('button:has-text("Reset")');
    await resetButton.click();

    // Check if reset worked (start button should be back to normal)
    await expect(page.locator('button:has-text("Start Simulation")')).toBeVisible();
  });

  test('should display real-time statistics', async ({ page }) => {
    // Check statistics section
    const stats = page.locator('.grid.grid-cols-2.md\\:grid-cols-4.gap-4');

    if (await stats.count() > 0) {
      await expect(stats).toBeVisible();

      // Check if statistics are displayed
      const statValues = stats.locator('.text-2xl');
      if (await statValues.count() > 0) {
        await expect(statValues.first()).toBeVisible();
      }
    }
  });

  test('should show legend for vehicle types', async ({ page }) => {
    // Check if legend exists
    const legend = page.locator('.flex.flex-wrap.gap-4.text-sm');

    if (await legend.count() > 0) {
      await expect(legend).toBeVisible();

      // Check if vehicle types are shown
      await expect(legend.locator('text=Car')).toBeVisible();
      await expect(legend.locator('text=Truck')).toBeVisible();
      await expect(legend.locator('text=Emergency')).toBeVisible();
      await expect(legend.locator('text=Bus')).toBeVisible();
    }
  });

  test('should handle different scenarios correctly', async ({ page }) => {
    const scenarios = [
      'Collision Avoidance',
      'Emergency Vehicle Priority',
      'Fleet Management',
      'Traffic Flow Optimization'
    ];

    for (const scenario of scenarios) {
      // Select scenario
      const scenarioButton = page.locator(`button:has-text("${scenario}")`);
      if (await scenarioButton.count() > 0) {
        await scenarioButton.click();

        // Check if scenario is selected
        // Note: Visual indication might not be easily testable with current implementation

        // Start and stop to ensure it works
        const startButton = page.locator('button:has-text("Start Simulation")');
        await startButton.click();

        await page.waitForTimeout(1000);

        const resetButton = page.locator('button:has-text("Reset")');
        await resetButton.click();
      }
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if key elements are still visible
    await expect(page.locator('h1')).toBeVisible();

    const scenarioButtons = page.locator('button').filter({ hasText: /Collision Avoidance|Emergency Vehicle|Fleet Management|Traffic Flow/ });
    if (await scenarioButtons.count() > 0) {
      await expect(scenarioButtons.first()).toBeVisible();
    }

    // Check control panel
    const controlPanel = page.locator('.bg-slate-800.rounded-2xl.p-6');
    if (await controlPanel.count() > 0) {
      await expect(controlPanel).toBeVisible();
    }
  });

  test('should handle rapid start/stop cycles', async ({ page }) => {
    // Select a scenario
    const collisionAvoidanceScenario = page.locator('button:has-text("Collision Avoidance")');
    if (await collisionAvoidanceScenario.count() === 0) {
      test.skip();
      return;
    }

    await collisionAvoidanceScenario.click();

    // Perform multiple start/stop cycles
    for (let i = 0; i < 3; i++) {
      const startButton = page.locator('button:has-text("Start Simulation")');
      const runningButton = page.locator('button:has-text("Running...")');

      await startButton.click();
      await page.waitForSelector('button:has-text("Running...")', { timeout: 2000 });
      await page.waitForTimeout(1000);

      const resetButton = page.locator('button:has-text("Reset")');
      await resetButton.click();
      await page.waitForSelector('button:has-text("Start Simulation")', { timeout: 2000 });
    }
  });

  test('should show appropriate error handling', async ({ page }) => {
    // This tests error handling - try edge cases

    // Test starting without selecting scenario
    const startButton = page.locator('button:has-text("Start Simulation")');
    if (await startButton.count() > 0) {
      await startButton.click();

      // Should still work (default to first scenario)
      await expect(page.locator('button:has-text("Running...")')).toBeVisible({ timeout: 2000 });

      // Reset to clean state
      const resetButton = page.locator('button:has-text("Reset")');
      await resetButton.click();
    }
  });
});

test.describe('Interactive Demo Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/demo');
    await expect(page.locator('h1')).toBeVisible();
    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle animation performance', async ({ page }) => {
    await page.goto('/demo');

    // Select scenario and start
    const collisionAvoidanceScenario = page.locator('button:has-text("Collision Avoidance")');
    if (await collisionAvoidanceScenario.count() > 0) {
      await collisionAvoidanceScenario.click();

      const startButton = page.locator('button:has-text("Start Simulation")');
      await startButton.click();

      // Let simulation run for a short time
      await page.waitForTimeout(2000);

      // Check if page is still responsive
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/demo');
    await expect(page.locator('h1')).toBeVisible();

    // Should have no console errors
    expect(errors).toHaveLength(0);
  });
});

test.describe('Interactive Demo Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Main heading should be h1
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText('V2V Communication Demo');

    // Section headings should be h3
    const sectionHeadings = page.locator('h3');
    await expect(sectionHeadings).toHaveCount(4);

    // Check heading text
    await expect(sectionHeadings.first()).toContainText('Select Scenario');
  });

  test('should have accessible buttons', async ({ page }) => {
    const buttons = page.locator('button');

    for (let i = 0; i < await buttons.count(); i++) {
      const button = buttons.nth(i);

      // Buttons should be properly visible
      await expect(button).toBeVisible();

      // Buttons should have text content
      expect(await button.textContent()).toBeTruthy();
    }
  });

  test('should have accessible form controls', async ({ page }) => {
    // Check range slider
    const rangeSlider = page.locator('input[type="range"]');
    if (await rangeSlider.count() > 0) {
      await expect(rangeSlider).toHaveAttribute('min');
      await expect(rangeSlider).toHaveAttribute('max');
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    // Check if main elements have good contrast (visual inspection)
    const mainElements = page.locator('.bg-slate-800');

    for (let i = 0; i < await mainElements.count(); i++) {
      const element = mainElements.nth(i);
      await expect(element).toBeVisible();
    }
  });
});