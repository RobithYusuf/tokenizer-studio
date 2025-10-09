# 🚀 Deployment Documentation

Complete documentation for deploying the AI Token Cost Estimator to Cloudflare Pages.

---

## 📚 Documentation Index

### **Getting Started**
1. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Main deployment guide
2. **[CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)** - Step-by-step Cloudflare Pages setup

### **Configuration**
3. **[CLOUDFLARE_ENV_VARS.md](./CLOUDFLARE_ENV_VARS.md)** - Environment variables configuration guide

### **Troubleshooting & Solutions**
4. **[CORS_FIX.md](./CORS_FIX.md)** - CORS issue explanation and Cloudflare Pages Functions solution
5. **[DEPLOYMENT_FIX.md](./DEPLOYMENT_FIX.md)** - GitHub Actions vs Cloudflare Git Integration
6. **[DEBUG_FUNCTIONS.md](./DEBUG_FUNCTIONS.md)** - Debugging Cloudflare Pages Functions

### **Security**
7. **[SECURITY_INCIDENT_SUMMARY.md](./SECURITY_INCIDENT_SUMMARY.md)** - Security incident report and remediation

---

## 🎯 Quick Start

**For first-time deployment:**

1. Read: [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)
2. Follow: [CLOUDFLARE_ENV_VARS.md](./CLOUDFLARE_ENV_VARS.md)
3. Deploy!

**If you encounter CORS errors:**

Read: [CORS_FIX.md](./CORS_FIX.md) - Explains why and how we use Cloudflare Pages Functions

**If Functions return 500 errors:**

Read: [DEBUG_FUNCTIONS.md](./DEBUG_FUNCTIONS.md) - Debugging environment variables and Functions

---

## 📖 Key Concepts

### **Cloudflare Pages Functions**

This project uses **Cloudflare Pages Functions** (not Workers) to:
- ✅ Bypass CORS restrictions for external APIs
- ✅ Proxy requests to Artificial Analysis API
- ✅ Proxy requests to Exchange Rate API
- ✅ Run server-side code at the edge

**Location:** `/functions/api/*.ts`

**URLs:**
- `/api/models` → Artificial Analysis API
- `/api/exchange` → Exchange Rate API

### **Environment Variables**

⚠️ **IMPORTANT:** Cloudflare Pages environment variables are **NOT automatically bound** to Functions context!

**Current Solution:**
- API keys are hardcoded in Functions as fallback
- See [CLOUDFLARE_ENV_VARS.md](./CLOUDFLARE_ENV_VARS.md) for proper configuration

**Future Improvement:**
- Use Cloudflare Workers Secrets for better security
- See [SECURITY_INCIDENT_SUMMARY.md](./SECURITY_INCIDENT_SUMMARY.md) for recommendations

### **Deployment Methods**

**✅ Recommended: Cloudflare Git Integration**
- Auto-deploy on push to `main`
- Full support for Cloudflare Pages Functions
- Build logs show Functions compilation

**❌ Not Recommended: GitHub Actions**
- `cloudflare/pages-action@v1` doesn't support Functions
- Only deploys static files from `dist/`
- Functions folder ignored

See: [DEPLOYMENT_FIX.md](./DEPLOYMENT_FIX.md) for details

---

## 🔍 Common Issues & Solutions

| Issue | Solution | Documentation |
|-------|----------|---------------|
| CORS errors in production | Use Cloudflare Pages Functions proxy | [CORS_FIX.md](./CORS_FIX.md) |
| Functions return 500 error | Check environment variables binding | [DEBUG_FUNCTIONS.md](./DEBUG_FUNCTIONS.md) |
| Functions not detected | Use Cloudflare Git Integration | [DEPLOYMENT_FIX.md](./DEPLOYMENT_FIX.md) |
| API keys exposed | Follow security best practices | [SECURITY_INCIDENT_SUMMARY.md](./SECURITY_INCIDENT_SUMMARY.md) |

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│           Browser (Client)                      │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│     Cloudflare Pages (Static Site)              │
│     - React SPA                                 │
│     - Tailwind CSS                              │
│     - Built with Vite                           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│   Cloudflare Pages Functions (Edge)             │
│   - /api/models → Artificial Analysis API       │
│   - /api/exchange → Exchange Rate API           │
│   - Bypass CORS                                 │
│   - Server-side logic                           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           External APIs                         │
│   - Artificial Analysis (Model Pricing)         │
│   - Exchange Rate API (USD/IDR)                 │
└─────────────────────────────────────────────────┘
```

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] All API keys configured in Cloudflare Pages Settings
- [ ] Environment variables use `VITE_` prefix (if needed client-side)
- [ ] Functions folder structure is correct (`/functions/api/*.ts`)
- [ ] Build command set to `npm run build`
- [ ] Build output directory set to `dist`
- [ ] Cloudflare Git Integration connected to repository
- [ ] `.env` file **NOT** committed to git (in `.gitignore`)
- [ ] No hardcoded API keys in source code (except Functions fallback)
- [ ] Security best practices followed

---

## 🆘 Need Help?

1. Check relevant documentation above
2. Review build logs in Cloudflare Pages dashboard
3. Check Functions real-time logs for errors
4. Review [SECURITY_INCIDENT_SUMMARY.md](./SECURITY_INCIDENT_SUMMARY.md) for security best practices

---

## 📝 Contributing

When adding new deployment documentation:
1. Create file in `docs/deployment/`
2. Add entry to this README's index
3. Update relevant cross-references
4. Follow existing documentation format

---

**Last Updated:** October 10, 2025
**Deployment Status:** ✅ Production Ready
**Live URL:** https://estimator-token.pages.dev
