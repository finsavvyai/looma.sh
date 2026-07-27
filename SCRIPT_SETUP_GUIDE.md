# Script Setup Guide - Automated Video Generation

## 🎯 Quick Start

I've created automation scripts to generate all 8 video scenes automatically in the background!

---

## 📦 Option 1: JavaScript/Node.js Script (Recommended)

### Setup (5 minutes):

1. **Install Node.js:**
   - Download from: https://nodejs.org
   - Install (includes npm)

2. **Install dependencies:**
   ```bash
   cd /Users/shaharsolomon/dev/projects/looma_sh_full_fun
   npm install
   ```

3. **Update the script:**
   - Open `automate_video_generation.js`
   - Update these lines:
     ```javascript
     const PLATFORM_URL = 'https://your-platform-url.com'; // YOUR URL
     const EMAIL = 'your-email@example.com'; // YOUR EMAIL
     const PASSWORD = 'your-password'; // YOUR PASSWORD
     ```
   - Update CSS selectors to match your platform (see below)

4. **Run the script:**
   ```bash
   npm run generate
   ```

### How It Works:
- Opens Chrome browser automatically
- Logs into your platform
- Generates all 8 scenes one by one
- Waits for each to complete
- Downloads when ready

---

## 🐍 Option 2: Python Script

### Setup (5 minutes):

1. **Install Python 3.8+:**
   - Download from: https://www.python.org
   - Make sure to check "Add to PATH"

2. **Install dependencies:**
   ```bash
   pip install selenium webdriver-manager
   ```

3. **Update the script:**
   - Open `automate_video_generation.py`
   - Update these lines:
     ```python
     PLATFORM_URL = 'https://your-platform-url.com'  # YOUR URL
     EMAIL = 'your-email@example.com'  # YOUR EMAIL
     PASSWORD = 'your-password'  # YOUR PASSWORD
     ```

4. **Run the script:**
   ```bash
   python automate_video_generation.py
   ```

---

## 🔧 Finding Your Platform's Selectors

The scripts need to know which HTML elements to click. Here's how to find them:

### Step 1: Open Browser Developer Tools
- **Chrome/Edge:** Press F12 or Right-click → "Inspect"
- **Firefox:** Press F12
- **Safari:** Cmd+Option+I

### Step 2: Use Element Inspector
1. Click the **element picker** icon (top left of DevTools)
2. **Hover over elements** on your platform:
   - Prompt text box
   - Model dropdown
   - Duration dropdown
   - Generate button
3. **Right-click** → "Copy" → "Copy selector"

### Step 3: Update Script Selectors

In the script, find the `SELECTORS` object and update:

```javascript
const SELECTORS = {
  promptField: '#your-prompt-field-id',  // Paste copied selector here
  modelSelect: '#your-model-select-id',
  durationSelect: '#your-duration-select-id',
  generateButton: '#your-generate-button-id',
  // etc...
};
```

### Common Selectors:

**Prompt field:**
- `textarea`
- `input[type="text"]`
- `[data-testid="prompt"]`
- `#prompt-input`

**Model dropdown:**
- `select[name="model"]`
- `[aria-label*="model"]`
- `.model-selector`

**Generate button:**
- `button:contains("Generate")`
- `button[type="submit"]`
- `[data-testid="generate"]`

---

## 🎬 Running in Background (Headless Mode)

### JavaScript:
```bash
# Edit automate_video_generation.js
# Change: headless: false → headless: true
# Then run:
npm run generate
```

### Python:
```bash
# Edit automate_video_generation.py
# Uncomment: chrome_options.add_argument('--headless')
# Then run:
python automate_video_generation.py
```

**Note:** Headless mode runs without opening a browser window. You can't see what's happening, but it uses less resources.

---

## 🚨 Troubleshooting

### "Element not found" Error
**Problem:** Script can't find the HTML elements  
**Solution:**
1. Check if selectors are correct
2. Add more wait time: `await sleep(2000)`
3. Try different selectors
4. Check if page loaded fully

### "Login failed" Error
**Problem:** Can't log in automatically  
**Solution:**
1. Log in manually first
2. Export browser cookies
3. Use cookies in script (advanced)
4. Or comment out login function and log in manually

### "Timeout" Error
**Problem:** Video generation takes too long  
**Solution:**
1. Increase timeout: `timeout: 600000` (10 minutes)
2. Check your internet connection
3. Check platform status

### "Chrome driver not found"
**Solution:**
```bash
# JavaScript (Puppeteer handles this automatically)
# Python:
pip install --upgrade webdriver-manager
```

---

## 💡 Alternative: Manual + Script Hybrid

If automation is too complex, use this approach:

1. **Log in manually** to your platform
2. **Run script** - it will use your existing session
3. **Comment out login function** in script
4. **Let script generate scenes** automatically

---

## 📋 Quick Checklist

- [ ] Node.js/Python installed
- [ ] Dependencies installed (`npm install` or `pip install`)
- [ ] Updated platform URL in script
- [ ] Updated email/password (or disabled login)
- [ ] Updated CSS selectors to match your platform
- [ ] Tested with one scene first
- [ ] Script runs successfully
- [ ] All 8 scenes generated

---

## 🎯 Recommended Workflow

### First Time:
1. **Test with 1 scene** - Make sure script works
2. **Fix any selector issues**
3. **Then run all 8 scenes**

### Production:
1. **Update prompts** if needed
2. **Run script** in background
3. **Go do something else** (30-40 minutes)
4. **Come back** - all scenes ready!

---

## 🔐 Security Note

**Don't commit passwords to Git!**

Create a `.env` file:
```bash
PLATFORM_URL=https://your-platform.com
EMAIL=your-email@example.com
PASSWORD=your-password
```

Then update script to read from `.env`:
```javascript
require('dotenv').config();
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
```

Add `.env` to `.gitignore`!

---

## 📞 Need Help?

1. **Check browser console** for errors
2. **Add console.log()** statements to debug
3. **Run in non-headless mode** to see what's happening
4. **Test selectors manually** in browser console

---

## ✅ Success Indicators

When script works correctly, you'll see:
```
🚀 Starting automated video generation for Looma.sh
🔐 Logging in...
✅ Logged in successfully!
🎬 Starting Scene 1: Problem (1/8)...
⏳ Scene 1: Problem generation started...
🔄 Scene 1: Problem is processing...
✅ Scene 1: Problem completed!
📥 Scene 1: Problem download started
...
🎉 All scenes processed!
```

---

**Start with the JavaScript version - it's easier to set up! Good luck! 🚀**


