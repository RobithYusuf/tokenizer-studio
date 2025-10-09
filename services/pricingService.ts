import { Model, Provider, FxRate } from '../types';

// Define interfaces that match the API documentation
interface ModelCreator {
    id: string;
    name: string;
    slug: string;
}

interface Pricing {
    price_1m_blended_3_to_1: number;
    price_1m_input_tokens: number | null;
    price_1m_output_tokens: number | null;
}

interface RawApiModel {
    id: string;
    name: string;
    slug: string;
    model_creator: ModelCreator;
    pricing: Pricing;
}

interface RawApiResponse {
    status: number;
    data: RawApiModel[];
}


// A more robust mapping from keywords to our Provider enum
const providerKeywordMapping: { [key: string]: Provider } = {
    'openai': Provider.OpenAI,
    'anthropic': Provider.Anthropic,
    'google': Provider.Google,
    'mistral': Provider.Mistral,
    'xai': Provider.Grok,
    'grok': Provider.Grok,
    'z ai': Provider.ZAI,
    'zai': Provider.ZAI,
    'glm': Provider.ZAI,
    'deepseek': Provider.DeepSeek,
    'qwen': Provider.Qwen,
    'alibaba': Provider.Qwen,
};

// Finds the corresponding Provider enum by checking if the API provider name contains a known keyword.
const findProviderEnum = (apiProviderName: string): Provider | null => {
    const lowerApiName = apiProviderName.toLowerCase();
    for (const keyword in providerKeywordMapping) {
        if (lowerApiName.includes(keyword)) {
            return providerKeywordMapping[keyword];
        }
    }
    return null;
}

// In-memory cache for models
let modelsCache: Model[] | null = null;
let lastFetchTimestamp: number = 0;
const MODELS_CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

export const fetchModels = async (): Promise<Model[]> => {
    const now = Date.now();
    if (modelsCache && (now - lastFetchTimestamp < MODELS_CACHE_DURATION_MS)) {
        return modelsCache;
    }

    try {
        // Use Vite proxy in development, direct API in production
        const isDev = import.meta.env.DEV;
        const apiUrl = isDev
            ? '/api/models'
            : 'https://artificialanalysis.ai/api/v2/data/llms/models';

        const headers: HeadersInit = {};
        if (!isDev) {
            // Add API key for production
            headers['x-api-key'] = import.meta.env.VITE_ARTIFICIAL_ANALYSIS_API_KEY || '';
        }

        const response = await fetch(apiUrl, { headers });

        if (!response.ok) {
            throw new Error(`Failed to fetch models. Status: ${response.status}`);
        }

        const responseData: RawApiResponse = await response.json();
        const rawData = responseData.data;

        let skippedCount = 0;
        const processedModels: Model[] = rawData
            .map((rawModel): Model | null => {
                const provider = findProviderEnum(rawModel.model_creator.name);

                // Ensure model has a mapped provider and valid pricing info
                if (!provider || !rawModel.pricing || rawModel.pricing.price_1m_input_tokens === null || rawModel.pricing.price_1m_output_tokens === null) {
                    skippedCount++;
                    return null;
                }

                return {
                    id: rawModel.id, // Use the stable ID from the API
                    name: rawModel.name,
                    provider: provider,
                    input_per_mtok_usd: rawModel.pricing.price_1m_input_tokens,
                    output_per_mtok_usd: rawModel.pricing.price_1m_output_tokens,
                };
            })
            .filter((model): model is Model => model !== null)
            .sort((a, b) => a.name.localeCompare(b.name)); // Sort models alphabetically by name

        modelsCache = processedModels;
        lastFetchTimestamp = now;

        return processedModels;

    } catch (error) {
        console.error("Error fetching or processing models:", error);
        if (modelsCache) return modelsCache; // return stale cache on error if available
        throw error;
    }
};

// In-memory cache for FX rate to avoid excessive API calls
let fxCache: FxRate | null = null;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export const getUsdToIdrRate = async (): Promise<FxRate> => {
  const now = new Date();
  if (fxCache && (now.getTime() - new Date(fxCache.timestamp).getTime() < CACHE_DURATION_MS)) {
    return fxCache;
  }

  try {
    // Use Vite proxy in development, direct API in production
    const isDev = import.meta.env.DEV;
    const apiUrl = isDev
        ? '/api/exchange'
        : 'https://api.exchangerate-api.com/v4/latest/USD';

    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch exchange rate. Status: ${response.status}`);
    }
    const data = await response.json();

    // exchangerate-api.com uses different structure
    const rate = data?.rates?.IDR || data?.conversion_rates?.IDR;

    if (typeof rate !== 'number') {
        throw new Error('Invalid exchange rate data received.');
    }

    fxCache = { rate, timestamp: now.toISOString() };
    return fxCache;
  } catch (error) {
    console.error("Error fetching FX rate:", error);
    if (fxCache) return fxCache;
    return { rate: 16500, timestamp: new Date(0).toISOString() }; // Default fallback
  }
};