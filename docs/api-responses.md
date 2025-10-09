# Artificial Analysis API - Example Responses

## LLMs Endpoint
**GET** `/data/llms/models`

### Response Structure
```json
{
  "status": 200,
  "prompt_options": {
    "parallel_queries": 1,
    "prompt_length": "medium"
  },
  "data": [
    {
      "id": "2dad8957-4c16-4e74-bf2d-8b21514e0ae9",
      "name": "o3-mini",
      "slug": "o3-mini",
      "model_creator": {
        "id": "e67e56e3-15cd-43db-b679-da4660a69f41",
        "name": "OpenAI",
        "slug": "openai"
      },
      "evaluations": {
        "artificial_analysis_intelligence_index": 62.9,
        "artificial_analysis_coding_index": 55.8,
        "artificial_analysis_math_index": 87.2,
        "mmlu_pro": 0.791,
        "gpqa": 0.748,
        "hle": 0.087,
        "livecodebench": 0.717,
        "scicode": 0.399,
        "math_500": 0.973,
        "aime": 0.77
      },
      "pricing": {
        "price_1m_blended_3_to_1": 1.925,
        "price_1m_input_tokens": 1.1,
        "price_1m_output_tokens": 4.4
      },
      "median_output_tokens_per_second": 153.831,
      "median_time_to_first_token_seconds": 14.939,
      "median_time_to_first_answer_token": 14.939
    }
  ]
}
```

**Key Fields:**
- `pricing.price_1m_input_tokens` - Input price per 1M tokens (USD)
- `pricing.price_1m_output_tokens` - Output price per 1M tokens (USD)
- `model_creator.name` - Provider name (e.g., "OpenAI", "Anthropic")
- `name` - Full model name
- `id` - Stable unique identifier

---

## Text-to-Image Endpoint (BETA)
**GET** `/data/media/text-to-image`

### Response Structure
```json
{
  "status": 200,
  "include_categories": true,
  "data": [
    {
      "id": "dall-e-3",
      "name": "DALL·E 3",
      "slug": "dall-e-3",
      "model_creator": {
        "id": "openai",
        "name": "OpenAI"
      },
      "elo": 1250,
      "rank": 1,
      "ci95": "-5/+5",
      "categories": [
        {
          "style_category": "people",
          "subject_matter_category": "portraits",
          "elo": 1280,
          "ci95": "-5/+5"
        }
      ]
    }
  ]
}
```

**Important:** ❌ NO PRICING DATA - Only ELO ratings available

---

## Text-to-Speech Endpoint (BETA)
**GET** `/data/media/text-to-speech`

**Important:** ❌ NO PRICING DATA - Only ELO ratings available

---

## Text-to-Video Endpoint (BETA)
**GET** `/data/media/text-to-video`

**Important:** ❌ NO PRICING DATA - Only ELO ratings available

---

## Image-to-Video Endpoint (BETA)
**GET** `/data/media/image-to-video`

**Important:** ❌ NO PRICING DATA - Only ELO ratings available

---

## Summary for Implementation

### Available from API:
✅ **LLM Models** - Full pricing data available
- Can dynamically populate model selection
- Real-time pricing updates
- All major providers (OpenAI, Anthropic, Google, etc.)

### NOT Available from API:
❌ **Image Generation** - Only quality ratings, no pricing
❌ **Text-to-Speech** - Only quality ratings, no pricing
❌ **Text-to-Video** - Only quality ratings, no pricing
❌ **Image-to-Video** - Only quality ratings, no pricing

### Implementation Strategy:
1. **For LLM/Text Use Cases:** Use API data with dynamic model selection
2. **For Media Use Cases:** Use hardcoded official pricing from provider docs
