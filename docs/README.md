# Tokenizer Studio - AI Token Cost Estimator

Comprehensive web application for calculating and analyzing AI model costs across multiple providers with real-time pricing data.

## 🎯 Features

### 1. **Token Estimator** (`/`)
- Real-time token counting using tiktoken (cl100k_base encoding)
- Cost calculation for all major AI providers
- Support for multiple providers: OpenAI, Anthropic, Google, Meta, Mistral, Deepseek, Z.AI
- Visual token breakdown with color-coded tokens
- Input/Output token tracking
- USD to IDR conversion with real-time exchange rates
- Usage log management with localStorage persistence

### 2. **Volume Simulator** (`/simulator`)
- **Budget-First Mode**: Calculate maximum volume from budget
- **Use Case Templates**: Pre-configured scenarios for:
  - Text (Chatbot, Content Writing, Code Assistant, etc.)
  - Image Generation (DALL-E 3 standard & HD)
  - Text-to-Speech (OpenAI TTS standard & HD)
  - Video Generation (Runway Gen-3)
- **Data Source**: OpenRouter API (324+ multimodal models)
- Dynamic model selection for text-based templates
- Growth rate projections (0-50% monthly growth)
- Multi-month simulation (1-12 months)
- Visual charts and monthly breakdown

### 3. **Pricing Page** (`/pricing`)
- **Dual Data Sources** with tab switcher:
  - **Artificial Analysis Tab**: LLM pricing with benchmarks (~50 models)
  - **OpenRouter Tab**: Multimodal AI pricing (324+ models)
- Real-time pricing from both APIs
- Search functionality across models and providers
- Category badges (text, multimodal, image, audio, video)
- FREE model indicators
- USD & IDR pricing display
- Grouped by provider

### 4. **Dashboard** (`/dashboard`)
- Usage analytics and history
- Recent logs with read/delete functionality
- Visual data representation
- Export capabilities

### 5. **Documentation** (`/docs`)
- Comprehensive FAQ
- Use case examples
- API documentation references

## 🏗️ Architecture

### Data Sources

```
Application
├── Artificial Analysis API
│   ├── Used by: PricingPage (Tab 1)
│   ├── Models: ~50 LLMs
│   ├── Features: Benchmarks, scores, metrics
│   └── Endpoint: https://artificialanalysis.ai/api/v2/data/llms/models
│
└── OpenRouter API
    ├── Used by: Simulator + PricingPage (Tab 2)
    ├── Models: 324+ multimodal
    ├── Features: Text, image, audio, video pricing
    └── Endpoint: https://openrouter.ai/api/v1/models
```

### Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Charts**: Recharts
- **Token Counting**: tiktoken (cl100k_base)
- **State Management**: React Context API
- **Storage**: localStorage

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.tsx              # Navigation with hamburger menu
│   ├── Footer.tsx
│   ├── Card.tsx
│   ├── Button.tsx
│   ├── Dropdown.tsx
│   ├── Toast.tsx
│   ├── TokenBreakdown.tsx      # Visual token display
│   └── Icons.tsx
│
├── pages/
│   ├── EstimatorPage.tsx       # Token calculator
│   ├── VolumeSimulatorPageV2.tsx  # Budget simulator
│   ├── PricingPage.tsx         # Dual-source pricing
│   ├── DashboardPage.tsx       # Usage analytics
│   └── DocumentationPage.tsx
│
├── services/
│   ├── pricingService.ts       # Artificial Analysis API
│   ├── openRouterService.ts    # OpenRouter API
│   ├── tokenService.ts         # Token counting
│   └── budgetCalculator.ts     # Volume calculations
│
├── constants/
│   ├── index.ts                # Providers, defaults
│   └── useCaseTemplates.ts     # Pre-configured scenarios
│
├── types/
│   └── index.ts                # TypeScript interfaces
│
└── docs/
    ├── openrouter-integration.md
    └── api-responses.md
```

## 🔌 API Integration

### Artificial Analysis API

**Purpose**: LLM pricing with performance benchmarks

**Endpoint**:
```
GET https://artificialanalysis.ai/api/v2/data/llms/models
Headers: x-api-key: YOUR_API_KEY
```

**Data Structure**:
```typescript
{
  id: string;
  name: string;
  provider: string;
  input_per_mtok_usd: number;  // USD per 1M input tokens
  output_per_mtok_usd: number; // USD per 1M output tokens
  notes?: string;
}
```

### OpenRouter API

**Purpose**: Multimodal AI pricing (text, image, audio, video)

**Endpoint**:
```
GET https://openrouter.ai/api/v1/models
No authentication required for pricing data
```

**Data Structure**:
```typescript
{
  id: string;                    // "openai/gpt-4o"
  name: string;                  // "OpenAI: GPT-4o"
  category: 'text' | 'image' | 'audio' | 'video' | 'multimodal';
  pricing: {
    prompt: string;              // USD per token
    completion: string;          // USD per token
    image: string;               // USD per image
    request: string;             // USD per request
  };
  architecture: {
    input_modalities: string[];  // ["text", "image"]
    output_modalities: string[]; // ["text"]
  };
}
```

### Exchange Rate API

**Endpoint**:
```
GET https://v6.exchangerate-api.com/v6/YOUR_KEY/latest/USD
```

**Caching**: 10-15 minutes

## 🎨 UI/UX Features

### Responsive Design

- **Mobile (<768px)**:
  - Hamburger menu (floating overlay)
  - Backdrop with blur
  - Vertical navigation
  - Shorter labels ("AI Analysis" instead of "Artificial Analysis")
  - Grid-based tab switcher (2 columns)

- **Tablet (≥768px)**:
  - Horizontal navigation
  - Full labels
  - Side-by-side layouts

- **Desktop (≥1024px)**:
  - Full features
  - Multi-column grids
  - Enhanced spacing

### Color Scheme

- **Primary**: Blue (#3b82f6, #2563eb, #1d4ed8)
- **Accent**: Various for categories (purple, pink, orange, green)
- **Background**: White, blue-50 for cards
- **Text**: Blue-900 for headings, blue-700 for body

### Token Visualization

- **12 color variations** with 80% transparency
- Adjacent tokens never same color
- Whitespace tokens highlighted differently
- Hover effects with scale (1.05x)
- Negative margin for word cohesion

## 📊 Use Case Templates

### Text-Based (6 templates)
- Simple Chatbot (400 input / 250 output tokens)
- Advanced Chatbot (1500/600)
- Content Writer (300/2000)
- Code Assistant (1200/1000)
- Data Analyst (2500/800)
- Document Summarizer (3000/400)

### Image Generation (2 templates)
- Standard Quality ($0.04/image)
- HD Quality ($0.08/image)

### Text-to-Speech (2 templates)
- Standard ($0.015 per 1K chars)
- HD ($0.03 per 1K chars)

### Video Generation (2 templates)
- Short 5sec ($0.10/sec)
- Medium 20sec ($0.10/sec)

## 🚀 Getting Started

### Prerequisites
```bash
npm install
```

### Environment Variables
Create `.env` file:
```env
# Artificial Analysis API
REACT_APP_AA_API_KEY=your_key_here

# OpenRouter (optional, no key needed for pricing)
# Exchange Rate API (optional, has free tier)
```

### Development
```bash
npm start
```

### Build
```bash
npm run build
```

## 📝 Usage Examples

### Calculate Cost for Specific Model
1. Go to `/` (Estimator)
2. Enter your prompt text
3. Select provider & model
4. View cost breakdown

### Budget Planning
1. Go to `/simulator`
2. Select "Budget First" mode
3. Enter your budget (IDR)
4. Choose use case template
5. Select AI model (for text templates)
6. View volume projection

### Compare Pricing
1. Go to `/pricing`
2. Toggle between "Artificial Analysis" and "OpenRouter" tabs
3. Search for specific models
4. Compare USD/IDR pricing

## 🔧 Best Practices

### Caching Strategy
- **Model data**: 1 hour cache (OpenRouter)
- **Exchange rate**: 10-15 minutes
- **Usage logs**: localStorage

### Performance
- Lazy loading for routes
- Memoized calculations
- Optimized re-renders with useMemo
- Efficient token counting

### Error Handling
- Graceful fallbacks to cached data
- User-friendly error messages
- Loading states for all async operations

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## 📞 Support

For issues or questions:
- GitHub Issues
- Email: support@tokenizerstudio.com
- Documentation: `/docs` route

---

**Last Updated**: 2025-01-08
**Version**: 2.0.0
