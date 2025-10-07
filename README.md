# Tokenizer Studio 🎯

**AI Token Cost Estimator & Analytics Platform** - Real-time pricing calculator for AI model tokens with IDR conversion.

## 📋 Overview

Tokenizer Studio adalah aplikasi web untuk menghitung dan mengestimasi biaya penggunaan AI model berdasarkan jumlah token. Platform ini mendukung berbagai provider AI populer dengan konversi otomatis ke Rupiah (IDR) menggunakan exchange rate real-time.

### 🎯 Tujuan Bisnis

1. **Transparansi Biaya** - Membantu developer memahami biaya sebenarnya saat menggunakan AI API
2. **Optimasi Budget** - Memberikan insight untuk memilih model yang cost-effective
3. **Token Analytics** - Visualisasi token breakdown untuk optimasi prompt
4. **Multi-Provider** - Perbandingan harga antar provider dalam satu platform

## ✨ Fitur Utama

### 1. **Token Estimator**
- ✅ Real-time token counting menggunakan tiktoken
- ✅ Input & output token estimation
- ✅ Multi-provider support (OpenAI, Anthropic, Google, Mistral, Grok, DeepSeek, Qwen)
- ✅ Cost calculation dalam USD & IDR
- ✅ Clipboard integration (paste/copy)
- ✅ File upload (.txt, .md, .js, .py, dll)

### 2. **Token Visualization**
- ✅ Colorful token breakdown (12 warna berbeda)
- ✅ Interactive hover dengan detail token
- ✅ Whitespace toggle control
- ✅ Token efficiency analysis
- ✅ Warning untuk short tokens

### 3. **Dashboard Analytics**
- ✅ Usage tracking per model/provider
- ✅ Cost trend visualization (chart)
- ✅ Provider mix analysis
- ✅ Recent logs dengan detail

### 4. **Pricing Information**
- ✅ Real-time pricing dari llmprices.dev API
- ✅ Model comparison
- ✅ Per-provider breakdown

## 🔧 Teknologi Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Recharts** - Data visualization

### Libraries
- **tiktoken** - Token counting (OpenAI's tokenizer)
- **Space Grotesk** - Typography

### APIs
- **llmprices.dev** - Model pricing data
- **exchangerate-api.com** - USD to IDR conversion

## 🧮 Algoritma & Logic Bisnis

### 1. Token Counting Algorithm

```
FUNGSI countTokens(provider, text):
    encoding = get_encoding('cl100k_base')  // OpenAI tokenizer
    tokens = encoding.encode(text)
    return tokens.length
```

**Catatan Penting:**
- Semua provider menggunakan `cl100k_base` encoding sebagai approximation
- OpenAI: Exact match
- Anthropic, Google, Mistral: ~95-98% accuracy
- DeepSeek, Qwen, Grok: ~90-95% accuracy

### 2. Cost Calculation Formula

```
INPUT COST (USD) = (input_tokens / 1,000,000) × model.input_per_mtok_usd
OUTPUT COST (USD) = (output_tokens / 1,000,000) × model.output_per_mtok_usd
TOTAL COST (USD) = INPUT COST + OUTPUT COST

COST (IDR) = TOTAL COST (USD) × exchange_rate
```

**Contoh Perhitungan:**
```
Model: GPT-4o
Input: 1,500 tokens
Output: 2,000 tokens
Pricing: $5.00/1M input, $15.00/1M output
Exchange Rate: 16,500 IDR/USD

Calculation:
- Input Cost = (1,500 / 1,000,000) × 5.00 = $0.0075
- Output Cost = (2,000 / 1,000,000) × 15.00 = $0.0300
- Total USD = $0.0375
- Total IDR = $0.0375 × 16,500 = Rp 618.75
```

### 3. Token Breakdown Visualization

**Color Assignment Algorithm:**
```
colorVariants = [blue, orange, emerald, red, cyan, amber, teal, slate, indigo, lime, rose, sky]

FOR EACH token:
    IF token.trim() == '':
        color = 'blue-50' (whitespace)
        type = 'whitespace'
    ELSE:
        colorIndex = token_id % colorVariants.length
        color = colorVariants[colorIndex]

        IF length > 5:
            type = 'efficient'
        ELSE IF length <= 2:
            type = 'short'
        ELSE IF is_punctuation:
            type = 'punctuation'
```

**Efisiensi Token:**
- ✅ **Efficient** (>5 chars): Token yang encode banyak karakter
- ⚠️ **Short** (≤2 chars): Token kurang efisien
- 📌 **Punctuation**: Karakter spesial
- ␣ **Whitespace**: Spasi/tab/newline

### 4. Output Token Estimation Guide

| Skenario | Estimasi Token | Contoh |
|----------|----------------|--------|
| Jawaban singkat | 50-100 | "Ya, saya setuju dengan pendapat Anda" |
| Response medium | 200-500 | Satu paragraf penjelasan |
| Penjelasan panjang | 1,000-2,000 | Multiple paragraphs |
| Artikel/Code detail | 3,000-5,000+ | Full implementation |

## 🔄 Data Flow Architecture

```
┌─────────────┐
│   User      │
│   Input     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Token Counting Service     │
│  (tiktoken - cl100k_base)   │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   Pricing Service           │
│   - Fetch from llmprices.dev│
│   - Cache 1 hour            │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   Exchange Rate Service     │
│   - Fetch USD to IDR        │
│   - Cache 10 minutes        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   Cost Calculation          │
│   - Calculate USD cost      │
│   - Convert to IDR          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   Display Result            │
│   - Show breakdown          │
│   - Token visualization     │
│   - Save to usage log       │
└─────────────────────────────┘
```

## 📁 Struktur Project

```
ai-token-cost-estimator/
├── components/              # React components
│   ├── Button.tsx          # Button dengan variants
│   ├── Card.tsx            # Card wrapper
│   ├── Header.tsx          # Navigation header
│   ├── Select.tsx          # Dropdown select
│   ├── Textarea.tsx        # Text input
│   └── TokenBreakdown.tsx  # Token visualization
├── pages/                  # Route pages
│   ├── EstimatorPage.tsx   # Main estimator
│   ├── DashboardPage.tsx   # Analytics dashboard
│   └── PricingPage.tsx     # Pricing table
├── services/               # Business logic
│   ├── tokenService.ts     # Token counting
│   ├── pricingService.ts   # Pricing data
│   └── usageService.ts     # Usage tracking
├── types.ts               # TypeScript interfaces
├── constants.ts           # App constants
└── App.tsx               # Main app component
```

## 🚀 Cara Menggunakan

### 1. Instalasi Dependencies

```bash
npm install
```

### 2. Jalankan Development Server

```bash
npm run dev
```

### 3. Build untuk Production

```bash
npm run build
```

## 💡 Use Cases & Skenario

### Skenario 1: Developer Freelance
**Problem:** Perlu estimate biaya sebelum menggunakan AI API untuk project client

**Solution:**
1. Input prompt yang akan digunakan
2. Pilih provider & model
3. Estimate output tokens berdasarkan kebutuhan
4. Lihat total biaya dalam IDR
5. Hitung margin profit

### Skenario 2: Startup Budget Planning
**Problem:** Butuh forecast biaya AI API untuk monthly budget

**Solution:**
1. Estimate average request per hari
2. Hitung cost per request
3. Monitor usage di dashboard
4. Analyze cost trend
5. Optimize dengan memilih model yang cost-effective

### Skenario 3: Prompt Engineering
**Problem:** Optimize prompt untuk reduce token usage

**Solution:**
1. Input current prompt
2. Lihat token breakdown
3. Identify inefficient tokens
4. Refactor prompt
5. Compare token count before/after

## 📊 Provider Support Status

| Provider | Status | Models Available | Token Counting |
|----------|--------|------------------|----------------|
| OpenAI | ✅ Active | GPT-4, GPT-3.5, etc | Exact (tiktoken) |
| Anthropic | ✅ Active | Claude 3.5, Claude 3 | ~98% accuracy |
| Google Gemini | ✅ Active | Gemini Pro, Flash | ~95% accuracy |
| Mistral AI | ✅ Active | Mistral Large, Small | ~95% accuracy |
| xAI (Grok) | ✅ Active | Grok-1, Grok-2 | ~95% accuracy |
| DeepSeek | ✅ Active | DeepSeek models | ~90% accuracy |
| Qwen (Alibaba) | ✅ Active | Qwen models | ~90% accuracy |

## ⚙️ Configuration

### Vite Proxy Configuration

```javascript
// vite.config.ts
proxy: {
  '/api/models': {
    target: 'https://llmprices.dev',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/models/, '/api/models')
  },
  '/api/exchange': {
    target: 'https://api.exchangerate-api.com/v4/latest/USD',
    changeOrigin: true,
    rewrite: (path) => ''
  }
}
```

### Caching Strategy

1. **Model Pricing Cache**: 1 jam
   - Reduce API calls
   - Fresh data hourly

2. **Exchange Rate Cache**: 10 menit
   - Balance freshness & performance
   - Real-time enough untuk estimasi

## 🎨 Design System

### Color Palette (Blue Theme)
- Primary: Blue 500-700
- Background: Blue 50-100 gradient
- Accent: Orange, Emerald, Cyan (token colors)

### Typography
- Font: Space Grotesk (300-700)
- Headings: 600-700 weight
- Body: 400 weight

## 🔐 Security & Privacy

- ✅ No API keys required from user
- ✅ No data sent to external servers (except public APIs)
- ✅ Client-side token counting
- ✅ Local storage untuk usage logs
- ✅ No authentication needed

## 📈 Future Roadmap

- [ ] Export usage data (CSV/JSON)
- [ ] Batch processing untuk multiple prompts
- [ ] Cost alerts & notifications
- [ ] Historical pricing comparison
- [ ] API integration examples
- [ ] Team collaboration features
- [ ] Custom model pricing

## 🐛 Known Limitations

1. **Token Counting Accuracy**
   - Non-OpenAI providers: Approximation (~90-98%)
   - Different tokenizers may vary

2. **Pricing Updates**
   - Depends on llmprices.dev API
   - May have delay dari official pricing

3. **Exchange Rate**
   - Based on market rate (not fixed)
   - Cache 10 minutes

## 📝 License

MIT License - Free to use and modify

## 🤝 Contributing

Contributions welcome! Please:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📧 Support

For issues or questions:
- Create GitHub issue
- Check documentation
- Review code comments

---

**Built with ❤️ for AI Developers**

*Tokenizer Studio - Know Your AI Costs*
