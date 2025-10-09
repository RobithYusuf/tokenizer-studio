import { Provider } from '../types';

export type BillingUnit = 'tokens' | 'images' | 'seconds' | 'characters';
export type UseCaseCategory = 'text' | 'image' | 'video' | 'audio' | 'multimodal';
export type RequestComplexity = 'light' | 'medium' | 'heavy';

export interface ComplexityPreset {
  id: RequestComplexity;
  name: string;
  description: string;
  examples: string[];
  avgInputTokens: number;
  avgOutputTokens: number;
  avgTotalTokens: number;
  estimatedCostUSD: number; // Based on GPT-4o-mini pricing
  estimatedCostIDR: number; // At ~Rp 15,000/USD
}

export interface UseCaseTemplate {
  id: string;
  name: string;
  category: UseCaseCategory;
  description: string;
  billingUnit: BillingUnit;
  estimatedInputUnit: number;
  estimatedOutputUnit: number;
  recommendedProvider?: Provider; // Optional - only for filtering suggestions
  recommendedModelName?: string; // Optional - only for filtering suggestions
  // Pricing reference (for non-LLM models that aren't in API)
  customPricing?: {
    inputPricePerUnit: number; // USD
    outputPricePerUnit: number; // USD
    unitDescription: string; // e.g., "per image", "per 1000 chars"
  };
}

/**
 * Request Complexity Presets for Simple Mode
 * Based on GPT-4o-mini pricing (~$0.15/1M input, ~$0.60/1M output)
 */
export const COMPLEXITY_PRESETS: ComplexityPreset[] = [
  {
    id: 'light',
    name: 'Light Request',
    description: 'Short questions & brief responses',
    examples: [
      'FAQ chatbot',
      'Simple Q&A',
      'Quick translations',
      'Short summaries'
    ],
    avgInputTokens: 100,
    avgOutputTokens: 150,
    avgTotalTokens: 250,
    estimatedCostUSD: 0.0001, // (100*0.15 + 150*0.60)/1M = $0.0001
    estimatedCostIDR: 1.5, // ~Rp 1.5 per request
  },
  {
    id: 'medium',
    name: 'Medium Request',
    description: 'Contextual conversations & content',
    examples: [
      'Customer support with history',
      'Product descriptions',
      'Email drafting',
      'Code snippets'
    ],
    avgInputTokens: 400,
    avgOutputTokens: 600,
    avgTotalTokens: 1000,
    estimatedCostUSD: 0.00042, // (400*0.15 + 600*0.60)/1M = $0.00042
    estimatedCostIDR: 6.3, // ~Rp 6.3 per request
  },
  {
    id: 'heavy',
    name: 'Heavy Request',
    description: 'Long-form content & analysis',
    examples: [
      'Blog articles',
      'Code generation',
      'Document analysis',
      'Detailed reports'
    ],
    avgInputTokens: 800,
    avgOutputTokens: 2000,
    avgTotalTokens: 2800,
    estimatedCostUSD: 0.00132, // (800*0.15 + 2000*0.60)/1M = $0.00132
    estimatedCostIDR: 19.8, // ~Rp 20 per request
  },
];

/**
 * Curated use case templates based on real-world scenarios
 * with industry-standard pricing from official sources
 */
export const USE_CASE_TEMPLATES: UseCaseTemplate[] = [
  // TEXT-BASED USE CASES (user can select any model)
  {
    id: 'chatbot-simple',
    name: 'Simple Chatbot (FAQ, Support)',
    category: 'text',
    description: 'Basic Q&A chatbot for customer support with short context',
    billingUnit: 'tokens',
    estimatedInputUnit: 400, // Question + small context
    estimatedOutputUnit: 250, // Brief answer
  },
  {
    id: 'chatbot-advanced',
    name: 'Advanced Chatbot (Contextual)',
    category: 'text',
    description: 'Context-aware chatbot with conversation history',
    billingUnit: 'tokens',
    estimatedInputUnit: 1500, // Question + conversation + context
    estimatedOutputUnit: 600, // Detailed response
  },
  {
    id: 'content-writer',
    name: 'Content Writing Assistant',
    category: 'text',
    description: 'Generate blog posts, articles, marketing copy',
    billingUnit: 'tokens',
    estimatedInputUnit: 300, // Brief + outline
    estimatedOutputUnit: 2000, // Long-form content
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    category: 'text',
    description: 'Code generation, debugging, and explanation',
    billingUnit: 'tokens',
    estimatedInputUnit: 1200, // Code + instructions
    estimatedOutputUnit: 1000, // Generated code + explanation
  },
  {
    id: 'data-analyst',
    name: 'Data Analysis Assistant',
    category: 'text',
    description: 'Analyze data, generate insights and summaries',
    billingUnit: 'tokens',
    estimatedInputUnit: 2500, // Data + query
    estimatedOutputUnit: 800, // Analysis report
  },
  {
    id: 'summarizer',
    name: 'Document Summarizer',
    category: 'text',
    description: 'Summarize long documents, articles, reports',
    billingUnit: 'tokens',
    estimatedInputUnit: 3000, // Long document
    estimatedOutputUnit: 400, // Summary
  },

  // IMAGE GENERATION (custom pricing - DALL-E 3)
  {
    id: 'image-gen-standard',
    name: 'Image Generation (Standard)',
    category: 'image',
    description: 'Generate images from text prompts (1024x1024)',
    billingUnit: 'images',
    estimatedInputUnit: 1, // 1 prompt = 1 image
    estimatedOutputUnit: 1,
    customPricing: {
      inputPricePerUnit: 0, // No input cost
      outputPricePerUnit: 0.04, // $0.04 per image (standard 1024x1024)
      unitDescription: 'per image',
    },
  },
  {
    id: 'image-gen-hd',
    name: 'Image Generation (HD)',
    category: 'image',
    description: 'Generate high-quality images (HD 1024x1024)',
    billingUnit: 'images',
    estimatedInputUnit: 1,
    estimatedOutputUnit: 1,
    customPricing: {
      inputPricePerUnit: 0,
      outputPricePerUnit: 0.08, // $0.08 per image (HD 1024x1024)
      unitDescription: 'per image',
    },
  },

  // TEXT-TO-SPEECH (custom pricing - OpenAI TTS)
  {
    id: 'tts-standard',
    name: 'Text-to-Speech (Standard)',
    category: 'audio',
    description: 'Convert text to natural-sounding speech',
    billingUnit: 'characters',
    estimatedInputUnit: 500, // ~100 words
    estimatedOutputUnit: 500, // Same as input for TTS
    customPricing: {
      inputPricePerUnit: 0.015, // $15 per 1M chars = $0.015 per 1K chars
      outputPricePerUnit: 0, // Output included in input cost
      unitDescription: 'per 1,000 characters',
    },
  },
  {
    id: 'tts-hd',
    name: 'Text-to-Speech (HD)',
    category: 'audio',
    description: 'High-quality voice generation',
    billingUnit: 'characters',
    estimatedInputUnit: 500,
    estimatedOutputUnit: 500,
    customPricing: {
      inputPricePerUnit: 0.03, // $30 per 1M chars = $0.03 per 1K chars
      outputPricePerUnit: 0,
      unitDescription: 'per 1,000 characters',
    },
  },

  // TEXT-TO-VIDEO (custom pricing - Runway Gen-3)
  {
    id: 'video-gen-short',
    name: 'Video Generation (Short)',
    category: 'video',
    description: 'Generate short video clips (5-10 seconds)',
    billingUnit: 'seconds',
    estimatedInputUnit: 1, // Prompt doesn't count in seconds
    estimatedOutputUnit: 5, // 5 seconds of video
    customPricing: {
      inputPricePerUnit: 0,
      outputPricePerUnit: 0.10, // $0.10 per second
      unitDescription: 'per second',
    },
  },
  {
    id: 'video-gen-medium',
    name: 'Video Generation (Medium)',
    category: 'video',
    description: 'Generate medium-length videos (10-30 seconds)',
    billingUnit: 'seconds',
    estimatedInputUnit: 1,
    estimatedOutputUnit: 20, // 20 seconds
    customPricing: {
      inputPricePerUnit: 0,
      outputPricePerUnit: 0.10,
      unitDescription: 'per second',
    },
  },
];

/**
 * Business defaults based on industry averages
 */
export const BUSINESS_DEFAULTS = {
  volumePerMonth: 5000, // Average small-medium business API usage
  periodMonths: 3,
  growthRate: 15, // 15% monthly growth typical for growing SaaS
  budgetIDR: 5000000, // Rp 5 juta - common starting budget
};

/**
 * Get template by ID
 */
export const getTemplateById = (id: string): UseCaseTemplate | undefined => {
  return USE_CASE_TEMPLATES.find(t => t.id === id);
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: UseCaseCategory): UseCaseTemplate[] => {
  return USE_CASE_TEMPLATES.filter(t => t.category === category);
};
