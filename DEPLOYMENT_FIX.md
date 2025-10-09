# 🚀 Deployment Fix - Gunakan Cloudflare Git Integration

## ❌ Masalah dengan GitHub Actions:

GitHub Actions `cloudflare/pages-action@v1` **TIDAK support Cloudflare Pages Functions** dengan baik:
- ✅ Deploy static files (dist/)
- ❌ TIDAK deploy functions/ folder
- ❌ Log menunjukkan: "No functions dir at /functions found. Skipping."

---

## ✅ Solusi: Gunakan Cloudflare Git Integration Langsung

Cloudflare Pages memiliki **native Git integration** yang lebih baik daripada GitHub Actions.

### **Keuntungan:**
- ✅ Otomatis detect folder `functions/`
- ✅ Auto-deploy setiap push ke GitHub
- ✅ Preview deployments untuk PR
- ✅ Full support untuk Functions
- ✅ Build logs yang lebih detail
- ✅ Tidak perlu GitHub Secrets untuk API token

---

## 🔧 Setup Cloudflare Git Integration:

### **1. Disconnect GitHub Actions (Opsional)**

Anda bisa hapus atau disable GitHub Actions workflow:

```bash
# Hapus workflow file
rm -rf .github/workflows/deploy.yml

# Atau buat .github/workflows/deploy.yml.disabled
mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled
```

### **2. Setup Cloudflare Pages Git Integration**

1. **Buka Cloudflare Dashboard**: https://dash.cloudflare.com/
2. **Klik "Workers & Pages"** di sidebar
3. **Klik project "tokenizer-studio"**
4. **Klik tab "Settings"**
5. **Scroll ke "Build & deployments"**
6. **Klik "Connect to Git" atau "Setup builds and deployments"**

**Jika project belum connected ke Git:**
1. Klik **"Create a new project"** atau **"Connect to Git"**
2. Pilih **GitHub**
3. Authorize Cloudflare
4. Pilih repository: **RobithYusuf/tokenizer-studio**
5. Konfigurasi build:
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty or "/")

**Jika project sudah ada tapi tidak connected:**
1. Settings → **Builds & deployments**
2. Klik **"Configure Production deployments"**
3. Source → **"Connect to Git"**
4. Pilih GitHub repository

### **3. Set Environment Variables**

**PENTING:** Pastikan environment variables sudah di-set!

Settings → **Environment variables** → Add:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_ARTIFICIAL_ANALYSIS_API_KEY` | `aa_GdugNjckGYnOcsOJfZYLBVVCEKqnupUy` | Production |
| `VITE_OPENROUTER_API_KEY` | `sk-or-v1-d63da...` | Production |
| `VITE_AIMLAPI_KEY` | `1daa033e...` | Production |
| `VITE_HELICONE_API_KEY` | `sk-helicone-...` | Production |

### **4. Trigger Manual Deployment**

1. Klik tab **"Deployments"**
2. Klik **"Create deployment"** atau **"Retry deployment"**
3. Pilih branch **"main"**
4. Klik **"Deploy"**

---

## 📊 Verifikasi Functions Ter-Deploy:

Setelah deployment selesai, check build logs:

### **✅ Log yang BENAR (Functions detected):**
```
✅ Detected the following tools from environment: npm@10.9.2, nodejs@22.16.0
✅ Installing project dependencies...
✅ Executing user command: npm run build
✅ Build completed successfully
✅ Detecting Functions directory...
✅ Found 2 Functions:
   - /api/models
   - /api/exchange
✅ Compiling Functions...
✅ Deploying your site to Cloudflare's global network...
```

### **❌ Log yang SALAH (Functions tidak detected):**
```
❌ Note: No functions dir at /functions found. Skipping.
```

Jika masih muncul "Skipping", berarti:
1. Deployment menggunakan GitHub Actions (bukan Git integration)
2. Repository structure salah
3. Build command tidak benar

---

## 🔄 Auto-Deployment Flow:

Setelah setup Git integration:

```
1. Developer push ke GitHub
2. Cloudflare detect push event
3. Cloudflare clone repository
4. Cloudflare run: npm ci && npm run build
5. Cloudflare detect functions/ folder
6. Cloudflare compile Functions
7. Cloudflare deploy static files + Functions
8. Done! ✅
```

---

## 🧪 Testing Functions:

### **Test di Browser:**
```javascript
// Buka https://your-site.pages.dev
// Open DevTools Console (F12)

// Test models API
fetch('/api/models')
  .then(r => r.json())
  .then(data => console.log('Models:', data))

// Test exchange API
fetch('/api/exchange')
  .then(r => r.json())
  .then(data => console.log('Exchange:', data))
```

### **Test dengan curl:**
```bash
curl https://estimator-token.pages.dev/api/models
curl https://estimator-token.pages.dev/api/exchange
```

Seharusnya return JSON, **bukan CORS error**!

---

## 📝 Commit Changes:

```bash
# Hapus GitHub Actions workflow
git rm .github/workflows/deploy.yml

# Atau rename jadi .disabled
git mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled

# Commit
git add .
git commit -m "chore: remove GitHub Actions, use Cloudflare Git integration"
git push origin main
```

---

## ✅ Final Checklist:

- [ ] Cloudflare project connected ke GitHub repository
- [ ] Build command di-set: `npm run build`
- [ ] Build output di-set: `dist`
- [ ] Environment variables sudah di-set (VITE_* prefix)
- [ ] Manual deployment berhasil
- [ ] Build logs menunjukkan "Found 2 Functions"
- [ ] Test /api/models dan /api/exchange berhasil
- [ ] No CORS errors

---

**Setelah setup Cloudflare Git integration, deployment akan otomatis setiap push!** 🚀
