/**
 * Helicone LLM Cost Service
 * Data from: https://www.helicone.ai/api/llm-costs
 * Open-source pricing database with 300+ models
 */

export interface HeliconeModel {
  provider: string;
  model: string;
  operator: 'equals' | 'startsWith' | 'includes';
  input_cost_per_1m: number;
  output_cost_per_1m: number;
  per_image?: number;
  per_call?: number;
  show_in_playground: boolean;
}

export interface HeliconeResponse {
  metadata: {
    total_models: number;
    note: string;
    operators_explained: {
      equals: string;
      startsWith: string;
      includes: string;
    };
  };
  data: HeliconeModel[];
}

/**
 * Normalized model for application use
 */
export interface NormalizedHeliconeModel {
  id: string;
  name: string;
  model: string;
  provider: string;
  operator: string;
  pricing: {
    inputPerMToken: number;
    outputPerMToken: number;
    perImage: number;
    perCall: number;
  };
  showInPlayground: boolean;
}

class HeliconeService {
  private baseURL = 'https://www.helicone.ai/api/llm-costs';
  private models: NormalizedHeliconeModel[] = [];
  private lastFetch: number | null = null;
  private cacheTime = 3600000; // 1 hour

  /**
   * Fetch all models from Helicone API
   */
  async fetchModels(): Promise<NormalizedHeliconeModel[]> {
    // Return cached if available
    if (this.lastFetch && Date.now() - this.lastFetch < this.cacheTime) {
      return this.models;
    }

    try {
      const response = await fetch(this.baseURL);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: HeliconeResponse = await response.json();

      this.models = this.normalizeModels(data.data);
      this.lastFetch = Date.now();

      return this.models;
    } catch (error) {
      console.error('❌ [Helicone] Error fetching models:', error);

      // Return cached data if available
      if (this.models.length > 0) {
        return this.models;
      }

      throw error;
    }
  }

  /**
   * Fetch models by provider
   */
  async fetchByProvider(provider: string): Promise<NormalizedHeliconeModel[]> {
    try {
      const response = await fetch(`${this.baseURL}?provider=${provider.toUpperCase()}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data: HeliconeResponse = await response.json();
      return this.normalizeModels(data.data);
    } catch (error) {
      console.error(`❌ [Helicone] Error fetching ${provider} models:`, error);
      throw error;
    }
  }

  /**
   * Search models by name
   */
  async searchModels(query: string): Promise<NormalizedHeliconeModel[]> {
    try {
      const response = await fetch(`${this.baseURL}?model=${query}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data: HeliconeResponse = await response.json();
      return this.normalizeModels(data.data);
    } catch (error) {
      console.error(`❌ [Helicone] Error searching models:`, error);
      throw error;
    }
  }

  /**
   * Normalize Helicone models to application format
   */
  private normalizeModels(rawModels: HeliconeModel[]): NormalizedHeliconeModel[] {
    return rawModels.map(model => ({
      id: `${model.provider.toLowerCase()}/${model.model}`,
      name: model.model,
      model: model.model,
      provider: this.formatProviderName(model.provider),
      operator: model.operator,
      pricing: {
        inputPerMToken: model.input_cost_per_1m,
        outputPerMToken: model.output_cost_per_1m,
        perImage: model.per_image || 0,
        perCall: model.per_call || 0,
      },
      showInPlayground: model.show_in_playground,
    }));
  }

  /**
   * Format provider name for display
   */
  private formatProviderName(provider: string): string {
    const formatted: Record<string, string> = {
      'OPENAI': 'OpenAI',
      'ANTHROPIC': 'Anthropic',
      'GOOGLE': 'Google',
      'META': 'Meta',
      'MISTRAL': 'Mistral AI',
      'COHERE': 'Cohere',
      'AI21': 'AI21 Labs',
      'PERPLEXITY': 'Perplexity',
      'TOGETHER': 'Together AI',
      'ANYSCALE': 'Anyscale',
      'DEEPSEEK': 'DeepSeek',
      'FIREWORKS': 'Fireworks AI',
      'GROQ': 'Groq',
      'REPLICATE': 'Replicate',
      'XAI': 'xAI',
    };

    return formatted[provider.toUpperCase()] || provider;
  }

  /**
   * Get models by provider (from cached data)
   */
  getModelsByProvider(provider: string): NormalizedHeliconeModel[] {
    return this.models.filter(model =>
      model.provider.toLowerCase() === provider.toLowerCase()
    );
  }

  /**
   * Search models (from cached data)
   */
  searchCachedModels(query: string): NormalizedHeliconeModel[] {
    const lowerQuery = query.toLowerCase();
    return this.models.filter(model =>
      model.name.toLowerCase().includes(lowerQuery) ||
      model.provider.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get all models
   */
  getAllModels(): NormalizedHeliconeModel[] {
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
export const heliconeService = new HeliconeService();
