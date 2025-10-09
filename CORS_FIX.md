# 🔧 CORS Fix dengan Cloudflare Pages Functions

## ❌ Masalah Sebelumnya:

```
Access to fetch at 'https://artificialanalysis.ai/api/v2/data/llms/models'
from origin 'https://estimator-token.pages.dev' has been blocked by CORS policy
```

**Penyebab:** Direct browser calls ke external APIs diblokir karena CORS policy.

---

## ✅ Solusi: Cloudflare Pages Functions sebagai Proxy

Cloudflare Pages memiliki fitur **Functions** yang berjalan di edge (seperti Workers) untuk handle server-side logic.

### **Struktur Folder:**

```
project/
├── functions/
│   └── api/
│       ├── models.ts      ← Proxy untuk Artificial Analysis API
│       └── exchange.ts    ← Proxy untuk Exchange Rate API
├── services/
│   └── pricingService.ts  ← Updated untuk pakai relative URLs
└── vite.config.ts         ← Proxy config untuk development
```

---

## 📁 Cloudflare Pages Functions

### **1. `/functions/api/models.ts`**

Proxy untuk `https://artificialanalysis.ai/api/v2/data/llms/models`

**Features:**
- ✅ Handle CORS dengan header `Access-Control-Allow-Origin: *`
- ✅ Inject API key dari environment variables
- ✅ Cache response 1 hour (`Cache-Control: public, max-age=3600`)
- ✅ Handle preflight OPTIONS request
- ✅ Error handling dengan proper status codes

**URL di production:** `https://your-domain.pages.dev/api/models`

---

### **2. `/functions/api/exchange.ts`**

Proxy untuk `https://api.exchangerate-api.com/v4/latest/USD`

**Features:**
- ✅ Handle CORS
- ✅ Cache response 10 minutes
- ✅ Handle preflight OPTIONS request
- ✅ Error handling

**URL di production:** `https://your-domain.pages.dev/api/exchange`

---

## 🔄 Flow Request:

### **Development (localhost:3000):**
```
Browser → Vite Dev Server → Vite Proxy → External API
         ↓
    /api/models
```

### **Production (Cloudflare Pages):**
```
Browser → Cloudflare Pages Functions → External API
         ↓
    /api/models
```

---

## 🛠️ Cara Kerja:

### **Development:**
Vite proxy di `vite.config.ts` menangani request `/api/*`:
```typescript
server: {
  proxy: {
    '/api/models': {
      target: 'https://artificialanalysis.ai',
      changeOrigin: true,
      // ...
    }
  }
}
```

### **Production:**
Cloudflare Pages Functions di `/functions/api/*.ts` menangani request `/api/*`:
```typescript
export async function onRequest(context: any) {
  const response = await fetch('https://external-api.com');
  return new Response(JSON.stringify(data), {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
}
```

---

## ⚙️ Environment Variables yang Dibutuhkan:

Di **Cloudflare Pages Settings → Environment Variables**, tambahkan:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_ARTIFICIAL_ANALYSIS_API_KEY` | `aa_GdugNjckGYnOcsOJfZYLBVVCEKqnupUy` | Production |
| `VITE_OPENROUTER_API_KEY` | `sk-or-v1-d63da...` | Production |
| `VITE_AIMLAPI_KEY` | `1daa033e...` | Production |
| `VITE_HELICONE_API_KEY` | `sk-helicone-...` | Production |

**PENTING:** Prefix `VITE_` wajib untuk Cloudflare Pages Functions!

---

## 🔍 Debug & Monitoring:

### **Check Functions Logs:**
1. Buka Cloudflare Pages dashboard
2. Pilih project Anda
3. Klik tab **"Functions"**
4. Klik **"Real-time logs"** untuk melihat console.log dari Functions

### **Console Logs di Functions:**
```typescript
console.log('❌ API Key not found in environment');
console.error('❌ Artificial Analysis API error:', response.status);
console.error('❌ Proxy error:', error);
```

---

## ✅ Keuntungan Solusi Ini:

1. **✅ No CORS Issues** - Request dari server-side, bukan browser
2. **✅ API Key Security** - API key tidak exposed ke client
3. **✅ Caching** - Response di-cache untuk mengurangi API calls
4. **✅ Same Code** - Development dan production pakai URL yang sama (`/api/*`)
5. **✅ Zero Cost** - Cloudflare Pages Functions included dalam free tier

---

## 🚀 Deployment:

```bash
# Commit changes
git add .
git commit -m "fix: add Cloudflare Pages Functions proxy for CORS"
git push origin main

# Cloudflare Pages akan auto-deploy dengan Functions
```

---

## 🧪 Testing:

### **Development:**
```bash
npm run dev
# Visit http://localhost:3000
# Console should show: 🔍 [DEBUG] Fetching models from: /api/models
```

### **Production:**
```bash
# Visit https://your-domain.pages.dev
# Open DevTools Console
# Should see successful API responses without CORS errors
```

---

## 📚 References:

- [Cloudflare Pages Functions Docs](https://developers.cloudflare.com/pages/functions/)
- [Vite Proxy Configuration](https://vitejs.dev/config/server-options.html#server-proxy)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Setelah deployment, API akan bekerja sempurna tanpa CORS errors!** 🎉
