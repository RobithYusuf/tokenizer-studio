/**
 * AI Modalities - Different types of AI capabilities
 * This defines what the AI can do (text→text, text→image, etc.)
 */

export type AIModality =
  | 'text-to-text'      // Chat, content generation, code
  | 'text-to-image'     // Image generation
  | 'image-to-text'     // Vision, OCR, image analysis
  | 'text-to-audio'     // Text-to-speech
  | 'audio-to-text'     // Speech-to-text, transcription
  | 'text-to-video';    // Video generation

export type BillingUnit = 'tokens' | 'images' | 'seconds' | 'characters' | 'requests';

export interface ModalityOption {
  id: AIModality;
  name: string;
  description: string;
  icon: string;
  examples: string[];
  billingUnit: BillingUnit;
  defaultComplexity: {
    light: { value: number; description: string };
    medium: { value: number; description: string };
    heavy: { value: number; description: string };
  };
}

/**
 * All available AI modalities with examples and defaults
 */
export const AI_MODALITIES: ModalityOption[] = [
  {
    id: 'text-to-text',
    name: 'Text → Text',
    description: 'Chat, content generation, code assistance, analysis',
    icon: '💬',
    examples: [
      'Customer support chatbot',
      'Content writing assistant',
      'Code generation & debugging',
      'Data analysis & insights',
      'Translation services',
    ],
    billingUnit: 'tokens',
    defaultComplexity: {
      light: {
        value: 250,
        description: 'Short Q&A, simple chat (100 in + 150 out tokens)',
      },
      medium: {
        value: 1000,
        description: 'Contextual chat, emails (400 in + 600 out tokens)',
      },
      heavy: {
        value: 2800,
        description: 'Long articles, code (800 in + 2000 out tokens)',
      },
    },
  },
  {
    id: 'text-to-image',
    name: 'Text → Image',
    description: 'Generate images from text descriptions',
    icon: '🎨',
    examples: [
      'Product mockups',
      'Marketing graphics',
      'Illustrations & artwork',
      'Social media content',
      'Logo generation',
    ],
    billingUnit: 'images',
    defaultComplexity: {
      light: {
        value: 1,
        description: 'Standard quality (1024x1024)',
      },
      medium: {
        value: 1,
        description: 'HD quality (1024x1024)',
      },
      heavy: {
        value: 1,
        description: 'HD large format (1536x1536)',
      },
    },
  },
  {
    id: 'image-to-text',
    name: 'Image → Text (Vision)',
    description: 'Analyze images, extract text, describe visual content',
    icon: '👁️',
    examples: [
      'OCR - Extract text from images',
      'Product recognition',
      'Image descriptions',
      'Document analysis',
      'Visual QA',
    ],
    billingUnit: 'tokens',
    defaultComplexity: {
      light: {
        value: 300,
        description: 'Simple image description (~300 tokens)',
      },
      medium: {
        value: 800,
        description: 'Detailed analysis (~800 tokens)',
      },
      heavy: {
        value: 2000,
        description: 'Complex multi-image analysis (~2000 tokens)',
      },
    },
  },
  {
    id: 'text-to-audio',
    name: 'Text → Audio (TTS)',
    description: 'Convert text to natural-sounding speech',
    icon: '🎵',
    examples: [
      'Voice assistants',
      'Audiobook generation',
      'Podcast narration',
      'IVR systems',
      'Accessibility tools',
    ],
    billingUnit: 'characters',
    defaultComplexity: {
      light: {
        value: 500,
        description: 'Short phrases (~100 words)',
      },
      medium: {
        value: 2500,
        description: 'Medium text (~500 words)',
      },
      heavy: {
        value: 7500,
        description: 'Long narration (~1500 words)',
      },
    },
  },
  {
    id: 'audio-to-text',
    name: 'Audio → Text (STT)',
    description: 'Transcribe audio to text',
    icon: '📝',
    examples: [
      'Meeting transcription',
      'Podcast subtitles',
      'Voice commands',
      'Call center analytics',
      'Interview transcription',
    ],
    billingUnit: 'seconds',
    defaultComplexity: {
      light: {
        value: 60,
        description: '1 minute audio',
      },
      medium: {
        value: 300,
        description: '5 minutes audio',
      },
      heavy: {
        value: 1800,
        description: '30 minutes audio',
      },
    },
  },
  {
    id: 'text-to-video',
    name: 'Text → Video',
    description: 'Generate video clips from text prompts',
    icon: '🎬',
    examples: [
      'Social media clips',
      'Product demos',
      'Marketing videos',
      'Animation shorts',
      'Educational content',
    ],
    billingUnit: 'seconds',
    defaultComplexity: {
      light: {
        value: 5,
        description: '5 second clip',
      },
      medium: {
        value: 15,
        description: '15 second clip',
      },
      heavy: {
        value: 30,
        description: '30 second clip',
      },
    },
  },
];

/**
 * Get modality by ID
 */
export const getModalityById = (id: AIModality): ModalityOption | undefined => {
  return AI_MODALITIES.find(m => m.id === id);
};

/**
 * Model pricing examples for different modalities
 * This is used to show realistic pricing in UI
 */
export interface ModelPricingExample {
  modality: AIModality;
  models: {
    name: string;
    provider: string;
    pricing: {
      input?: number;   // Per million tokens or per unit
      output?: number;  // Per million tokens (for text models)
      perUnit?: number; // For images, seconds, etc.
    };
    recommended: boolean;
    description: string;
  }[];
}

export const MODEL_PRICING_EXAMPLES: ModelPricingExample[] = [
  {
    modality: 'text-to-text',
    models: [
      {
        name: 'GPT-4o-mini',
        provider: 'OpenAI',
        pricing: { input: 0.15, output: 0.60 },
        recommended: true,
        description: '⚡ Fastest & cheapest - Best for most use cases',
      },
      {
        name: 'GPT-4o',
        provider: 'OpenAI',
        pricing: { input: 2.50, output: 10.00 },
        recommended: false,
        description: '🎯 Balanced - Good performance/cost ratio',
      },
      {
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        pricing: { input: 3.00, output: 15.00 },
        recommended: false,
        description: '🧠 Powerful - Best for complex tasks',
      },
      {
        name: 'Claude 3 Opus',
        provider: 'Anthropic',
        pricing: { input: 15.00, output: 75.00 },
        recommended: false,
        description: '🚀 Most capable - Expensive but most powerful',
      },
    ],
  },
  {
    modality: 'text-to-image',
    models: [
      {
        name: 'DALL-E 3 Standard',
        provider: 'OpenAI',
        pricing: { perUnit: 0.04 },
        recommended: true,
        description: '⚡ Standard quality 1024x1024',
      },
      {
        name: 'DALL-E 3 HD',
        provider: 'OpenAI',
        pricing: { perUnit: 0.08 },
        recommended: false,
        description: '🎨 HD quality 1024x1024',
      },
      {
        name: 'Stable Diffusion XL',
        provider: 'Stability AI',
        pricing: { perUnit: 0.02 },
        recommended: false,
        description: '💰 Cheaper alternative',
      },
    ],
  },
  {
    modality: 'text-to-audio',
    models: [
      {
        name: 'TTS Standard',
        provider: 'OpenAI',
        pricing: { perUnit: 0.015 }, // per 1K characters
        recommended: true,
        description: '⚡ Standard voice quality',
      },
      {
        name: 'TTS HD',
        provider: 'OpenAI',
        pricing: { perUnit: 0.03 },
        recommended: false,
        description: '🎵 High-definition voice',
      },
    ],
  },
  {
    modality: 'audio-to-text',
    models: [
      {
        name: 'Whisper',
        provider: 'OpenAI',
        pricing: { perUnit: 0.006 }, // per minute ($0.006/min = $0.0001/sec)
        recommended: true,
        description: '⚡ Fast & accurate transcription',
      },
    ],
  },
  {
    modality: 'text-to-video',
    models: [
      {
        name: 'Runway Gen-3',
        provider: 'Runway',
        pricing: { perUnit: 0.10 }, // per second
        recommended: true,
        description: '🎬 High-quality video generation',
      },
    ],
  },
];
