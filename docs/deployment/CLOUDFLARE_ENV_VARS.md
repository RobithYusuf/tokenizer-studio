# 🔑 Environment Variables untuk Cloudflare Pages

## ⚠️ PENTING: Update Environment Variables di Cloudflare!

Setelah deployment pertama, Anda **HARUS** menambahkan environment variables ini di Cloudflare Pages dashboard.

---

## 📋 Langkah-Langkah Update:

### **1. Buka Cloudflare Pages Dashboard**
```
https://dash.cloudflare.com/pages
```

### **2. Pilih Project "tokenizer-studio"**

### **3. Klik "Settings" → "Environment variables"**

### **4. Tambahkan Variables Berikut:**

Klik **"Add variable"** untuk SETIAP variable dengan prefix **VITE_**:

---

## 🔐 Environment Variables yang HARUS Ditambahkan:

### **Production Environment:**

| Variable Name | Value |
|--------------|-------|
| `VITE_ARTIFICIAL_ANALYSIS_API_KEY` | `your_artificial_analysis_api_key_here` |
| `VITE_OPENROUTER_API_KEY` | `your_openrouter_api_key_here` |
| `VITE_AIMLAPI_KEY` | `your_aimlapi_key_here` |
| `VITE_HELICONE_API_KEY` | `your_helicone_api_key_here` |

**CATATAN:** Prefix `VITE_` **WAJIB** agar Vite expose variables ke client-side!

---

### **5. Pilih Environment: "Production"**

Untuk setiap variable, pastikan selected environment adalah **"Production"**

---

### **6. Save dan Redeploy**

Setelah semua variables ditambahkan:

1. Klik **"Save"**
2. Buka tab **"Deployments"**
3. Klik **"Retry deployment"** pada deployment terakhir
4. Atau **push commit baru** ke GitHub untuk trigger deployment baru

---

## 🔄 Cara Cepat (Via Git Push):

```bash
# Add environment variables change
git add .
git commit -m "Fix: Add VITE_ prefix for production env vars"
git push origin main

# Cloudflare Pages akan auto redeploy dengan env vars baru
```

---

## ✅ Verifikasi Environment Variables:

Setelah redeploy, check di browser console:

```javascript
// Buka https://tokenizer-studio.pages.dev
// Open DevTools Console (F12)
// Type:
console.log(import.meta.env.VITE_ARTIFICIAL_ANALYSIS_API_KEY)

// Harus return: "aa_Gdug..."
// Jika return undefined, env vars belum di-set dengan benar
```

---

## 🐛 Troubleshooting:

### Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

**Penyebab:** Environment variables belum di-set di Cloudflare

**Solusi:**
1. ✅ Tambahkan semua `VITE_*` variables di Cloudflare Pages
2. ✅ Pastikan prefix `VITE_` ada
3. ✅ Retry deployment atau push commit baru

---

### API Masih Error Setelah Set Env Vars?

**Checklist:**
- ✅ Variable names pakai prefix `VITE_` (bukan tanpa prefix)
- ✅ Values di-paste dengan benar (tidak ada trailing spaces)
- ✅ Environment di-set ke "Production"
- ✅ Sudah redeploy setelah tambah variables
- ✅ Clear browser cache dan hard refresh (Ctrl+Shift+R)

---

## 📝 Notes:

- ⚠️ Environment variables di Cloudflare **BERBEDA** dengan `.env` file local
- ⚠️ Harus ditambahkan **MANUAL** di Cloudflare dashboard
- ⚠️ Tidak otomatis sync dari GitHub Secrets
- ⚠️ **WAJIB** pakai prefix `VITE_` untuk client-side access
- ✅ Setelah set, redeploy untuk apply changes

---

**Setelah setup environment variables, API calls akan bekerja di production!** 🚀
