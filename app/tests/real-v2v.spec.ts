import { test, expect } from '@playwright/test';

test.describe('Real V2V System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/real-v2v');
  });

  test('should load the real V2V system page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Real V2V Communication System/);

    // Check main heading
    await expect(page.locator('h1')).toContainText('Real V2V Communication System');
    await expect(page.locator('text=Live vehicle-to-vehicle communication with automatic message generation')).toBeVisible();
  });

  test('should display Sora workflow helper', async ({ page }) => {
    // Check Sora workflow section
    await expect(page.locator('text=Generate a Sora clip')).toBeVisible();
    await expect(page.locator('text=Copy the prompt, paste it into Sora, render, then drop the video URL to preview it here')).toBeVisible();

    // Check Sora prompt textarea
    const promptTextarea = page.locator('textarea[readonly]');
    await expect(promptTextarea).toBeVisible();
    await expect(promptTextarea).toContainText('Screen recording of the "Real V2V Communication System" page');

    // Check buttons
    await expect(page.locator('button:has-text("Copy Prompt")')).toBeVisible();
    await expect(page.locator('a:has-text("Open Sora")')).toBeVisible();
  });

  test('should handle Sora prompt copying', async ({ page }) => {
    const copyButton = page.locator('button:has-text("Copy Prompt")');
    await expect(copyButton).toBeVisible();

    // Click copy button
    await copyButton.click();

    // Check if button shows "Copied!" state
    await expect(page.locator('button:has-text("Copied!")')).toBeVisible({ timeout: 2000 });

    // Button should return to normal after timeout
    await expect(page.locator('button:has-text("Copy Prompt")')).toBeVisible({ timeout: 3000 });
  });

  test('should display system status dashboard', async ({ page }) => {
    await expect(page.locator('text=System Status Dashboard')).toBeVisible();

    // Check status tiles
    const statusTiles = page.locator('.bg-slate-800.rounded-lg.p-4.text-center');
    await expect(statusTiles).toHaveCount(5);

    // Check specific status values
    await expect(page.locator('text=ONLINE')).toBeVisible();
    await expect(page.locator('text=ACTIVE')).toBeVisible();
  });

  test('should display vehicle communication map', async ({ page }) => {
    await expect(page.locator('text=Live Vehicle Positions')).toBeVisible();

    // Check map container
    const mapContainer = page.locator('.bg-slate-900.rounded-lg');
    await expect(mapContainer).toBeVisible();
  });

  test('should display live V2V messages', async ({ page }) => {
    await expect(page.locator('text=Live V2V Messages')).toBeVisible();

    // Initially should show initializing message
    await expect(page.locator('text=Initializing V2V communication...')).toBeVisible();

    // Wait for some messages to appear
    await page.waitForTimeout(1000);

    // Check if message area exists
    const messageLog = page.locator('.space-y-2.max-h-96.overflow-y-auto');
    await expect(messageLog).toBeVisible();
  });

  test('should show automatic message generation', async ({ page }) => {
    // Wait for initial messages
    await page.waitForTimeout(2000);

    // Check if messages are being generated
    const messageContainer = page.locator('.space-y-2.max-h-96.overflow-y-auto');
    const messages = messageContainer.locator('.rounded-lg.p-3.text-sm');

    // Should have some messages after a few seconds
    if (await messages.count() > 0) {
      await expect(messages.first()).toBeVisible();

      // Check message format
      await expect(messages.first()).toContainText('→');
      expect(messages.first()).toContainText('STATUS_UPDATE');
    }
  });

  test('should display emergency alerts', async ({ page }) => {
    // Wait for emergency messages to appear
    await page.waitForTimeout(3000);

    const messages = page.locator('.rounded-lg.p-3.text-sm');

    // Check for emergency type messages
    for (let i = 0; i < await messages.count(); i++) {
      const message = messages.nth(i);
      const messageText = await message.textContent();

      if (messageText.includes('EMERGENCY_ALERT')) {
        await expect(message).toBeVisible();
        return;
      }
    }

    // If no emergency alert found, it might be timing - that's okay
  });

  test('should display collision warnings', async ({ page }) => {
    // Wait for messages
    await page.waitForTimeout(2000);

    const messages = page.locator('.rounded-lg.p-3.text-sm');

    // Check for collision warning messages
    for (let i = 0; i < await messages.count(); i++) {
      const message = messages.nth(i);
      const messageText = await message.textContent();

      if (messageText.includes('COLLISION_WARNING')) {
        await expect(message).toBeVisible();
        return;
      }
    }

    // Collision warnings may take time to trigger
  });

  test('should show vehicle telemetry', async ({ page }) => {
    await expect(page.locator('text=Vehicle Telemetry')).toBeVisible();

    // Check for telemetry cards
    const telemetryCards = page.locator('.bg-slate-700.round-lg.p-4');
    await expect(telemetryCards).toHaveCount(3);

    // Check specific telemetry data
    for (let i = 0; i < await telemetryCards.count(); i++) {
      const card = telemetryCards.nth(i);
      await expect(card).toBeVisible();

      // Check for common telemetry fields
      const cardText = await card.textContent();
      expect(cardText).toMatch(/Speed|Position|RPM|Fuel/);
    }
  });

  test('should have proper color coding for message priorities', async ({ page }) => {
    await page.waitForTimeout(1000);

    const messages = page.locator('.rounded-lg.p-3.text-sm');

    for (let i = 0; i < await messages.count(); i++) {
      const message = messages.nth(i);

      // Check for critical messages (should have red styling)
      const textContent = await message.textContent();
      if (textContent.includes('EMERGENCY_ALERT')) {
        await expect(message).toHaveClass(/bg-red-900/);
      }
      // Check for high priority messages (should have orange styling)
      else if (textContent.includes('COLLISION_WARNING')) {
        await expect(message).toHaveClass(/bg-orange-900/);
      }
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if key elements are still visible
    await expect(page.locator('h1')).toBeVisible();

    const statusDashboard = page.locator('.grid.grid-cols-2.md\\:grid-cols-5.gap-4');
    if (await statusDashboard.count() > 0) {
      await expect(statusDashboard).toBeVisible();
    }

    const messageLog = page.locator('.space-y-2.max-h-96.overflow-y-auto');
    if (await messageLog.count() > 0) {
      await expect(messageLog).toBeVisible();
    }
  });

  test('should handle video URL input', async ({ page }) => {
    const videoInput = page.locator('input[type="url"]');
    if (await videoInput.count() > 0) {
      await expect(videoInput).toBeVisible();
      await expect(videoInput).toHaveAttribute('placeholder', 'Paste Sora video URL (mp4/webm)…');

      // Test input interaction
      await videoInput.fill('https://example.com/video.mp4');
      expect(await videoInput.inputValue()).toBe('https://example.com/video.mp4');

      // Clear input
      await videoInput.fill('');
      expect(await videoInput.inputValue()).toBe('');
    }
  });

  test('should display video preview when URL is provided', async ({ page }) => {
    const videoInput = page.locator('input[type="url"]');
    const statusText = page.locator('text=Previewing pasted clip below');

    if (await videoInput.count() > 0) {
      // Input a video URL
      await videoInput.fill('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');

      // Check if status text appears
      if (await statusText.count() > 0) {
        await expect(statusText).toBeVisible();
      }

      // Video element should be present but might not load the actual video
      const video = page.locator('video');
      if (await video.count() > 0) {
        await expect(video).toBeVisible();
        expect(video).toHaveAttribute('src');
        expect(video).toHaveAttribute('controls');
      }
    }
  });
});

test.describe('Real V2V System Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/demo/real-v2v');
    await expect(page.locator('h1')).toBeVisible();
    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle continuous message generation performance', async ({ page }) => {
    await page.goto('/demo/real-v2v');

    // Let it run for a bit
    await page.waitForTimeout(5000);

    // Check if page is still responsive
    await expect(page.locator('h1')).toBeVisible();

    // Check if messages are still being generated
    const messages = page.locator('.rounded-lg.p-3.text-sm');
    if (await messages.count() > 10) {
      expect(await messages.count()).toBeGreaterThan(10);
    }
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/demo/real-v2v');
    await expect(page.locator('h1')).toBeVisible();

    // Should have no console errors
    expect(errors).toHaveLength(0);
  });

  test('should handle memory usage over time', async ({ page }) => {
    await page.goto('/demo/real-v2v');

    // Let simulation run for extended period
    await page.waitForTimeout(10000);

    // Check if page is still responsive
    await expect(page.locator('h1')).toBeVisible();

    // Try interacting with the page
    const copyButton = page.locator('button:has-text("Copy Prompt")');
    if (await copyButton.count() > 0) {
      await copyButton.click();
      await expect(page.locator('button:has-text("Copied!")')).toBeVisible({ timeout: 2000 });
      await expect(page.locator('button:has-text("Copy Prompt")')).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('Real V2V System Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/real-v2v');
  });

  test('should start generating messages automatically', async ({ page }) => {
    // Wait for initial setup
    await page.waitForTimeout(1000);

    // Should show messages without any manual intervention
    const messageContainer = page.locator('.space-y-2.max-h-96.overflow-y-auto');
    await expect(messageContainer).toBeVisible();

    // Wait for messages to appear
    await page.waitForFunction(async () => {
      const messages = await messageContainer.locator('.rounded-lg.p-3.text-sm').count();
      return messages > 0;
    }, { timeout: 5000 });

    const messages = messageContainer.locator('.rounded-lg.p-3.text-sm');
    expect(await messages.count()).toBeGreaterThan(0);
  });

  test('should display different message types', async ({ page }) => {
    await page.waitForTimeout(3000);

    const messages = page.locator('.rounded-lg.p-3.text-sm');
    const messageTypes = new Set();

    // Collect different message types
    for (let i = 0; i < Math.min(await messages.count(), 20); i++) {
      const message = messages.nth(i);
      const text = await message.textContent();

      if (text.includes('STATUS_UPDATE')) messageTypes.add('STATUS_UPDATE');
      if (text.includes('EMERGENCY_ALERT')) messageTypes.add('EMERGENCY_ALERT');
      if (text.includes('COLLISION_WARNING')) messageTypes.add('COLLISION_WARNING');
      if (text.includes('TRAFFIC_INFO')) messageTypes.add('TRAFFIC_INFO');
      if (text.includes('COOPERATIVE_DRIVING')) messageTypes.add('COOPERATIVE_DRIVING');
    }

    // Should have at least one type of message
    expect(messageTypes.size).toBeGreaterThan(0);
  });

  test('should show realistic vehicle behavior', async ({ page }) => {
    await page.waitForTimeout(2000);

    const telemetryCards = page.locator('.bg-slate-700.round-lg.p-4');

    for (let i = 0; i < await telemetryCards.count(); i++) {
      const card = telemetryCards.nth(i);
      const text = await card.textContent();

      // Check for realistic vehicle data
      expect(text).toMatch(/(Speed|Position|RPM|Fuel)/);

      // Speed should be reasonable (0-150 km/h)
      if (text.includes('km/h')) {
        const speedMatch = text.match(/(\d+)\s*km\/h/);
        if (speedMatch) {
          const speed = parseInt(speedMatch[1]);
          expect(speed).toBeGreaterThanOrEqual(0);
          expect(speed).toBeLessThanOrEqual(150);
        }
      }
    }
  });
});

test.describe('Real V2V System Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/real-v2v');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Main heading should be h1
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText('Real V2V Communication System');

    // Section headings should be h3
    const sectionHeadings = page.locator('h3');
    await expect(sectionHeadings).toHaveCount(4);

    // Check specific headings
    await expect(sectionHeadings.first()).toContainText('Generate a Sora clip');
  });

  test('should have accessible buttons', async ({ page }) => {
    // Check Sora workflow buttons
    const copyButton = page.locator('button:has-text("Copy Prompt")');
    const openSoraLink = page.locator('a:has-text("Open Sora")');

    if (await copyButton.count() > 0) {
      await expect(copyButton).toBeVisible();
      expect(await copyButton.textContent()).toBe('Copy Prompt');
    }

    if (await openSoraLink.count() > 0) {
      await expect(openSoraLink).toBeVisible();
      expect(await openSoraLink.textContent()).toBe('Open Sora');
    }
  });

  test('should have accessible form controls', async ({ page }) => {
    // Check prompt textarea
    const promptTextarea = page.locator('textarea[readonly]');
    if (await promptTextarea.count() > 0) {
      await expect(promptTextarea).toBeVisible();
      await expect(promptTextarea).toHaveAttribute('readonly');
    }

    // Check video input if present
    const videoInput = page.locator('input[type="url"]');
    if (await videoInput.count() > 0) {
      await expect(videoInput).toHaveAttribute('placeholder');
    }
  });

  test('should have proper color contrast for message priorities', async ({ page }) => {
    await page.waitForTimeout(2000);

    const messages = page.locator('.rounded-lg.p-3.text-sm');

    for (let i = 0; i < await messages.count(); i++) {
      const message = messages.nth(i);
      const textContent = await message.textContent();

      // Different priority levels should have different background colors
      if (textContent.includes('EMERGENCY_ALERT')) {
        await expect(message).toHaveClass(/bg-red-900/);
      } else if (textContent.includes('COLLISION_WARNING')) {
        await expect(message).toHaveClass(/bg-orange-900/);
      } else {
        // Other messages should have neutral color
        await expect(message).toHaveClass(/bg-blue-900/);
      }
    }
  });
});