# 🐛 Debug Cloudflare Functions 500 Error

## ❌ Current Error:

```
Failed to load resource: the server responded with a status of 500 ()
Error: Failed to fetch models. Status: 500
```

---

## 🔍 Debugging Steps:

### **1. Check Error Response Body**

Setelah deployment baru selesai, buka browser console dan run:

```javascript
// Fetch dengan full error details
fetch('/api/models')
  .then(async response => {
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response body:', text);

    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', json);
    } catch (e) {
      console.log('Not JSON:', text);
    }
  })
  .catch(err => console.error('Fetch error:', err));
```

**Expected output yang berguna:**
```json
{
  "error": "API key not configured",
  "availableKeys": ["__STATIC_CONTENT", "..."]
}
```

Atau:

```json
{
  "error": "Failed to fetch models from external API",
  "status": 401,
  "statusText": "Unauthorized",
  "details": "..."
}
```

---

### **2. Check Cloudflare Functions Real-time Logs**

1. Buka **Cloudflare Dashboard**: https://dash.cloudflare.com/
2. Klik **"Workers & Pages"**
3. Klik project **"tokenizer-studio"**
4. Klik tab **"Functions"** (jika ada) atau **"Logs"**
5. Klik **"Begin log stream"** atau **"Real-time logs"**
6. Refresh production site untuk trigger request
7. Lihat console.log output:

**Expected logs:**
```
🔍 Available env keys: ["__STATIC_CONTENT", "ASSETS", ...]
🔍 API Key check: { exists: false, length: 0, prefix: "none" }
❌ API Key not found in environment
```

Atau jika API key ada tapi external API error:

```
🔍 Available env keys: ["VITE_ARTIFICIAL_ANALYSIS_API_KEY", ...]
🔍 API Key check: { exists: true, length: 36, prefix: "aa_Gd" }
🔍 Fetching from: https://artificialanalysis.ai/api/v2/data/llms/models
🔍 External API response: { status: 401, ok: false, statusText: "Unauthorized" }
❌ Artificial Analysis API error: { status: 401, ... }
```

---

## 🎯 Possible Root Causes & Solutions:

### **Issue 1: Environment Variables Not Bound to Functions**

**Problem:** Cloudflare Pages environment variables di Settings mungkin tidak otomatis available di Functions context.

**Solution:** Perlu explicitly bind environment variables ke Functions via `wrangler.toml` atau Functions configuration.

**Fix:** Create/update `wrangler.toml`:

```toml
name = "tokenizer-studio"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

# Bind environment variables to Functions
[vars]
# These will be available in Functions via env.VARIABLE_NAME

# For sensitive data, use secrets instead:
# Run: wrangler pages secret put VITE_ARTIFICIAL_ANALYSIS_API_KEY
```

Or use **Cloudflare Pages Bindings**:
1. Settings → **Environment variables**
2. Make sure variables are set for **"Production"** environment
3. For Pages Functions, variables should be automatically available

---

### **Issue 2: Wrong Variable Names**

**Problem:** Functions expect `env.VITE_ARTIFICIAL_ANALYSIS_API_KEY` but variable might be bound differently.

**Solution:** Check `availableKeys` in error response. If variable name is different, update Functions code.

**Example:** If available as `ARTIFICIAL_ANALYSIS_API_KEY` (without VITE_ prefix):

```typescript
// Try both with and without VITE_ prefix
const apiKey = env.VITE_ARTIFICIAL_ANALYSIS_API_KEY
            || env.ARTIFICIAL_ANALYSIS_API_KEY;
```

---

### **Issue 3: External API Rejecting Request**

**Problem:** API key correct but external API returns 401/403.

**Possible causes:**
- API key expired
- API key doesn't have permissions
- Rate limiting
- IP restrictions

**Solution:** Check external API response details in logs.

---

### **Issue 4: TypeScript Compilation Error**

**Problem:** Functions using TypeScript might not compile correctly.

**Solution:** Convert to JavaScript or ensure Cloudflare can compile TS.

**Quick fix - Rename to .js:**
```bash
mv functions/api/models.ts functions/api/models.js
mv functions/api/exchange.ts functions/api/exchange.js
```

Then update code to remove TypeScript syntax:
```javascript
// Change this:
export async function onRequest(context: any) {

// To this:
export async function onRequest(context) {
```

---

## 🛠️ Quick Fix to Try:

### **Option A: Use JavaScript instead of TypeScript**

Cloudflare Pages Functions **support both JS and TS**, but TS might have issues.

### **Option B: Try without VITE_ prefix**

Update `functions/api/models.ts`:

```typescript
// Try multiple possible env var names
const apiKey = env.VITE_ARTIFICIAL_ANALYSIS_API_KEY
            || env.ARTIFICIAL_ANALYSIS_API_KEY
            || env.VITE_ARTIFICIAL_ANALYSIS_API_KEY_PRODUCTION;
```

### **Option C: Hardcode for Testing (TEMPORARY)**

**WARNING: Only for debugging, remove after!**

```typescript
const apiKey = env.VITE_ARTIFICIAL_ANALYSIS_API_KEY
            || 'aa_GdugNjckGYnOcsOJfZYLBVVCEKqnupUy'; // TEMPORARY!
```

If this works, it confirms the issue is environment variable binding.

---

## 📋 Action Items:

1. **Wait for deployment** (commit 6f7823c) to finish
2. **Run debug fetch** in browser console to see error response body
3. **Check Cloudflare Functions logs** for console.log output
4. **Report findings** - paste the error response JSON dan log output
5. Based on findings, we'll implement the correct fix

---

**Setelah deployment selesai, jalankan debug fetch dan paste hasilnya!** 🔍
