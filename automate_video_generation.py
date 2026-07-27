"""
Automated Video Generation Script for Looma.sh
Using Selenium for browser automation

Setup:
1. Install Python 3.8+
2. Run: pip install selenium webdriver-manager
3. Update the selectors below to match your platform
4. Run: python automate_video_generation.py
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import json

# Configuration
PLATFORM_URL = 'https://your-platform-url.com'  # UPDATE THIS
EMAIL = 'your-email@example.com'  # UPDATE THIS
PASSWORD = 'your-password'  # UPDATE THIS

# All 8 scenes
SCENES = [
    {
        'name': 'Scene 1: Problem',
        'prompt': '''Dark highway at night, multiple cars driving in isolation, sudden brake lights flash, 
near-miss accident scene, dramatic lighting, cinematic wide shot, blue and red emergency 
lights, tension building, 4K quality, professional cinematography, smooth dolly forward''',
        'duration': '12',
        'model': 'OpenAI Sora 2'
    },
    {
        'name': 'Scene 2: Solution',
        'prompt': '''Futuristic 3D network visualization, vehicles connected by glowing blue and purple energy 
lines, data packets flowing between cars, holographic interface overlay, cyberpunk aesthetic, 
smooth camera dolly forward, edge computing nodes visible, 4K, cinematic lighting, 
professional tech visualization''',
        'duration': '12',
        'model': 'OpenAI Sora 2'
    },
    {
        'name': 'Scene 3: Security',
        'prompt': '''Close-up of Ed25519 cryptographic keys rotating in 3D space, encryption algorithms 
visualized as glowing code, protective shield forming around vehicles, military-grade 
security symbols, blue and purple gradient, smooth zoom out, professional tech visualization, 
cinematic quality''',
        'duration': '12',
        'model': 'OpenAI Sora 2'
    },
    {
        'name': 'Scene 4: Network',
        'prompt': '''Global world map with Cloudflare edge nodes lighting up across continents, vehicles 
connecting worldwide, data packets flowing instantly between locations, network topology 
visualization, blue energy pulses, smooth camera orbit around globe, futuristic tech aesthetic, 
4K quality''',
        'duration': '12',
        'model': 'OpenAI Sora 2'
    },
    {
        'name': 'Scene 5: Smart Cities',
        'prompt': '''Aerial view of smart city at sunset, traffic flowing smoothly through intelligent intersections, 
emergency vehicles with clear priority routes highlighted in red, green traffic optimization 
visible, city lights twinkling, smooth drone camera movement, cinematic quality, 4K, 
professional aerial cinematography''',
        'duration': '12',
        'model': 'OpenAI Sora 2'
    },
    {
        'name': 'Scene 6: Fleet',
        'prompt': '''Fleet of delivery trucks on optimized routes, GPS visualization showing efficient paths, 
fuel savings metrics displayed as holographic overlay, trucks communicating in real-time, 
smooth tracking shot following convoy, professional commercial aesthetic, 4K, cinematic 
movement''',
        'duration': '12',
        'model': 'OpenAI Sora 2'
    },
    {
        'name': 'Scene 7: Technology',
        'prompt': '''Tech stack visualization with Cloudflare Workers logo, code snippets floating in 3D space, 
API responses flowing rapidly, edge computing architecture diagram, blue and purple tech 
aesthetic, smooth camera movement through tech elements, professional developer-focused 
visualization, 4K''',
        'duration': '12',
        'model': 'OpenAI Sora 2'
    },
    {
        'name': 'Scene 8: CTA',
        'prompt': '''Looma.sh logo revealed in dramatic fashion, website interface with live demo dashboard, 
real-time V2V messages visible, inspiring final shot of connected vehicles on futuristic 
highway, smooth zoom out, cinematic ending, blue and purple gradient, 4K quality, 
professional reveal''',
        'duration': '12',
        'model': 'OpenAI Sora 2'
    }
]

# CSS Selectors - UPDATE THESE to match your platform
SELECTORS = {
    'email_input': 'input[type="email"]',
    'password_input': 'input[type="password"]',
    'login_button': 'button[type="submit"]',
    'prompt_field': 'textarea',
    'model_select': 'select[name="model"]',
    'duration_select': 'select[name="duration"]',
    'generate_button': 'button:contains("Generate")',
    'processing': '.processing',
    'completed': '.completed',
    'download_button': 'button:contains("Download")'
}

def setup_driver():
    """Setup Chrome driver with options"""
    chrome_options = Options()
    # chrome_options.add_argument('--headless')  # Uncomment to run in background
    chrome_options.add_argument('--start-maximized')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def login(driver):
    """Login to the platform"""
    print('🔐 Logging in...')
    try:
        driver.get(PLATFORM_URL)
        time.sleep(3)
        
        email_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, SELECTORS['email_input']))
        )
        email_field.send_keys(EMAIL)
        
        password_field = driver.find_element(By.CSS_SELECTOR, SELECTORS['password_input'])
        password_field.send_keys(PASSWORD)
        
        login_btn = driver.find_element(By.CSS_SELECTOR, SELECTORS['login_button'])
        login_btn.click()
        
        time.sleep(5)  # Wait for login
        print('✅ Logged in successfully!')
    except Exception as e:
        print(f'❌ Login failed: {e}')
        print('💡 Tip: You might need to log in manually first')

def generate_scene(driver, scene, index):
    """Generate a single scene"""
    print(f'\n🎬 Starting {scene["name"]} ({index + 1}/8)...')
    
    try:
        # Navigate to generation page
        driver.get(PLATFORM_URL + '/generate')
        time.sleep(2)
        
        # Select model
        try:
            model_select = Select(WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, SELECTORS['model_select']))
            ))
            model_select.select_by_visible_text(scene['model'])
            time.sleep(1)
        except:
            print('⚠️  Model selector not found, skipping...')
        
        # Set duration
        try:
            duration_select = Select(WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, SELECTORS['duration_select']))
            ))
            duration_select.select_by_value(scene['duration'])
            time.sleep(1)
        except:
            print('⚠️  Duration selector not found, skipping...')
        
        # Fill prompt
        prompt_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, SELECTORS['prompt_field']))
        )
        prompt_field.clear()
        prompt_field.send_keys(scene['prompt'])
        time.sleep(1)
        
        # Click generate
        generate_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, SELECTORS['generate_button']))
        )
        generate_btn.click()
        
        print(f'⏳ {scene["name"]} generation started. Waiting for completion...')
        
        # Wait for processing indicator
        try:
            WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, SELECTORS['processing']))
            )
            print(f'🔄 {scene["name"]} is processing...')
        except:
            print(f'⚠️  Processing indicator not found, continuing...')
        
        # Wait for completion (5 minutes max)
        try:
            WebDriverWait(driver, 300).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, SELECTORS['completed']))
            )
            print(f'✅ {scene["name"]} completed!')
        except:
            print(f'⏰ Timeout waiting for {scene["name"]} - check manually')
        
        # Try to download
        try:
            download_btn = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, SELECTORS['download_button']))
            )
            download_btn.click()
            print(f'📥 {scene["name"]} download started')
        except:
            print(f'ℹ️  Download button not found - download manually')
        
        return {'success': True, 'scene': scene['name']}
        
    except Exception as e:
        print(f'❌ Error generating {scene["name"]}: {e}')
        return {'success': False, 'scene': scene['name'], 'error': str(e)}

def main():
    """Main function"""
    print('🚀 Starting automated video generation for Looma.sh\n')
    
    driver = setup_driver()
    results = []
    
    try:
        # Login (or skip if already logged in)
        # login(driver)
        print('💡 Make sure you\'re logged in. Opening browser...')
        driver.get(PLATFORM_URL)
        time.sleep(5)  # Give time to see the page
        
        # Generate each scene
        for i, scene in enumerate(SCENES):
            result = generate_scene(driver, scene, i)
            results.append(result)
            
            # Wait before next scene
            if i < len(SCENES) - 1:
                print('⏸️  Waiting 5 seconds before next scene...\n')
                time.sleep(5)
        
        # Summary
        print('\n📊 Generation Summary:')
        print('=' * 50)
        for result in results:
            if result['success']:
                print(f'✅ {result["scene"]}')
            else:
                print(f'❌ {result["scene"]}: {result["error"]}')
        
        print('\n🎉 All scenes processed!')
        print('💡 Check your downloads folder or the platform\'s download section.')
        
    except Exception as e:
        print(f'❌ Fatal error: {e}')
    finally:
        print('\n💡 Browser will stay open for 60 seconds for manual checks...')
        time.sleep(60)
        driver.quit()

if __name__ == '__main__':
    main()


