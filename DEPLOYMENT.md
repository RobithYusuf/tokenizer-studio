# Panduan Deployment - Tokenizer Studio

## Persiapan Sebelum Deploy

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Copy file `.env.example` ke `.env`:
```bash
cp .env.example .env
```

Isi file `.env` dengan API keys yang valid:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
ARTIFICIAL_ANALYSIS_API_KEY=your_actual_api_key
# ... dst
```

### 3. Build Production
```bash
npm run build
```

Ini akan menghasilkan folder `dist/` yang siap di-deploy.

### 4. Test Production Build (Local)
```bash
npm run preview
```

---

## Deployment ke Platform Hosting

### Option 1: Vercel (Recommended)

#### Via CLI:
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Via Dashboard:
1. Push code ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Set Environment Variables di Settings
4. Deploy

**Environment Variables yang perlu di-set di Vercel:**
- `GEMINI_API_KEY`
- `ARTIFICIAL_ANALYSIS_API_KEY`
- `OPENROUTER_API_KEY` (optional)
- `AIMLAPI_KEY` (optional)
- `HELICONE_API_KEY` (optional)

---

### Option 2: Netlify

#### Via CLI:
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

#### Via Dashboard:
1. Push code ke GitHub
2. Import project di [netlify.com](https://netlify.com)
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Set Environment Variables
5. Deploy

**Catatan**: Netlify tidak support proxy server-side, jadi API calls akan langsung dari browser.

---

### Option 3: GitHub Pages

#### Setup:
1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Update `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Update `vite.config.ts` - ubah `base`:
```ts
base: '/ai-token-cost-estimator/', // nama repository Anda
```

4. Deploy:
```bash
npm run deploy
```

---

### Option 4: Self-Hosted (VPS/Cloud)

#### Nginx Configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/tokenizer-studio/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy untuk API (jika diperlukan)
    location /api/models {
        proxy_pass https://artificialanalysis.ai/api/v2/data/llms/models;
        proxy_set_header x-api-key $ARTIFICIAL_ANALYSIS_API_KEY;
    }
}
```

---

## Penting: Keamanan API Keys

### ⚠️ JANGAN hardcode API keys di code!

**❌ SALAH:**
```typescript
const API_KEY = 'aa_GdugNjckGYnOcsOJfZYLBVVCEKqnupUy'; // JANGAN!
```

**✅ BENAR:**
```typescript
const API_KEY = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
```

### Solusi Keamanan:

1. **Development**: Gunakan `.env` file
2. **Production**: Set environment variables di hosting platform
3. **Alternative**: Buat backend API yang menyimpan keys

---

## Troubleshooting

### Build Error: Module not found
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tailwind tidak bekerja
Pastikan file `tailwind.config.js` dan `postcss.config.js` ada.

### API Keys tidak terbaca
1. Pastikan `.env` file ada di root directory
2. Restart dev server setelah update `.env`
3. Di production, set di dashboard hosting platform

### Routing tidak bekerja (404)
Pastikan hosting support SPA routing. Tambahkan `_redirects` (Netlify) atau konfigurasi server.

---

## Struktur File Production

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   ├── react-vendor-[hash].js
│   └── chart-vendor-[hash].js
└── vite.svg
```

---

## Performance Optimization

Build sudah di-optimize dengan:
- ✅ Code splitting (React, Charts dipisah)
- ✅ Minification
- ✅ Tree shaking
- ✅ WASM support untuk tiktoken

---

## Next Steps Setelah Deploy

1. Test semua fitur di production URL
2. Monitor error dengan browser console
3. Setup analytics (optional)
4. Setup domain custom (optional)

---

**Dibuat untuk deployment production-ready! 🚀**
