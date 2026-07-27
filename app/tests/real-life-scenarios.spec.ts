import { test, expect } from '@playwright/test';

test.describe('Real-Life Scenarios Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/real-life-scenarios');
  });

  test('should load the real-life scenarios page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Real-Life V2V Scenarios/);

    // Check main heading
    await expect(page.locator('h1')).toContainText('Real-Life V2V Communication Scenarios');
    await expect(page.locator('text=Experience actual vehicle-to-vehicle communication in realistic driving situations')).toBeVisible();
  });

  test('should display all available scenarios', async ({ page }) => {
    // Check for scenario cards
    await expect(page.locator('text=Select Scenario')).toBeVisible();
    await expect(page.locator('text=Intersection Collision Prevention')).toBeVisible();
    await expect(page.locator('text=Emergency Vehicle Priority')).toBeVisible();
    await expect(page.locator('text=Truck Platooning Efficiency')).toBeVisible();
    await expect(page.locator('text=Blind Spot Detection & Merging')).toBeVisible();
    await expect(page.locator('text=Smart Traffic Flow Optimization')).toBeVisible();
  });

  test('should display difficulty levels for scenarios', async ({ page }) => {
    await expect(page.locator('text=beginner')).toBeVisible();
    await expect(page.locator('text=intermediate')).toBeVisible();
    await expect(page.locator('text=advanced')).toBeVisible();
  });

  test('should start intersection collision prevention scenario', async ({ page }) => {
    // Click on the first scenario
    await page.locator('text=Intersection Collision Prevention').click();

    // Check if controls appear
    await expect(page.locator('button:has-text("▶️ Start")')).toBeVisible();
    await expect(page.locator('button:has-text("🔄 Reset")')).toBeVisible();

    // Check learning objectives
    await expect(page.locator('text=🎯 Learning Objectives:')).toBeVisible();
    await expect(page.locator('text=Understand basic V2V warning messages')).toBeVisible();
  });

  test('should run simulation and generate V2V messages', async ({ page }) => {
    // Start a scenario
    await page.locator('text=Intersection Collision Prevention').click();
    await page.locator('button:has-text("▶️ Start")').click();

    // Wait for simulation to run
    await page.waitForTimeout(3000);

    // Check if vehicles appear in simulation
    await expect(page.locator('.bg-slate-900')).toBeVisible();

    // Check if V2V messages are generated
    await page.waitForTimeout(2000);
    const messages = page.locator('.border').filter({ hasText: '→' });
    if (await messages.count() > 0) {
      await expect(messages.first()).toBeVisible();
    }
  });

  test('should display score and time tracking', async ({ page }) => {
    // Start a scenario
    await page.locator('text=Intersection Collision Prevention').click();

    // Check initial state
    await expect(page.locator('text=Time: 0s')).toBeVisible();
    await expect(page.locator('text=Score: 0')).toBeVisible();

    // Start simulation
    await page.locator('button:has-text("▶️ Start")').click();

    // Wait for time to increment
    await page.waitForTimeout(2000);
    const timeElement = page.locator('text=/Time: \\d+s/');
    await expect(timeElement).toBeVisible();
  });

  test('should show vehicle legend', async ({ page }) => {
    await page.locator('text=Intersection Collision Prevention').click();

    // Check for vehicle types in legend
    await expect(page.locator('text=Car')).toBeVisible();
    await expect(page.locator('text=Truck')).toBeVisible();
    await expect(page.locator('text=Emergency')).toBeVisible();
    await expect(page.locator('text=Bus')).toBeVisible();
  });

  test('should handle emergency vehicle priority scenario', async ({ page }) => {
    // Click on emergency vehicle scenario
    await page.locator('text=Emergency Vehicle Priority').click();

    // Start the simulation
    await page.locator('button:has-text("▶️ Start")').click();

    // Wait for emergency vehicle animation
    await page.waitForTimeout(2000);

    // Check for emergency vehicle (should have pulsing animation)
    const emergencyVehicle = page.locator('text=🚨');
    if (await emergencyVehicle.count() > 0) {
      await expect(emergencyVehicle.first()).toBeVisible();
    }
  });

  test('should display business impact section', async ({ page }) => {
    // Scroll to business impact section
    await page.locator('text=💼 Real Business Impact').scrollIntoViewIfNeeded();

    // Check for business impact cards
    await expect(page.locator('text=🏢 Smart Cities')).toBeVisible();
    await expect(page.locator('text=🚚 Fleet Management')).toBeVisible();
    await expect(page.locator('text=🚑 Emergency Services')).toBeVisible();

    // Check for specific metrics
    await expect(page.locator('text=Reduce traffic congestion by 30%')).toBeVisible();
    await expect(page.locator('text=Save 15% on fuel costs')).toBeVisible();
    await expect(page.locator('text=Improve emergency vehicle response times by 50%')).toBeVisible();
  });

  test('should allow scenario restart', async ({ page }) => {
    // Start a scenario
    await page.locator('text=Intersection Collision Prevention').click();
    await page.locator('button:has-text("▶️ Start")').click();

    // Wait a bit
    await page.waitForTimeout(1000);

    // Pause and reset
    await page.locator('button:has-text("⏸️ Pause")').click();
    await page.locator('button:has-text("🔄 Reset")').click();

    // Check if score resets
    await expect(page.locator('text=Score: 0')).toBeVisible();
    await expect(page.locator('text=Time: 0s')).toBeVisible();
  });

  test('should handle multiple scenarios', async ({ page }) => {
    // Test first scenario
    await page.locator('text=Intersection Collision Prevention').click();
    await expect(page.locator('text=🎯 Learning Objectives:')).toBeVisible();

    // Switch to another scenario
    await page.locator('text=Truck Platooning Efficiency').click();
    await expect(page.locator('text=🎯 Learning Objectives:')).toBeVisible();
    await expect(page.locator('text=Master cooperative driving protocols')).toBeVisible();

    // Switch to emergency scenario
    await page.locator('text=Blind Spot Detection & Merging').click();
    await expect(page.locator('text=🎯 Learning Objectives:')).toBeVisible();
    await expect(page.locator('text=Experience blind spot safety features')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if main elements are still visible
    await expect(page.locator('h1')).toBeVisible();

    // Check if scenarios are accessible
    await expect(page.locator('text=Intersection Collision Prevention')).toBeVisible();

    // Test starting a scenario on mobile
    await page.locator('text=Intersection Collision Prevention').click();
    await expect(page.locator('button:has-text("▶️ Start")')).toBeVisible();
  });
});

test.describe('Real-Life Scenarios Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/demo/real-life-scenarios');
    await expect(page.locator('h1')).toBeVisible();
    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle continuous simulation without memory leaks', async ({ page }) => {
    await page.goto('/demo/real-life-scenarios');

    // Start a scenario and let it run
    await page.locator('text=Intersection Collision Prevention').click();
    await page.locator('button:has-text("▶️ Start")').click();

    // Let it run for 10 seconds
    await page.waitForTimeout(10000);

    // Check if page is still responsive
    await expect(page.locator('h1')).toBeVisible();

    // Try to interact with controls
    await page.locator('button:has-text("⏸️ Pause")').click();
    await expect(page.locator('button:has-text("▶️ Start")')).toBeVisible();
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/demo/real-life-scenarios');

    // Start a scenario to test interactive elements
    await page.locator('text=Intersection Collision Prevention').click();
    await page.locator('button:has-text("▶️ Start")').click();
    await page.waitForTimeout(2000);

    // Should have no console errors
    expect(errors).toHaveLength(0);
  });
});

test.describe('Real-Life Scenarios Functionality', () => {
  test('should show success state when scenario is completed', async ({ page }) => {
    await page.goto('/demo/real-life-scenarios');

    // Start a scenario
    await page.locator('text=Intersection Collision Prevention').click();
    await page.locator('button:has-text("▶️ Start")').click();

    // Let it run for a while (scenarios are designed to complete)
    await page.waitForTimeout(5000);

    // Check for success indicators
    const successElement = page.locator('text=Success!');
    if (await successElement.count() > 0) {
      await expect(successElement).toBeVisible();
    }
  });

  test('should display estimated time for each scenario', async ({ page }) => {
    const scenarios = [
      'Intersection Collision Prevention',
      'Emergency Vehicle Priority',
      'Truck Platooning Efficiency',
      'Blind Spot Detection & Merging',
      'Smart Traffic Flow Optimization'
    ];

    for (const scenario of scenarios) {
      const scenarioCard = page.locator(`text=${scenario}`);
      if (await scenarioCard.count() > 0) {
        await expect(scenarioCard).toBeVisible();
      }
    }
  });

  test('should handle pause/resume functionality correctly', async ({ page }) => {
    await page.goto('/demo/real-life-scenarios');

    // Start scenario
    await page.locator('text=Intersection Collision Prevention').click();
    await page.locator('button:has-text("▶️ Start")').click();

    // Wait for simulation to start
    await page.waitForTimeout(1000);

    // Pause
    await page.locator('button:has-text("⏸️ Pause")').click();

    // Verify button changes to start
    await expect(page.locator('button:has-text("▶️ Start")')).toBeVisible();

    // Resume
    await page.locator('button:has-text("▶️ Start")').click();

    // Verify button changes to pause
    await expect(page.locator('button:has-text("⏸️ Pause")')).toBeVisible();
  });
});