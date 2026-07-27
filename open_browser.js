/**
 * Simple script to just open the browser with all prompts ready
 * You can then copy-paste prompts manually - much more reliable!
 */

const { chromium } = require('playwright');

const SCENES = [
  {
    name: 'Scene 1: Problem',
    prompt: `Dark highway at night, multiple cars driving in isolation, sudden brake lights flash, 
near-miss accident scene, dramatic lighting, cinematic wide shot, blue and red emergency 
lights, tension building, 4K quality, professional cinematography, smooth dolly forward`
  },
  {
    name: 'Scene 2: Solution',
    prompt: `Futuristic 3D network visualization, vehicles connected by glowing blue and purple energy 
lines, data packets flowing between cars, holographic interface overlay, cyberpunk aesthetic, 
smooth camera dolly forward, edge computing nodes visible, 4K, cinematic lighting, 
professional tech visualization`
  },
  {
    name: 'Scene 3: Security',
    prompt: `Close-up of Ed25519 cryptographic keys rotating in 3D space, encryption algorithms 
visualized as glowing code, protective shield forming around vehicles, military-grade 
security symbols, blue and purple gradient, smooth zoom out, professional tech visualization, 
cinematic quality`
  },
  {
    name: 'Scene 4: Network',
    prompt: `Global world map with Cloudflare edge nodes lighting up across continents, vehicles 
connecting worldwide, data packets flowing instantly between locations, network topology 
visualization, blue energy pulses, smooth camera orbit around globe, futuristic tech aesthetic, 
4K quality`
  },
  {
    name: 'Scene 5: Smart Cities',
    prompt: `Aerial view of smart city at sunset, traffic flowing smoothly through intelligent intersections, 
emergency vehicles with clear priority routes highlighted in red, green traffic optimization 
visible, city lights twinkling, smooth drone camera movement, cinematic quality, 4K, 
professional aerial cinematography`
  },
  {
    name: 'Scene 6: Fleet',
    prompt: `Fleet of delivery trucks on optimized routes, GPS visualization showing efficient paths, 
fuel savings metrics displayed as holographic overlay, trucks communicating in real-time, 
smooth tracking shot following convoy, professional commercial aesthetic, 4K, cinematic 
movement`
  },
  {
    name: 'Scene 7: Technology',
    prompt: `Tech stack visualization with Cloudflare Workers logo, code snippets floating in 3D space, 
API responses flowing rapidly, edge computing architecture diagram, blue and purple tech 
aesthetic, smooth camera movement through tech elements, professional developer-focused 
visualization, 4K`
  },
  {
    name: 'Scene 8: CTA',
    prompt: `Looma.sh logo revealed in dramatic fashion, website interface with live demo dashboard, 
real-time V2V messages visible, inspiring final shot of connected vehicles on futuristic 
highway, smooth zoom out, cinematic ending, blue and purple gradient, 4K quality, 
professional reveal`
  }
];

async function main() {
  console.log('🚀 Opening browser with prompts ready...\n');
  
  const browser = await chromium.launch({
    headless: false
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  // Open multiple tabs
  const tabs = [];
  for (let i = 0; i < 3; i++) {
    const page = await context.newPage();
    await page.goto('https://higgsfield.ai/create/video', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    tabs.push({ page, scene: SCENES[i] });
    console.log(`✅ Tab ${i + 1} opened for ${SCENES[i].name}`);
  }
  
  console.log('\n📋 All Prompts Ready:');
  console.log('='.repeat(60));
  SCENES.forEach((scene, index) => {
    console.log(`\n${index + 1}. ${scene.name}:`);
    console.log(scene.prompt.substring(0, 100) + '...');
  });
  
  console.log('\n💡 Instructions:');
  console.log('1. Log in to all 3 tabs');
  console.log('2. Select "OpenAI Sora 2" model');
  console.log('3. Set duration to 12s');
  console.log('4. Copy prompts from above (or see HIGGSFIELD_PROMPTS.md)');
  console.log('5. Paste and generate!');
  console.log('\n💡 Browser will stay open. Close manually when done.');
  console.log('💡 Press Ctrl+C in terminal to close browser.\n');
  
  // Keep browser open
  process.on('SIGINT', async () => {
    console.log('\n👋 Closing browser...');
    await browser.close();
    process.exit(0);
  });
  
  // Keep script running
  await new Promise(() => {}); // Run forever
}

main().catch(console.error);

