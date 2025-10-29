export enum Provider {
  OpenAI = 'openai',
  Anthropic = 'anthropic',
  Google = 'gemini',
  Mistral = 'mistral',
  Grok = 'grok',
  ZAI = 'zai',
  DeepSeek = 'deepseek',
  Qwen = 'qwen',
}

export interface Model {
  id: string;
  name: string;
  provider: Provider;
  input_per_mtok_usd: number;
  output_per_mtok_usd: number;
  long_context_threshold?: number;
  long_context_input_usd?: number;
  long_context_output_usd?: number;
  notes?: string;
}

export interface FxRate {
  rate: number;
  timestamp: string;
}

export interface UsageLog {
  id: number;
  provider: Provider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  costIDR: number;
  timestamp: string;
  inputText?: string;
  // Simulator-specific fields
  type?: 'estimator' | 'simulator-budget' | 'simulator-volume';
  simulatorData?: {
    mode?: 'budget' | 'volume';
    modality?: string;
    periodMonths?: number;
    monthlyRequests?: number;
    totalRequests?: number;
    apiCallsPerDay?: number;
  };
}