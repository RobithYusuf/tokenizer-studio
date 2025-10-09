# 🚀 Deployment Guide - Cloudflare Pages with GitHub Actions

## 📋 Prerequisites

1. GitHub repository untuk project ini
2. Cloudflare account (free tier sudah cukup)
3. API Keys untuk services yang digunakan

---

## ⚙️ Setup GitHub Secrets

Tambahkan secrets berikut di GitHub repository Anda:

### Cara Menambahkan Secrets:
1. Buka repository di GitHub
2. Klik **Settings** → **Secrets and variables** → **Actions**
3. Klik **New repository secret**
4. Tambahkan secrets berikut:

### Required Secrets:

#### 1. CLOUDFLARE_API_TOKEN
- Buat di: https://dash.cloudflare.com/profile/api-tokens
- Klik Create Token
- Pilih template "Edit Cloudflare Workers" atau custom

#### 2. CLOUDFLARE_ACCOUNT_ID
- Login ke Cloudflare Dashboard
- Pilih account Anda
- Account ID ada di sidebar kanan

#### 3. ARTIFICIAL_ANALYSIS_API_KEY
- Sudah ada di .env file Anda

---

## 🎯 Deployment Steps

### Auto Deployment:

```bash
git add .
git commit -m "Setup GitHub Actions deployment"
git push origin main
```

GitHub Actions akan otomatis build dan deploy!

---

## 🌐 URL Deployment

Setelah berhasil: https://tokenizer-studio.pages.dev

---

Happy Deploying! 🚀
