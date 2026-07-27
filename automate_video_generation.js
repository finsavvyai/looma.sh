/**
 * Automated Video Generation Script for Looma.sh
 * 
 * This script automates the video generation process using browser automation.
 * 
 * Setup:
 * 1. Install Node.js (https://nodejs.org)
 * 2. Run: npm install puppeteer
 * 3. Update the selectors below to match your platform
 * 4. Run: node automate_video_generation.js
 */

const puppeteer = require('puppeteer');

// Load environment variables (optional - install dotenv: npm install dotenv)
// require('dotenv').config();

// Your video generation platform URL
const PLATFORM_URL = process.env.PLATFORM_URL || 'https://higgsfield.ai/create/video';

// Login credentials (or use session cookie)
// ⚠️ SECURITY: Don't commit passwords to git! Use .env file instead
const EMAIL = process.env.EMAIL || 'shacharsol@gmail.com';
const PASSWORD = process.env.PASSWORD || 'Daniel0304##';

// All 8 scenes with prompts
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

// CSS Selectors - UPDATE THESE to match your platform
const SELECTORS = {
  // Login
  emailInput: 'input[type="email"], input[name="email"]',
  passwordInput: 'input[type="password"], input[name="password"]',
  loginButton: 'button[type="submit"], button:contains("Log in"), button:contains("Sign in")',
  
  // Video generation
  promptField: 'textarea, input[placeholder*="prompt"], input[placeholder*="describe"]',
  modelSelect: 'select[name="model"], [aria-label*="model"], .model-selector',
  durationSelect: 'select[name="duration"], [aria-label*="duration"], .duration-selector',
  generateButton: 'button:contains("Generate"), button[type="submit"]',
  
  // Status
  processingIndicator: '.processing, .generating, [aria-label*="processing"]',
  completedIndicator: '.completed, .ready, [aria-label*="complete"]',
  downloadButton: 'button:contains("Download"), a:contains("Download")'
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function login(page) {
  console.log('🔐 Logging in...');
  
  try {
    await page.goto(PLATFORM_URL);
    await page.waitForSelector(SELECTORS.emailInput, { timeout: 10000 });
    
    await page.type(SELECTORS.emailInput, EMAIL);
    await page.type(SELECTORS.passwordInput, PASSWORD);
    await page.click(SELECTORS.loginButton);
    
    // Wait for login to complete
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Logged in successfully!');
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    console.log('💡 Tip: You might need to log in manually and use session cookies instead');
    throw error;
  }
}

async function generateScene(page, scene, index) {
  console.log(`\n🎬 Starting ${scene.name} (${index + 1}/8)...`);
  
  try {
    // Navigate to generation page if needed
    await page.goto(PLATFORM_URL + '/generate', { waitUntil: 'networkidle0' });
    
    // Select model
    if (SELECTORS.modelSelect) {
      await page.waitForSelector(SELECTORS.modelSelect);
      await page.select(SELECTORS.modelSelect, scene.model);
      await sleep(1000);
    }
    
    // Set duration
    if (SELECTORS.durationSelect) {
      await page.waitForSelector(SELECTORS.durationSelect);
      await page.select(SELECTORS.durationSelect, scene.duration);
      await sleep(1000);
    }
    
    // Fill prompt
    await page.waitForSelector(SELECTORS.promptField);
    await page.click(SELECTORS.promptField, { clickCount: 3 }); // Select all
    await page.type(SELECTORS.promptField, scene.prompt);
    await sleep(1000);
    
    // Click generate
    await page.waitForSelector(SELECTORS.generateButton);
    await page.click(SELECTORS.generateButton);
    
    console.log(`⏳ ${scene.name} generation started. Waiting for completion...`);
    
    // Wait for processing to start
    await page.waitForSelector(SELECTORS.processingIndicator, { timeout: 30000 });
    console.log(`🔄 ${scene.name} is processing...`);
    
    // Wait for completion (adjust timeout as needed)
    await page.waitForSelector(SELECTORS.completedIndicator, { timeout: 300000 }); // 5 minutes max
    console.log(`✅ ${scene.name} completed!`);
    
    // Download if button available
    try {
      await page.waitForSelector(SELECTORS.downloadButton, { timeout: 5000 });
      await page.click(SELECTORS.downloadButton);
      console.log(`📥 ${scene.name} download started`);
    } catch (e) {
      console.log(`ℹ️  Download button not found - download manually`);
    }
    
    return { success: true, scene: scene.name };
    
  } catch (error) {
    console.error(`❌ Error generating ${scene.name}:`, error.message);
    return { success: false, scene: scene.name, error: error.message };
  }
}

async function main() {
  console.log('🚀 Starting automated video generation for Looma.sh\n');
  
  let browser;
  let page;
  
  try {
    // Launch browser with better error handling
    console.log('🌐 Launching browser...');
    
    // Try to find Chrome executable
    let executablePath;
    const possiblePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser'
    ];
    
    for (const path of possiblePaths) {
      try {
        const fs = require('fs');
        if (fs.existsSync(path)) {
          executablePath = path;
          console.log(`✅ Found Chrome at: ${path}`);
          break;
        }
      } catch (e) {
        // Continue searching
      }
    }
    
    const launchOptions = {
      headless: false, // Set to true to run in background
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ],
      ignoreHTTPSErrors: true,
      timeout: 120000, // 120 second timeout
      protocolTimeout: 120000
    };
    
    if (executablePath) {
      launchOptions.executablePath = executablePath;
    }
    
    browser = await puppeteer.launch(launchOptions);
    
    console.log('✅ Browser launched successfully!');
    
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set longer timeouts
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);
  
    // Login (or skip if using session cookies)
    // await login(page);
    
    // Or use existing session
    console.log('💡 Navigating to platform...');
    await page.goto(PLATFORM_URL, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    await sleep(5000); // Give time to see the page
    
    const results = [];
    
    // Generate each scene
    for (let i = 0; i < SCENES.length; i++) {
      const result = await generateScene(page, SCENES[i], i);
      results.push(result);
      
      // Wait before next scene (if not last)
      if (i < SCENES.length - 1) {
        console.log('⏸️  Waiting 5 seconds before next scene...\n');
        await sleep(5000);
      }
    }
    
    // Summary
    console.log('\n📊 Generation Summary:');
    console.log('===================');
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`✅ ${result.scene}`);
      } else {
        console.log(`❌ ${result.scene}: ${result.error}`);
      }
    });
    
    console.log('\n🎉 All scenes processed!');
    console.log('💡 Check your downloads folder or the platform\'s download section.');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error('Stack:', error.stack);
    
    // Try to close browser if it exists
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Error closing browser:', e.message);
      }
    }
    
    process.exit(1);
  } finally {
    // Keep browser open for manual checks
    if (browser && page) {
      console.log('\n💡 Browser will stay open for 60 seconds for manual checks...');
      console.log('💡 Press Ctrl+C to close immediately');
      try {
        await sleep(60000);
        await browser.close();
      } catch (e) {
        console.error('Error in finally block:', e.message);
      }
    }
  }
}

// Run the script with error handling
main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

