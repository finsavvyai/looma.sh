/**
 * Simplified Video Generation Script
 * Uses Playwright instead of Puppeteer (more reliable)
 * 
 * Setup:
 * npm install playwright
 * npx playwright install chromium
 */

const { chromium } = require('playwright');

const PLATFORM_URL = 'https://higgsfield.ai/create/video';
const EMAIL = 'shacharsol@gmail.com';
const PASSWORD = 'Daniel0304##';

const SCENES = [
  {
    name: 'Scene 1: Problem',
    prompt: `Dark highway at night, multiple cars driving in isolation, sudden brake lights flash, 
near-miss accident scene, dramatic lighting, cinematic wide shot, blue and red emergency 
lights, tension building, 4K quality, professional cinematography, smooth dolly forward`,
    duration: '12',
    model: 'OpenAI Sora 2'
  },
  {
    name: 'Scene 2: Solution',
    prompt: `Futuristic 3D network visualization, vehicles connected by glowing blue and purple energy 
lines, data packets flowing between cars, holographic interface overlay, cyberpunk aesthetic, 
smooth camera dolly forward, edge computing nodes visible, 4K, cinematic lighting, 
professional tech visualization`,
    duration: '12',
    model: 'OpenAI Sora 2'
  },
  {
    name: 'Scene 3: Security',
    prompt: `Close-up of Ed25519 cryptographic keys rotating in 3D space, encryption algorithms 
visualized as glowing code, protective shield forming around vehicles, military-grade 
security symbols, blue and purple gradient, smooth zoom out, professional tech visualization, 
cinematic quality`,
    duration: '12',
    model: 'OpenAI Sora 2'
  },
  {
    name: 'Scene 4: Network',
    prompt: `Global world map with Cloudflare edge nodes lighting up across continents, vehicles 
connecting worldwide, data packets flowing instantly between locations, network topology 
visualization, blue energy pulses, smooth camera orbit around globe, futuristic tech aesthetic, 
4K quality`,
    duration: '12',
    model: 'OpenAI Sora 2'
  },
  {
    name: 'Scene 5: Smart Cities',
    prompt: `Aerial view of smart city at sunset, traffic flowing smoothly through intelligent intersections, 
emergency vehicles with clear priority routes highlighted in red, green traffic optimization 
visible, city lights twinkling, smooth drone camera movement, cinematic quality, 4K, 
professional aerial cinematography`,
    duration: '12',
    model: 'OpenAI Sora 2'
  },
  {
    name: 'Scene 6: Fleet',
    prompt: `Fleet of delivery trucks on optimized routes, GPS visualization showing efficient paths, 
fuel savings metrics displayed as holographic overlay, trucks communicating in real-time, 
smooth tracking shot following convoy, professional commercial aesthetic, 4K, cinematic 
movement`,
    duration: '12',
    model: 'OpenAI Sora 2'
  },
  {
    name: 'Scene 7: Technology',
    prompt: `Tech stack visualization with Cloudflare Workers logo, code snippets floating in 3D space, 
API responses flowing rapidly, edge computing architecture diagram, blue and purple tech 
aesthetic, smooth camera movement through tech elements, professional developer-focused 
visualization, 4K`,
    duration: '12',
    model: 'OpenAI Sora 2'
  },
  {
    name: 'Scene 8: CTA',
    prompt: `Looma.sh logo revealed in dramatic fashion, website interface with live demo dashboard, 
real-time V2V messages visible, inspiring final shot of connected vehicles on futuristic 
highway, smooth zoom out, cinematic ending, blue and purple gradient, 4K quality, 
professional reveal`,
    duration: '12',
    model: 'OpenAI Sora 2'
  }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateScene(page, scene, index) {
  console.log(`\n🎬 Starting ${scene.name} (${index + 1}/8)...`);
  
  try {
    // Navigate to generation page (refresh if already there)
    try {
      await page.goto(PLATFORM_URL, { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    } catch (e) {
      // If already on page, just reload
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    }
    await sleep(3000);
    
    // Fill prompt - try multiple selectors
    const promptSelectors = [
      'textarea',
      'input[type="text"]',
      '[placeholder*="prompt"]',
      '[placeholder*="describe"]',
      '[data-testid="prompt"]'
    ];
    
    let promptField = null;
    for (const selector of promptSelectors) {
      try {
        promptField = await page.waitForSelector(selector, { timeout: 5000 });
        if (promptField) break;
      } catch (e) {
        continue;
      }
    }
    
    if (!promptField) {
      throw new Error('Could not find prompt field');
    }
    
    await promptField.click({ clickCount: 3 });
    await promptField.fill(scene.prompt);
    await sleep(1000);
    
    // Try to set model and duration (if selectors exist)
    try {
      const modelSelect = await page.$('select[name="model"], [aria-label*="model"]');
      if (modelSelect) {
        await modelSelect.selectOption({ label: scene.model });
        await sleep(500);
      }
    } catch (e) {
      console.log('⚠️  Model selector not found, skipping...');
    }
    
    try {
      const durationSelect = await page.$('select[name="duration"], [aria-label*="duration"]');
      if (durationSelect) {
        await durationSelect.selectOption({ value: scene.duration });
        await sleep(500);
      }
    } catch (e) {
      console.log('⚠️  Duration selector not found, skipping...');
    }
    
    // Click generate button
    const generateSelectors = [
      'button:has-text("Generate")',
      'button[type="submit"]',
      '[data-testid="generate"]',
      'button:has-text("Create")'
    ];
    
    let generateButton = null;
    for (const selector of generateSelectors) {
      try {
        generateButton = await page.$(selector);
        if (generateButton) break;
      } catch (e) {
        continue;
      }
    }
    
    if (!generateButton) {
      // Try to find any button with "Generate" text
      generateButton = await page.locator('button').filter({ hasText: /generate/i }).first();
    }
    
    if (generateButton) {
      await generateButton.click();
      console.log(`⏳ ${scene.name} generation started. Waiting...`);
      
      // Wait a bit for processing to start
      await sleep(5000);
      
      console.log(`✅ ${scene.name} submitted! Check the page for progress.`);
      console.log(`💡 This script submits the generation - you'll need to download manually when ready.`);
    } else {
      throw new Error('Could not find generate button');
    }
    
    return { success: true, scene: scene.name };
    
  } catch (error) {
    console.error(`❌ Error generating ${scene.name}:`, error.message);
    return { success: false, scene: scene.name, error: error.message };
  }
}

async function main() {
  console.log('🚀 Starting automated video generation for Looma.sh (Playwright version)\n');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500, // Slow down actions so you can see what's happening
    timeout: 120000 // 2 minute timeout for browser launch
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('💡 Opening browser...');
    console.log('🌐 Navigating to higgsfield.ai (this may take a moment)...');
    
    // Try with more lenient wait strategy
    try {
      await page.goto(PLATFORM_URL, { 
        waitUntil: 'domcontentloaded', 
        timeout: 120000 
      });
    } catch (e) {
      console.log('⚠️  Page load timeout, but continuing anyway...');
      // Page might still be usable
    }
    
    await sleep(3000); // Give time to see the page
    
    console.log('✅ Browser opened!');
    console.log('⏸️  Pausing for 15 seconds - please log in if needed...');
    console.log('💡 After logging in, the script will automatically continue...');
    await sleep(15000);
    
    const results = [];
    
    // Generate each scene
    for (let i = 0; i < SCENES.length; i++) {
      const result = await generateScene(page, SCENES[i], i);
      results.push(result);
      
      // Wait before next scene
      if (i < SCENES.length - 1) {
        console.log('⏸️  Waiting 10 seconds before next scene...\n');
        await sleep(10000);
      }
    }
    
    // Summary
    console.log('\n📊 Generation Summary:');
    console.log('='.repeat(50));
    results.forEach((result) => {
      if (result.success) {
        console.log(`✅ ${result.scene}`);
      } else {
        console.log(`❌ ${result.scene}: ${result.error}`);
      }
    });
    
    console.log('\n🎉 All scenes submitted!');
    console.log('💡 Check the browser - videos are generating in the background.');
    console.log('💡 You can download them when they\'re ready.');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    console.log('\n💡 Browser will stay open for 60 seconds...');
    await sleep(60000);
    await browser.close();
  }
}

main().catch(console.error);


