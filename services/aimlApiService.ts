/**
 * AIML API Service
 * Unified access to 350+ models including comprehensive multimodal support
 * Documentation: https://docs.aimlapi.com/
 */

import {
  getGoogleVeoOfficialPrice,
  isBlendedPricing,
  PRICING_METADATA,
} from '../constants/googleCloudOfficialPricing';

export interface AIMLModel {
  id: string;
  type: string; // 'chat-completion' | 'image' | 'video' | 'tts' | 'stt' | 'audio' | etc
  info: {
    name: string;
    developer: string;
    description: string;
    contextLength: number | null;
    maxTokens: number | null;
    url: string;
    docs_url: string;
  };
  features: string[];
  endpoints: string[];
}

export interface AIMLResponse {
  object: string;
  data: AIMLModel[];
}

/**
 * Normalized model for application use
 */
export interface NormalizedAIMLModel {
  id: string;
  name: string;
  provider: string; // Extracted from developer field
  description: string;
  type: string; // Original type from AIML API
  category: 'text' | 'image' | 'video' | 'audio' | 'multimodal';
  contextLength: number | null;
  maxTokens: number | null;
  pricing: {
    inputPerMToken: number; // USD per 1M tokens (hardcoded from pricing page)
    outputPerMToken: number; // USD per 1M tokens (hardcoded from pricing page)
    perImage: number; // USD per image
    perSecond: number; // USD per second (for video)
    perCharacter: number; // USD per character (for audio)
  };
  features: string[];
  isFree: boolean;
  // Pricing metadata for transparency
  pricingMetadata?: {
    isBlendedPricing: boolean; // True if pricing is simplified/aggregated
    officialPrice?: number; // Official provider price (if different from blended)
    source: 'AIML API' | 'Google Cloud' | 'Provider Direct';
    note?: string;
  };
}

/**
 * Hardcoded pricing from https://aimlapi.com/ai-ml-api-pricing
 * Note: AIML API does NOT provide pricing in /models endpoint
 */
const PRICING_MAP: Record<string, {
  inputPerMToken?: number;
  outputPerMToken?: number;
  perImage?: number;
  perSecond?: number;
  perCharacter?: number;
}> = {
  // === TEXT MODELS (Chat Completion) ===
  // OpenAI GPT-5 Series
  'openai/gpt-5-2025-08-07': { inputPerMToken: 1.3125, outputPerMToken: 10.5 },
  'gpt-5': { inputPerMToken: 1.3125, outputPerMToken: 10.5 },

  // OpenAI GPT-4.1 Series
  'openai/gpt-4.1-2025-04-14': { inputPerMToken: 0.84, outputPerMToken: 3.36 },
  'openai/gpt-4.1-mini-2025-04-14': { inputPerMToken: 0.105, outputPerMToken: 0.42 },
  'openai/gpt-4.1-nano-2025-04-14': { inputPerMToken: 0.0525, outputPerMToken: 0.21 },

  // OpenAI GPT-4o Series
  'openai/gpt-4o': { inputPerMToken: 2.625, outputPerMToken: 10.5 },
  'gpt-4o': { inputPerMToken: 2.625, outputPerMToken: 10.5 },
  'gpt-4o-2024-08-06': { inputPerMToken: 2.625, outputPerMToken: 10.5 },
  'gpt-4o-2024-05-13': { inputPerMToken: 2.625, outputPerMToken: 10.5 },
  'chatgpt-4o-latest': { inputPerMToken: 2.625, outputPerMToken: 10.5 },

  // OpenAI GPT-4o-mini
  'gpt-4o-mini': { inputPerMToken: 0.1575, outputPerMToken: 0.63 },
  'gpt-4o-mini-2024-07-18': { inputPerMToken: 0.1575, outputPerMToken: 0.63 },

  // OpenAI GPT-4 Turbo
  'gpt-4-turbo': { inputPerMToken: 10.5, outputPerMToken: 31.5 },
  'gpt-4-turbo-2024-04-09': { inputPerMToken: 10.5, outputPerMToken: 31.5 },

  // OpenAI GPT-4
  'gpt-4': { inputPerMToken: 31.5, outputPerMToken: 63 },
  'gpt-4-0125-preview': { inputPerMToken: 10.5, outputPerMToken: 31.5 },
  'gpt-4-1106-preview': { inputPerMToken: 10.5, outputPerMToken: 31.5 },

  // OpenAI GPT-3.5
  'gpt-3.5-turbo': { inputPerMToken: 0.525, outputPerMToken: 1.575 },
  'gpt-3.5-turbo-0125': { inputPerMToken: 0.525, outputPerMToken: 1.575 },
  'gpt-3.5-turbo-1106': { inputPerMToken: 0.525, outputPerMToken: 1.575 },

  // OpenAI o1/o3/o4 Series
  'o1': { inputPerMToken: 15.75, outputPerMToken: 63 },
  'o1-mini': { inputPerMToken: 3.15, outputPerMToken: 12.6 },
  'o1-mini-2024-09-12': { inputPerMToken: 3.15, outputPerMToken: 12.6 },
  'o3-mini': { inputPerMToken: 1.155, outputPerMToken: 4.62 },
  'openai/o3-2025-04-16': { inputPerMToken: 10.5, outputPerMToken: 42 },
  'openai/o4-mini-2025-04-16': { inputPerMToken: 1.155, outputPerMToken: 4.62 },

  // Anthropic Claude 4
  'claude-4-opus': { inputPerMToken: 15.75, outputPerMToken: 78.75 },
  'claude-opus-4': { inputPerMToken: 15.75, outputPerMToken: 78.75 },

  // Anthropic Claude 3.5
  'claude-3.5-sonnet': { inputPerMToken: 3.15, outputPerMToken: 15.75 },
  'claude-sonnet-3.5': { inputPerMToken: 3.15, outputPerMToken: 15.75 },

  // Google Gemini 2.5
  'gemini-2.5-flash': { inputPerMToken: 0.315, outputPerMToken: 2.625 },
  'gemini-2.5-pro': { inputPerMToken: 1.3125, outputPerMToken: 5.25 },

  // Meta Llama
  'llama-3-70b': { inputPerMToken: 0.945, outputPerMToken: 0.945 },
  'llama-3.1-405b': { inputPerMToken: 3.15, outputPerMToken: 3.15 },
  'llama-3.3-70b': { inputPerMToken: 0.945, outputPerMToken: 0.945 },

  // === IMAGE MODELS ===
  // OpenAI DALL-E
  'dall-e-3': { perImage: 0.042 },
  'dall-e-2': { perImage: 0.021 },
  'openai/gpt-image-1': { perImage: 0.042 },

  // Google Imagen
  'imagen-3.0-generate-002': { perImage: 0.042 },
  'imagen-4.0-ultra-generate-preview-06-06': { perImage: 0.063 },
  'google/imagen-4.0-generate-001': { perImage: 0.053 },
  'google/imagen-4.0-fast-generate-001': { perImage: 0.032 },
  'google/imagen-4.0-ultra-generate-001': { perImage: 0.063 },
  'google/imagen4/preview': { perImage: 0.053 },

  // Flux
  'flux/schnell': { perImage: 0.004 },
  'flux-pro': { perImage: 0.053 },
  'flux/pro': { perImage: 0.053 },
  'flux-pro/v1.1': { perImage: 0.053 },
  'flux-pro/v1.1-ultra': { perImage: 0.063 },
  'flux/dev': { perImage: 0.026 },
  'flux/dev/image-to-image': { perImage: 0.026 },
  'flux/srpo': { perImage: 0.032 },
  'flux/srpo/image-to-image': { perImage: 0.032 },

  // Stable Diffusion
  'stable-diffusion-3.5-large': { perImage: 0.068 },
  'stable-diffusion-3': { perImage: 0.042 },

  // ByteDance
  'bytedance/uso': { perImage: 0.032 },
  'bytedance/seedream-v4-edit': { perImage: 0.026 },
  'bytedance/seedream-v4-text-to-image': { perImage: 0.026 },

  // === VIDEO MODELS (per second) ===
  // OpenAI Sora
  'openai/sora-2-pro-t2v': { perSecond: 0.315 },
  'openai/sora-2-pro-i2v': { perSecond: 0.315 },
  'openai/sora-2-t2v': { perSecond: 0.21 },
  'openai/sora-2-i2v': { perSecond: 0.21 },

  // Minimax
  'video-01': { perSecond: 0.158 },
  'video-01-live2d': { perSecond: 0.158 },
  'minimax/hailuo-02': { perSecond: 0.158 },

  // Kling
  'kling-video/v1.6/standard/text-to-video': { perSecond: 0.074 },
  'kling-video/v1.6/standard/image-to-video': { perSecond: 0.074 },
  'kling-video/v1.6/pro/text-to-video': { perSecond: 0.158 },
  'kling-video/v1.6/pro/image-to-video': { perSecond: 0.158 },

  // Pixverse
  'pixverse/v5/transition': { perSecond: 0.063 },

  // Google Veo (Note: AIML API uses blended pricing for all Veo variants)
  // Veo2 Standard/Fast + Veo3 Standard/Fast all priced at $0.788/sec
  'veo-3': { perSecond: 0.788 },
  'veo-2': { perSecond: 0.788 },
  'google/veo-2-text-to-video': { perSecond: 0.788 },
  'google/veo-3-text-to-video': { perSecond: 0.788 },
  'google/veo-2-image-to-video': { perSecond: 0.788 },
  'google/veo-3-image-to-video': { perSecond: 0.788 },

  // === AUDIO MODELS (TTS - per 1000 characters) ===
  // Deepgram Aura (all variants)
  '#g1_aura-asteria-en': { perCharacter: 0.000032 },
  '#g1_aura-hera-en': { perCharacter: 0.000032 },
  '#g1_aura-luna-en': { perCharacter: 0.000032 },
  '#g1_aura-stella-en': { perCharacter: 0.000032 },
  '#g1_aura-athena-en': { perCharacter: 0.000032 },
  '#g1_aura-zeus-en': { perCharacter: 0.000032 },
  '#g1_aura-orion-en': { perCharacter: 0.000032 },
  '#g1_aura-arcas-en': { perCharacter: 0.000032 },
  '#g1_aura-perseus-en': { perCharacter: 0.000032 },
  '#g1_aura-angus-en': { perCharacter: 0.000032 },
  'deepgram-aura-2': { perCharacter: 0.000032 },

  // ElevenLabs
  'elevenlabs-multilingual-v2': { perCharacter: 0.000231 },
  'eleven-multilingual-v2': { perCharacter: 0.000231 },
  'eleven-v3': { perCharacter: 0.000231 },

  // === STT MODELS (Speech-to-Text - per minute, converted to perSecond) ===
  // OpenAI Whisper: $0.004/min = $0.0000667/sec
  'whisper-1': { perSecond: 0.0000667 },
  'whisper': { perSecond: 0.0000667 },
  'openai/whisper': { perSecond: 0.0000667 },
  '#g1_whisper-large': { perSecond: 0.0000667 },
  '#g1_whisper-large-v3': { perSecond: 0.0000667 },
  'whisper-large': { perSecond: 0.0000667 },
  'whisper-large-v3': { perSecond: 0.0000667 },

  // Deepgram Aura STT: $0.016/min = $0.000267/sec
  'deepgram/aura': { perSecond: 0.000267 },
  'deepgram-aura': { perSecond: 0.000267 },

  // Deepgram Nova-2 STT: $0.006/min = $0.0001/sec
  'deepgram/nova-2': { perSecond: 0.0001 },
  'deepgram-nova-2': { perSecond: 0.0001 },
  'nova-2': { perSecond: 0.0001 },
};

class AIMLAPIService {
  private baseURL = 'https://api.aimlapi.com';
  private apiKey = '1daa033e7d7547dfa42a2925c59e4dda';
  private models: NormalizedAIMLModel[] = [];
  private rawModels: AIMLModel[] = [];
  private lastFetch: number | null = null;
  private cacheTime = 3600000; // 1 hour

  /**
   * Fetch all models from AIML API
   */
  async fetchModels(): Promise<NormalizedAIMLModel[]> {
    // Return cached if available
    if (this.lastFetch && Date.now() - this.lastFetch < this.cacheTime) {
      return this.models;
    }

    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AIMLResponse = await response.json();
      this.rawModels = data.data;
      this.models = this.normalizeModels(data.data);
      this.lastFetch = Date.now();

      return this.models;
    } catch (error) {
      console.error('❌ [AIML API] Error fetching models:', error);

      // Return cached data if available
      if (this.models.length > 0) {
        console.warn('⚠️ [AIML API] Using cached models due to fetch error');
        return this.models;
      }

      throw error;
    }
  }

  /**
   * Normalize AIML API models to application format
   */
  private normalizeModels(rawModels: AIMLModel[]): NormalizedAIMLModel[] {
    return rawModels.map(model => {
      const provider = this.extractProvider(model.info.developer || model.id);
      const category = this.detectCategory(model.type);
      const pricing = this.getPricing(model.id, model.type);
      const pricingMetadata = this.getPricingMetadata(model.id, pricing);

      return {
        id: model.id,
        name: model.info.name,
        provider,
        description: model.info.description || '',
        type: model.type,
        category,
        contextLength: model.info.contextLength,
        maxTokens: model.info.maxTokens,
        pricing,
        features: model.features,
        // Only mark as free if it's explicitly known to be free (not just missing pricing)
        isFree: false, // We don't have reliable free tier info from API
        pricingMetadata,
      };
    });
  }

  /**
   * Extract provider name from developer field or model ID
   */
  private extractProvider(developerOrId: string): string {
    // Clean up developer name
    const cleaned = developerOrId
      .replace(/^(Open\s+AI|OpenAI)$/i, 'OpenAI')
      .replace(/^Google$/i, 'Google')
      .replace(/^Anthropic$/i, 'Anthropic')
      .replace(/^Meta$/i, 'Meta')
      .replace(/^Flux$/i, 'Flux')
      .replace(/^ByteDance$/i, 'ByteDance')
      .replace(/^Deepgram$/i, 'Deepgram')
      .replace(/^Minimax\s+AI$/i, 'Minimax')
      .replace(/^Kling\s+AI$/i, 'Kling')
      .replace(/^Pixverse$/i, 'Pixverse');

    // If it has a slash, extract first part
    if (cleaned.includes('/')) {
      return cleaned.split('/')[0];
    }

    return cleaned || 'Unknown';
  }

  /**
   * Detect model category based on type
   */
  private detectCategory(type: string): NormalizedAIMLModel['category'] {
    const lowerType = type.toLowerCase();

    if (lowerType.includes('image')) return 'image';
    if (lowerType.includes('video')) return 'video';
    if (lowerType.includes('audio') || lowerType.includes('tts') || lowerType.includes('stt')) return 'audio';
    if (lowerType.includes('chat') || lowerType.includes('completion')) return 'text';

    return 'multimodal';
  }

  /**
   * Get pricing for a model (hardcoded from pricing page)
   */
  private getPricing(modelId: string, modelType: string): NormalizedAIMLModel['pricing'] {
    // Try exact match first
    if (PRICING_MAP[modelId]) {
      return {
        inputPerMToken: PRICING_MAP[modelId].inputPerMToken || 0,
        outputPerMToken: PRICING_MAP[modelId].outputPerMToken || 0,
        perImage: PRICING_MAP[modelId].perImage || 0,
        perSecond: PRICING_MAP[modelId].perSecond || 0,
        perCharacter: PRICING_MAP[modelId].perCharacter || 0,
      };
    }

    // Try fuzzy match with keywords
    const lowerModelId = modelId.toLowerCase();
    for (const [key, pricing] of Object.entries(PRICING_MAP)) {
      const lowerKey = key.toLowerCase();

      // Check if key is contained in modelId or vice versa
      if (lowerModelId.includes(lowerKey) || lowerKey.includes(lowerModelId)) {
        return {
          inputPerMToken: pricing.inputPerMToken || 0,
          outputPerMToken: pricing.outputPerMToken || 0,
          perImage: pricing.perImage || 0,
          perSecond: pricing.perSecond || 0,
          perCharacter: pricing.perCharacter || 0,
        };
      }
    }

    // Fallback: Estimate based on model type and common patterns
    return this.getDefaultPricingByType(modelId, modelType);
  }

  /**
   * Get pricing metadata for transparency
   */
  private getPricingMetadata(
    modelId: string,
    pricing: NormalizedAIMLModel['pricing']
  ): NormalizedAIMLModel['pricingMetadata'] | undefined {
    // Check if this is a Veo model with blended pricing
    const isVeoBlended = isBlendedPricing(modelId, 'AIML API');

    if (isVeoBlended) {
      const officialPrice = getGoogleVeoOfficialPrice(modelId);

      return {
        isBlendedPricing: true,
        officialPrice: officialPrice || undefined,
        source: 'AIML API',
        note: officialPrice
          ? `AIML API uses simplified blended pricing ($${pricing.perSecond}/sec). Google Cloud official: $${officialPrice}/sec`
          : 'AIML API uses simplified blended pricing across all Veo variants',
      };
    }

    // For non-blended pricing, return minimal metadata
    return {
      isBlendedPricing: false,
      source: 'AIML API',
    };
  }

  /**
   * Get default pricing based on model type and provider patterns
   */
  private getDefaultPricingByType(modelId: string, modelType: string): NormalizedAIMLModel['pricing'] {
    const lowerModelId = modelId.toLowerCase();

    // Chat/Text models
    if (modelType === 'chat-completion' || modelType === 'language-completion') {
      // Claude models
      if (lowerModelId.includes('claude')) {
        if (lowerModelId.includes('opus')) return { inputPerMToken: 15.75, outputPerMToken: 78.75, perImage: 0, perSecond: 0, perCharacter: 0 };
        if (lowerModelId.includes('sonnet')) return { inputPerMToken: 3.15, outputPerMToken: 15.75, perImage: 0, perSecond: 0, perCharacter: 0 };
        if (lowerModelId.includes('haiku')) return { inputPerMToken: 0.84, outputPerMToken: 4.2, perImage: 0, perSecond: 0, perCharacter: 0 };
        return { inputPerMToken: 3.15, outputPerMToken: 15.75, perImage: 0, perSecond: 0, perCharacter: 0 };
      }
      // GPT models
      if (lowerModelId.includes('gpt')) {
        if (lowerModelId.includes('gpt-4o')) return { inputPerMToken: 2.625, outputPerMToken: 10.5, perImage: 0, perSecond: 0, perCharacter: 0 };
        if (lowerModelId.includes('gpt-4')) return { inputPerMToken: 10.5, outputPerMToken: 31.5, perImage: 0, perSecond: 0, perCharacter: 0 };
        if (lowerModelId.includes('gpt-3.5')) return { inputPerMToken: 0.525, outputPerMToken: 1.575, perImage: 0, perSecond: 0, perCharacter: 0 };
        return { inputPerMToken: 2.625, outputPerMToken: 10.5, perImage: 0, perSecond: 0, perCharacter: 0 };
      }
      // Gemini models
      if (lowerModelId.includes('gemini')) {
        if (lowerModelId.includes('flash')) return { inputPerMToken: 0.315, outputPerMToken: 2.625, perImage: 0, perSecond: 0, perCharacter: 0 };
        if (lowerModelId.includes('pro')) return { inputPerMToken: 1.3125, outputPerMToken: 5.25, perImage: 0, perSecond: 0, perCharacter: 0 };
        return { inputPerMToken: 0.315, outputPerMToken: 2.625, perImage: 0, perSecond: 0, perCharacter: 0 };
      }
      // Llama models
      if (lowerModelId.includes('llama')) {
        if (lowerModelId.includes('405b')) return { inputPerMToken: 3.15, outputPerMToken: 3.15, perImage: 0, perSecond: 0, perCharacter: 0 };
        if (lowerModelId.includes('70b')) return { inputPerMToken: 0.945, outputPerMToken: 0.945, perImage: 0, perSecond: 0, perCharacter: 0 };
        if (lowerModelId.includes('8b') || lowerModelId.includes('3b')) return { inputPerMToken: 0.21, outputPerMToken: 0.21, perImage: 0, perSecond: 0, perCharacter: 0 };
        return { inputPerMToken: 0.945, outputPerMToken: 0.945, perImage: 0, perSecond: 0, perCharacter: 0 };
      }
      // Mistral models
      if (lowerModelId.includes('mistral')) {
        if (lowerModelId.includes('large')) return { inputPerMToken: 1.05, outputPerMToken: 3.15, perImage: 0, perSecond: 0, perCharacter: 0 };
        return { inputPerMToken: 0.315, outputPerMToken: 0.945, perImage: 0, perSecond: 0, perCharacter: 0 };
      }
      // DeepSeek
      if (lowerModelId.includes('deepseek')) {
        return { inputPerMToken: 0.315, outputPerMToken: 1.05, perImage: 0, perSecond: 0, perCharacter: 0 };
      }
      // Qwen
      if (lowerModelId.includes('qwen')) {
        return { inputPerMToken: 0.42, outputPerMToken: 1.26, perImage: 0, perSecond: 0, perCharacter: 0 };
      }
      // Default for chat models
      return { inputPerMToken: 1.0, outputPerMToken: 3.0, perImage: 0, perSecond: 0, perCharacter: 0 };
    }

    // Image models
    if (modelType === 'image') {
      if (lowerModelId.includes('dall-e-3')) return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0.042, perSecond: 0, perCharacter: 0 };
      if (lowerModelId.includes('dall-e')) return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0.021, perSecond: 0, perCharacter: 0 };
      if (lowerModelId.includes('flux')) return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0.032, perSecond: 0, perCharacter: 0 };
      if (lowerModelId.includes('imagen')) return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0.053, perSecond: 0, perCharacter: 0 };
      if (lowerModelId.includes('stable-diffusion') || lowerModelId.includes('sd-')) return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0.042, perSecond: 0, perCharacter: 0 };
      // Default for image models
      return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0.032, perSecond: 0, perCharacter: 0 };
    }

    // Video models
    if (modelType === 'video') {
      if (lowerModelId.includes('sora')) return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0, perSecond: 0.21, perCharacter: 0 };
      if (lowerModelId.includes('kling')) return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0, perSecond: 0.074, perCharacter: 0 };
      if (lowerModelId.includes('minimax') || lowerModelId.includes('hailuo')) return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0, perSecond: 0.158, perCharacter: 0 };
      if (lowerModelId.includes('veo')) return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0, perSecond: 0.788, perCharacter: 0 };
      // Default for video models
      return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0, perSecond: 0.1, perCharacter: 0 };
    }

    // TTS models
    if (modelType === 'tts') {
      if (lowerModelId.includes('eleven') || lowerModelId.includes('elevenlabs')) return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0, perSecond: 0, perCharacter: 0.000231 };
      if (lowerModelId.includes('deepgram') || lowerModelId.includes('aura')) return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0, perSecond: 0, perCharacter: 0.000032 };
      if (lowerModelId.includes('openai') || lowerModelId.includes('gpt')) return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0, perSecond: 0, perCharacter: 0.000016 };
      // Default for TTS
      return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0, perSecond: 0, perCharacter: 0.00005 };
    }

    // STT models (Speech-to-Text - priced per audio duration in seconds)
    if (modelType === 'stt') {
      // Whisper: $0.004/min = $0.0000667/sec
      if (lowerModelId.includes('whisper')) return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0, perSecond: 0.0000667, perCharacter: 0 };
      // Deepgram Nova: $0.006/min = $0.0001/sec
      if (lowerModelId.includes('deepgram') || lowerModelId.includes('nova')) return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0, perSecond: 0.0001, perCharacter: 0 };
      // Deepgram Aura STT: $0.016/min = $0.000267/sec
      if (lowerModelId.includes('aura')) return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0, perSecond: 0.000267, perCharacter: 0 };
      // Default for STT: Whisper price ($0.004/min = $0.0000667/sec)
      return { inputPerMToken: 0, outputPerMToken: 0, perImage: 0, perSecond: 0.0000667, perCharacter: 0 };
    }

    // Embedding models
    if (modelType === 'embedding') {
      return { inputPerMToken: 0.136, outputPerMToken: 0, perImage: 0, perSecond: 0, perCharacter: 0 };
    }

    // Default: all zeros
    return {
      inputPerMToken: 0,
      outputPerMToken: 0,
      perImage: 0,
      perSecond: 0,
      perCharacter: 0,
    };
  }

  /**
   * Get models by type
   */
  getModelsByType(type: string): NormalizedAIMLModel[] {
    return this.models.filter(model => model.type === type);
  }

  /**
   * Get models by category
   */
  getModelsByCategory(category: NormalizedAIMLModel['category']): NormalizedAIMLModel[] {
    return this.models.filter(model => model.category === category);
  }

  /**
   * Get models by provider
   */
  getModelsByProvider(provider: string): NormalizedAIMLModel[] {
    return this.models.filter(model =>
      model.provider.toLowerCase() === provider.toLowerCase()
    );
  }

  /**
   * Get model by ID
   */
  getModelById(modelId: string): NormalizedAIMLModel | undefined {
    return this.models.find(model => model.id === modelId);
  }

  /**
   * Search models
   */
  searchModels(query: string): NormalizedAIMLModel[] {
    const lowerQuery = query.toLowerCase();
    return this.models.filter(model =>
      model.name.toLowerCase().includes(lowerQuery) ||
      model.provider.toLowerCase().includes(lowerQuery) ||
      model.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get all models
   */
  getAllModels(): NormalizedAIMLModel[] {
    return this.models;
  }

  /**
   * Get cache status
   */
  getCacheStatus() {
    return {
      isCached: this.lastFetch !== null,
      lastFetch: this.lastFetch ? new Date(this.lastFetch) : null,
      cacheAge: this.lastFetch ? Date.now() - this.lastFetch : null,
      modelCount: this.models.length,
    };
  }
}

// Singleton instance
export const aimlApiService = new AIMLAPIService();
