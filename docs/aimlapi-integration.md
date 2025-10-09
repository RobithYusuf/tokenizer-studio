# AIML API Integration

## Overview
AIML API provides access to **350+ AI models** including comprehensive multimodal support that OpenRouter lacks.

**API Endpoint:**
```
GET https://api.aimlapi.com/models
```

## Why AIML API vs OpenRouter?

### Coverage Comparison

| Modality | OpenRouter | AIML API | Advantage |
|----------|-----------|----------|-----------|
| **Text-to-Text** | 325 models | 117 models | OpenRouter ✓ |
| **Text-to-Image** | 2 models (Gemini only) | 48 models | **AIML API ✓✓✓** |
| **Text-to-Video** | 0 models | 63 models | **AIML API ✓✓✓** |
| **Text-to-Audio (TTS)** | 0 models | 64 models | **AIML API ✓✓✓** |
| **Audio-to-Text (STT)** | 10 models | 17 models | **AIML API ✓** |

### Model Availability

**Image Generation (48 models):**
- ✅ DALL-E 2, DALL-E 3
- ✅ Imagen 3.0, Imagen 4.0 (Standard, Fast, Ultra)
- ✅ Flux Schnell, Flux Pro, Flux Pro 1.1, Flux Dev, Flux SRPO
- ✅ ByteDance SeedDream 4.0
- ✅ Stable Diffusion variants

**Video Generation (63 models):**
- ✅ Sora 2 (Text-to-Video & Image-to-Video)
- ✅ Sora 2 Pro
- ✅ Kling Video 1.6
- ✅ Minimax Hailuo 02
- ✅ Pixverse v5

**Text-to-Speech (64 models):**
- ✅ Deepgram Aura (multiple voices)
- ✅ ElevenLabs Multilingual v2
- ✅ Google Cloud TTS
- ✅ Amazon Polly

**Speech-to-Text (17 models):**
- ✅ Whisper variants
- ✅ Deepgram Nova 2
- ✅ Google STT

## Response Structure

```json
{
  "object": "list",
  "data": [
    {
      "id": "dall-e-3",
      "type": "image",
      "info": {
        "name": "DALL-E 3",
        "developer": "Open AI",
        "description": "Turn text into art with DALL·E 3...",
        "contextLength": null,
        "maxTokens": null,
        "url": "https://aimlapi.com/models/dall-e-3",
        "docs_url": "https://docs.aimlapi.com/api-references/image-models/dall-e-3"
      },
      "features": ["image-generation", "text-to-image"],
      "endpoints": ["/v1/images/generations"]
    }
  ]
}
```

## Model Types

- `chat-completion` - Text generation (LLMs)
- `image` - Image generation
- `video` - Video generation
- `tts` - Text-to-Speech
- `stt` - Speech-to-Text
- `audio` - Audio processing
- `embedding` - Text embeddings
- `language-completion` - Code completion
- `document` - Document processing

## Pricing (from pricing page)

### Text Models
- GPT-5: $1.3125 input / $10.5 output per 1M tokens
- Claude 4 Opus: $15.75 input / $78.75 output per 1M tokens
- Claude 3.5 Sonnet: $3.15 input / $15.75 output per 1M tokens
- Gemini 2.5 Flash: $0.315 input / $2.625 output per 1M tokens
- Llama 3 (70B): $0.945 per 1M tokens

### Image Models
- DALL-E 3: $0.042 per 1024x1024 image
- Stable Diffusion 3.5 Large: $0.068 per 1024x1024 image
- Flux.1 Pro: $0.053 per 1024x1024 image

### Video Models
- Sora 2 Pro: $0.315 per second
- Wan 2.2 Animate: $0.118 per second
- Kling Video: $0.074 per second

### Audio Models (TTS)
- ElevenLabs Multilingual v2: $0.231 per 1000 characters
- Deepgram Aura 2: $0.032 per 1000 characters

## Integration Strategy

### Option 1: Dual API (Recommended)
Use both APIs for maximum coverage:
- **OpenRouter**: Text-to-text models (325 models, dynamic pricing API)
- **AIML API**: Multimodal models (image, video, audio generation)

**Pros:**
- Best coverage across all modalities
- OpenRouter has built-in pricing API
- AIML provides models OpenRouter doesn't have

**Cons:**
- Need to manage two API keys
- Different pricing structures
- More complex implementation

### Option 2: AIML API Only
Use only AIML API for everything:

**Pros:**
- Single API integration
- Complete multimodal coverage
- Simpler architecture

**Cons:**
- Fewer text-to-text models than OpenRouter
- No pricing API (need to scrape/hardcode)
- May need to update pricing manually

## Example: Popular Models by Modality

### Text-to-Image (48 models)
```
dall-e-3
dall-e-2
imagen-4.0-ultra-generate-preview-06-06
flux-pro/v1.1-ultra
flux/schnell
stable-diffusion-3.5-large
```

### Text-to-Video (63 models)
```
openai/sora-2-pro-t2v
kling-video/v1.6/standard/text-to-video
minimax/hailuo-02
pixverse/v5/transition
```

### Text-to-Audio (64 models)
```
elevenlabs/eleven-multilingual-v2
deepgram/aura-asteria-en
google/tts-wavenet
amazon/polly-neural
```

### Audio-to-Text (17 models)
```
whisper-large-v3
deepgram/nova-2
google/stt-enhanced
```

## Implementation Notes

1. **Pricing**: AIML API does NOT include pricing in `/models` endpoint. Need to:
   - Scrape from https://aimlapi.com/ai-ml-api-pricing
   - Or maintain hardcoded pricing constants
   - Or build a pricing scraper service

2. **Model Filtering**: Use `type` field:
   ```javascript
   const imageModels = models.filter(m => m.type === 'image');
   const videoModels = models.filter(m => m.type === 'video');
   const ttsModels = models.filter(m => m.type === 'tts');
   ```

3. **Authentication**: Check docs for API key requirements

4. **Rate Limits**: Verify rate limits and quota

## Recommendation for Volume Simulator

**Use Dual API Approach:**

1. **Keep OpenRouter** for text-to-text and image-to-text (vision):
   - Already integrated
   - Has dynamic pricing
   - 325 text models
   - Good for chat/completion models

2. **Add AIML API** for missing modalities:
   - Text-to-Image (DALL-E, Flux, Imagen, Stable Diffusion)
   - Text-to-Video (Sora, Kling)
   - Text-to-Audio (ElevenLabs, Deepgram)
   - Audio-to-Text (Whisper variants)

3. **Pricing Strategy:**
   - OpenRouter: Use API pricing (already working)
   - AIML: Scrape or hardcode from pricing page

This gives users the most comprehensive model selection while maintaining accurate pricing.
