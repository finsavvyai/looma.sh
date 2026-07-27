# Troubleshooting Guide - Video Generation Script

## 🔧 Common Errors & Solutions

### Error: "socket hang up" or WebSocket Connection Error

**Problem:** Puppeteer can't connect to Chrome browser

**Solutions:**

1. **Kill existing Chrome processes:**
   ```bash
   # Mac/Linux
   pkill -f "Google Chrome"
   pkill -f "chrome"
   
   # Windows
   taskkill /F /IM chrome.exe
   ```

2. **Reinstall Puppeteer:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Try with different Chrome options:**
   - The script now includes `--no-sandbox` flags
   - If still failing, try running Chrome manually first

4. **Check if Chrome is installed:**
   ```bash
   # Mac
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version
   
   # Or install Chromium via Puppeteer
   npm install puppeteer --save
   ```

5. **Use existing Chrome instance:**
   ```javascript
   // In automate_video_generation.js, change:
   browser = await puppeteer.launch({
     executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
     // ... rest of options
   });
   ```

---

### Error: "Navigation timeout"

**Problem:** Page takes too long to load

**Solutions:**

1. **Increase timeout:**
   ```javascript
   await page.goto(PLATFORM_URL, { 
     waitUntil: 'networkidle2',
     timeout: 60000 // 60 seconds
   });
   ```

2. **Check internet connection**

3. **Try different wait strategy:**
   ```javascript
   waitUntil: 'domcontentloaded' // Faster, less reliable
   // or
   waitUntil: 'load' // Slower, more reliable
   ```

---

### Error: "Element not found"

**Problem:** Script can't find HTML elements (selectors wrong)

**Solutions:**

1. **Update selectors** - See SCRIPT_SETUP_GUIDE.md
2. **Add more wait time:**
   ```javascript
   await page.waitForSelector('#element', { timeout: 30000 });
   ```
3. **Check if page loaded:**
   ```javascript
   await page.waitForNavigation({ waitUntil: 'networkidle0' });
   ```

---

### Error: "Login failed"

**Problem:** Can't log in automatically

**Solutions:**

1. **Log in manually first:**
   - Open browser manually
   - Log into higgsfield.ai
   - Then run script (comment out login function)

2. **Use browser cookies:**
   - Export cookies from browser
   - Import in script (advanced)

3. **Check if login page changed:**
   - Inspect login form
   - Update selectors

---

### Error: "Chrome/Chromium not found"

**Problem:** Puppeteer can't find Chrome

**Solutions:**

1. **Install Chromium automatically:**
   ```bash
   npm install puppeteer
   # This downloads Chromium automatically
   ```

2. **Or point to existing Chrome:**
   ```javascript
   executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
   ```

---

## 🛠️ Quick Fixes

### Script runs but browser doesn't open

**Fix:**
```javascript
// Change headless to false
headless: false
```

### Script runs but closes immediately

**Fix:**
```javascript
// Add this at the end
await sleep(60000); // Wait 60 seconds
```

### Can't find elements on page

**Fix:**
1. Run script with `headless: false`
2. Watch what happens
3. Pause script: Add `await sleep(10000)` to pause
4. Inspect page manually
5. Update selectors

---

## 🔍 Debugging Tips

### 1. Add Console Logs

```javascript
console.log('Current URL:', page.url());
console.log('Page title:', await page.title());
```

### 2. Take Screenshots

```javascript
await page.screenshot({ path: 'debug-screenshot.png' });
```

### 3. Check Page Content

```javascript
const content = await page.content();
console.log('Page HTML:', content.substring(0, 500));
```

### 4. Run Step by Step

Comment out parts of script and test one function at a time.

---

## 🚨 Security Warning

**You have passwords in your code!**

### Fix This:

1. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`:**
   ```
   EMAIL=shacharsol@gmail.com
   PASSWORD=Daniel0304##
   ```

3. **Install dotenv:**
   ```bash
   npm install dotenv
   ```

4. **Update script** (already done):
   ```javascript
   require('dotenv').config();
   const EMAIL = process.env.EMAIL;
   ```

5. **Add to `.gitignore`:**
   ```
   .env
   ```

6. **Remove passwords from script!**

---

## ✅ Pre-Flight Checklist

Before running script:

- [ ] Chrome/Chromium installed
- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] Updated PLATFORM_URL
- [ ] Updated selectors (or tested with manual run)
- [ ] Internet connection stable
- [ ] No other Chrome instances running
- [ ] Credentials correct (or login manually first)

---

## 🆘 Still Having Issues?

1. **Run in non-headless mode** to see what's happening
2. **Test with one scene first** before all 8
3. **Check browser console** for JavaScript errors
4. **Check terminal output** for detailed errors
5. **Try Python script** instead (`automate_video_generation.py`)

---

## 📞 Alternative: Manual + Script

If automation keeps failing:

1. **Log in manually** to higgsfield.ai
2. **Comment out login function** in script
3. **Run script** - it will use your session
4. **Monitor first scene** to make sure it works
5. **Let it run** for remaining scenes

---

**Most common fix: Kill Chrome processes and try again!** 🚀


