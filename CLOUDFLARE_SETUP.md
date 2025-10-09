# 🚀 Cloudflare Pages Setup Guide

## ⚠️ PENTING: Gunakan PAGES, bukan WORKERS!

Project ini adalah **Static React SPA**, jadi deploy ke **Cloudflare Pages**, **BUKAN** Cloudflare Workers.

---

## 📋 Step-by-Step Setup

### **Step 1: Push ke GitHub**

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

### **Step 2: Cloudflare Pages Setup**

1. **Login Cloudflare Dashboard**
   - https://dash.cloudflare.com/

2. **Navigate to Pages**
   - Sidebar: **Workers & Pages**
   - Klik tab **"Pages"** (bukan Workers!)
   - Klik **"Create application"**

3. **Connect to Git**
   - Pilih **"Connect to Git"**
   - Login dengan GitHub
   - Authorize Cloudflare
   - Pilih repository: **tokenizer-studio**

4. **Configure Build**
   ```
   Project name: tokenizer-studio
   Production branch: main

   Build settings:
   ✅ Framework preset: Vite
   ✅ Build command: npm run build
   ✅ Build output directory: dist
   ✅ Root directory: / (leave default)
   ```

5. **Environment Variables**

   Klik **"Add variable"** untuk setiap API key:

   | Variable Name | Value |
   |--------------|-------|
   | `ARTIFICIAL_ANALYSIS_API_KEY` | `your_artificial_analysis_api_key_here` |
   | `OPENROUTER_API_KEY` | `your_openrouter_api_key_here` |
   | `AIMLAPI_KEY` | `your_aimlapi_key_here` |
   | `HELICONE_API_KEY` | `your_helicone_api_key_here` |

6. **Deploy**
   - Klik **"Save and Deploy"**
   - Wait ~3-5 minutes
   - ✅ Done!

---

## 🌐 Your Live URL

After deployment succeeds:
```
https://tokenizer-studio.pages.dev
```

---

## 🔄 Auto Deployment

Setelah setup:
- ✅ Push ke `main` branch → Auto deploy production
- ✅ Push ke PR → Auto deploy preview
- ✅ Cloudflare CDN global
- ✅ HTTPS otomatis
- ✅ Unlimited bandwidth (free!)

---

## ❌ JANGAN Gunakan Workers Setup!

Jika Anda melihat setup seperti ini, **WRONG!**:
```
❌ Deploy command: npx wrangler deploy
❌ Non-production deploy: npx wrangler versions upload
```

**Yang BENAR** untuk Pages:
```
✅ Build command: npm run build
✅ Build output: dist
✅ Framework: Vite
```

---

## 🐛 Troubleshooting

### Build Failed?
- Check build logs di Cloudflare dashboard
- Pastikan `npm run build` berhasil di local
- Verify environment variables sudah ditambahkan

### Blank Page?
- Check browser console untuk errors
- Verify routing configuration
- Check if API keys work in production

### API Not Working?
- Environment variables harus di-set di **Cloudflare Pages Settings**
- Bukan di GitHub Secrets (itu untuk GitHub Actions)
- Buka: Settings → Environment variables → Production

---

## 📊 Monitoring

- **Dashboard**: https://dash.cloudflare.com/pages
- **Analytics**: Built-in di Cloudflare Pages
- **Logs**: Available per deployment

---

## 🎉 Next Steps

After successful deployment:
1. ✅ Test all features di production URL
2. ✅ Add custom domain (optional)
3. ✅ Setup DNS untuk custom domain
4. ✅ Enable Web Analytics di Cloudflare
5. ✅ Monitor performance

---

**Happy Deploying! 🚀**
