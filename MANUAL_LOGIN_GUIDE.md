# Manual Login Guide - Using Your Own Browser

## 🎯 Easiest Solution: Use Your Regular Browser

Since Playwright's browser doesn't have your saved logins, just use your regular Chrome/Safari/Firefox browser!

## ✅ Option 1: Use Your Regular Browser (Recommended)

1. **Open your regular Chrome/Safari/Firefox browser**
2. **Go to:** https://higgsfield.ai/create/video
3. **Log in** (you should already be logged in!)
4. **Open 2 more tabs** (Cmd+T or Ctrl+T)
5. **Navigate to higgsfield.ai** in each tab
6. **You're ready!** All tabs are logged in

Then:
- Copy prompts from `HIGGSFIELD_PROMPTS.md`
- Generate scenes in each tab
- Done!

---

## ✅ Option 2: Use Playwright with Chrome Profile

I've created a script that uses your existing Chrome profile:

```bash
npm run open
```

This should use your existing Chrome profile with saved logins.

**If it doesn't work:**
- The script will still open browser
- Just log in manually once
- Then you're good to go!

---

## ✅ Option 3: Log In Once in Playwright Browser

1. **Run:** `npm run open:simple`
2. **Browser opens** (3 tabs)
3. **Log in to ONE tab** manually
4. **Copy the cookies/session** to other tabs (or just log in to each)

---

## 🎯 My Recommendation

**Just use your regular browser!** It's simpler:

1. Open Chrome/Safari normally
2. Go to higgsfield.ai (you're probably already logged in)
3. Open 3 tabs
4. Start generating!

No scripts needed - just copy prompts from `HIGGSFIELD_PROMPTS.md` and paste!

---

**The manual browser approach is actually the fastest! 🚀**

