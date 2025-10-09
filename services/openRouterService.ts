/**
 * OpenRouter API Service
 * Unified pricing data for 400+ multimodal AI models
 * Documentation: https://openrouter.ai/docs/models
 */

export interface OpenRouterModel {
  id: string;
  canonical_slug: string;
  name: string;
  description: string;
  created: number;
  context_length: number;
  architecture: {
    modality: string;
    input_modalities: string[];
    output_modalities: string[];
    tokenizer: string;
    instruct_type: string | null;
  };
  pricing: {
    prompt: string; // USD per token
    completion: string; // USD per token
    request: string; // USD per request
    image: string; // USD per image
    web_search: string; // USD per search
    internal_reasoning: string; // USD per token
    input_cache_read?: string;
    input_cache_write?: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens: number;
    is_moderated: boolean;
  };
  supported_parameters?: string[];
}

export interface OpenRouterResponse {
  data: OpenRouterModel[];
}

/**
 * Normalized model for application use
 */
export interface NormalizedModel {
  id: string;
  name: string;
  provider: string; // Extracted from id (e.g., "openai" from "openai/gpt-4")
  description: string;
  category: 'text' | 'image' | 'audio' | 'video' | 'multimodal';
  contextLength: number;
  maxTokens: number;
  pricing: {
    inputPerToken: number; // USD
    outputPerToken: number; // USD
    inputPerMToken: number; // USD per 1M tokens
    outputPerMToken: number; // USD per 1M tokens
    perRequest: number; // USD
    perImage: number; // USD
  };
  modalities: {
    input: string[];
    output: string[];
  };
  isFree: boolean;
  createdAt: Date;
}

class OpenRouterService {
  private baseURL = 'https://openrouter.ai/api/v1';
  private models: NormalizedModel[] = [];
  private rawModels: OpenRouterModel[] = [];
  private lastFetch: number | null = null;
  private cacheTime = 3600000; // 1 hour

  /**
   * Fetch all models from OpenRouter
   */
  async fetchModels(): Promise<NormalizedModel[]> {
    // Return cached if available
    if (this.lastFetch && Date.now() - this.lastFetch < this.cacheTime) {
      return this.models;
    }

    try {
      const response = await fetch(`${this.baseURL}/models`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OpenRouterResponse = await response.json();
      this.rawModels = data.data;
      this.models = this.normalizeModels(data.data);
      this.lastFetch = Date.now();

      return this.models;
    } catch (error) {
      console.error('❌ [OpenRouter] Error fetching models:', error);

      // Return cached data if available
      if (this.models.length > 0) {
        console.warn('⚠️ [OpenRouter] Using cached models due to fetch error');
        return this.models;
      }

      throw error;
    }
  }

  /**
   * Normalize OpenRouter models to application format
   */
  private normalizeModels(rawModels: OpenRouterModel[]): NormalizedModel[] {
    return rawModels.map(model => {
      const provider = this.extractProvider(model.id);
      const category = this.detectCategory(model.architecture);
      const inputPerToken = parseFloat(model.pricing.prompt);
      const outputPerToken = parseFloat(model.pricing.completion);
      const perRequest = parseFloat(model.pricing.request);
      const perImage = parseFloat(model.pricing.image);

      return {
        id: model.id,
        name: model.name,
        provider,
        description: model.description,
        category,
        contextLength: model.context_length,
        maxTokens: model.top_provider.max_completion_tokens,
        pricing: {
          inputPerToken,
          outputPerToken,
          inputPerMToken: inputPerToken * 1_000_000,
          outputPerMToken: outputPerToken * 1_000_000,
          perRequest,
          perImage,
        },
        modalities: {
          input: model.architecture.input_modalities,
          output: model.architecture.output_modalities,
        },
        isFree: inputPerToken === 0 && outputPerToken === 0 && perRequest === 0,
        createdAt: new Date(model.created * 1000),
      };
    });
  }

  /**
   * Extract provider name from model ID
   */
  private extractProvider(modelId: string): string {
    const parts = modelId.split('/');
    if (parts.length > 1) {
      return parts[0];
    }
    return 'unknown';
  }

  /**
   * Detect model category based on modalities
   */
  private detectCategory(architecture: OpenRouterModel['architecture']): NormalizedModel['category'] {
    const { input_modalities, output_modalities } = architecture;

    // Text-to-Image (e.g., DALL-E, Midjourney)
    if (output_modalities.includes('image') && input_modalities.includes('text')) {
      return 'image';
    }

    // Text-to-Audio (e.g., TTS)
    if (output_modalities.includes('audio')) {
      return 'audio';
    }

    // Video models
    if (input_modalities.includes('video') || output_modalities.includes('video')) {
      return 'video';
    }

    // Multimodal (text + image input)
    if (input_modalities.includes('image') && input_modalities.includes('text')) {
      return 'multimodal';
    }

    // Default: text-only
    return 'text';
  }

  /**
   * Get models by category
   */
  getModelsByCategory(category: NormalizedModel['category']): NormalizedModel[] {
    return this.models.filter(model => model.category === category);
  }

  /**
   * Get models by provider
   */
  getModelsByProvider(provider: string): NormalizedModel[] {
    return this.models.filter(model =>
      model.provider.toLowerCase() === provider.toLowerCase()
    );
  }

  /**
   * Get free models
   */
  getFreeModels(): NormalizedModel[] {
    return this.models.filter(model => model.isFree);
  }

  /**
   * Get model by ID
   */
  getModelById(modelId: string): NormalizedModel | undefined {
    return this.models.find(model => model.id === modelId);
  }

  /**
   * Search models by name or description
   */
  searchModels(query: string): NormalizedModel[] {
    const lowerQuery = query.toLowerCase();
    return this.models.filter(model =>
      model.name.toLowerCase().includes(lowerQuery) ||
      model.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Calculate cost for a request
   */
  calculateCost(
    modelId: string,
    inputTokens: number,
    outputTokens: number,
    options: {
      images?: number;
      exchangeRate?: number;
    } = {}
  ) {
    const model = this.getModelById(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    const { images = 0, exchangeRate = 16500 } = options;

    const inputCost = inputTokens * model.pricing.inputPerToken;
    const outputCost = outputTokens * model.pricing.outputPerToken;
    const imageCost = images * model.pricing.perImage;
    const requestCost = model.pricing.perRequest;

    const totalUSD = inputCost + outputCost + imageCost + requestCost;
    const totalIDR = totalUSD * exchangeRate;

    return {
      input: inputCost,
      output: outputCost,
      image: imageCost,
      request: requestCost,
      totalUSD,
      totalIDR,
      breakdown: {
        inputTokens,
        outputTokens,
        images,
        pricePerInputToken: model.pricing.inputPerToken,
        pricePerOutputToken: model.pricing.outputPerToken,
        pricePerImage: model.pricing.perImage,
        pricePerRequest: model.pricing.perRequest,
      }
    };
  }

  /**
   * Get all models
   */
  getAllModels(): NormalizedModel[] {
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
export const openRouterService = new OpenRouterService();
