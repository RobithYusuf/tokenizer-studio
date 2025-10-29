# Tokenizer Studio 🎯

**AI Token Cost Estimator & Analytics Platform** - Real-time pricing calculator for AI model tokens with IDR conversion.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://tokenizer-studio-90x.pages.dev)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🚀 Features

- **Token Counting** - Real-time token estimation using OpenAI's tiktoken
- **Multi-Provider Support** - OpenAI, Anthropic, Google, Mistral, Grok, DeepSeek, Qwen
- **Cost Calculator** - Accurate pricing in USD & IDR with live exchange rates
- **Token Visualization** - Interactive colored breakdown of tokens
- **Usage Analytics** - Track costs and usage patterns with charts
- **File Upload** - Support for .txt, .md, .js, .py, and more

---

## 📦 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

### Build

```bash
npm run build
```

### Deploy

Automatic deployment via Cloudflare Pages on push to `main` branch.

See [Deployment Guide](./docs/deployment/README.md) for details.

---

## 🛠️ Tech Stack

- **React 19** + TypeScript
- **Tailwind CSS** - Styling
- **Recharts** - Analytics visualization
- **tiktoken** - Token counting
- **Cloudflare Pages** - Hosting & Functions

---

## 💰 Pricing Formula

```
Input Cost = (tokens / 1,000,000) × model.input_price
Output Cost = (tokens / 1,000,000) × model.output_price
Total (IDR) = (Input Cost + Output Cost) × exchange_rate
```

---

## 📊 Supported Providers

| Provider | Token Accuracy | Models |
|----------|---------------|--------|
| OpenAI | 100% (native) | GPT-4, GPT-3.5, etc |
| Anthropic | ~98% | Claude 3.5, Claude 3 |
| Google | ~95% | Gemini Pro, Flash |
| Mistral | ~95% | Large, Small |
| Grok (xAI) | ~95% | Grok-1, Grok-2 |
| DeepSeek | ~90% | DeepSeek models |
| Qwen | ~90% | Qwen models |

---

## 📁 Project Structure

```
├── components/        # React components
├── pages/            # Route pages
├── services/         # Business logic
├── functions/        # Cloudflare Pages Functions
├── constants/        # App constants
└── types.ts         # TypeScript types
```

---

## 🔐 Privacy & Security

- ✅ No API keys required from users
- ✅ Client-side token counting
- ✅ Local storage for usage logs
- ✅ No authentication needed

---

## 📝 License

MIT License - Free to use and modify

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a Pull Request

---

## 🔗 Links

- **Live Demo**: [tokenizer-studio-90x.pages.dev](https://tokenizer-studio-90x.pages.dev)
- **Documentation**: [docs/deployment/](./docs/deployment/)
- **Issues**: [GitHub Issues](https://github.com/RobithYusuf/tokenizer-studio/issues)

---

**Built with ❤️ by [robithdev](https://robithdev.my.id)**

*Know Your AI Costs*
