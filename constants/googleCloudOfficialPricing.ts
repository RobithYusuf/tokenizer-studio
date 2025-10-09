/**
 * Google Cloud Official Pricing Reference
 * Source: https://cloud.google.com/vertex-ai/generative-ai/pricing
 * Last updated: 2025-01-09
 *
 * Purpose: Provides granular pricing from Google Cloud direct API
 * to complement aggregator blended pricing (e.g., AIML API)
 */

export interface GoogleCloudVideoModelPricing {
  perSecond: number;
  variant: 'standard' | 'fast';
  features: string;
  note?: string;
}

/**
 * Google Veo Video Models Official Pricing
 * These prices are from Google Cloud Vertex AI direct API
 */
export const GOOGLE_VEO_OFFICIAL_PRICING: Record<string, GoogleCloudVideoModelPricing> = {
  // Veo 3 - Standard
  'veo-3-video-audio': {
    perSecond: 0.40,
    variant: 'standard',
    features: 'Video + Audio generation',
    note: 'Highest quality with audio track',
  },
  'veo-3-video-only': {
    perSecond: 0.20,
    variant: 'standard',
    features: 'Video generation only',
    note: 'High quality video without audio',
  },

  // Veo 3 Fast - Optimized
  'veo-3-fast-video-audio': {
    perSecond: 0.15,
    variant: 'fast',
    features: 'Video + Audio generation',
    note: 'Faster generation with audio',
  },
  'veo-3-fast-video-only': {
    perSecond: 0.10,
    variant: 'fast',
    features: 'Video generation only',
    note: 'Fastest generation, video only',
  },

  // Veo 2 - Legacy
  'veo-2-standard': {
    perSecond: 0.50,
    variant: 'standard',
    features: 'Video generation',
    note: 'Previous generation model',
  },
  'veo-2-advanced-controls': {
    perSecond: 0.50,
    variant: 'standard',
    features: 'Advanced Controls',
    note: 'Veo 2 with advanced video controls',
  },
};

/**
 * Get Google Cloud official pricing for a Veo model
 */
export function getGoogleVeoOfficialPrice(modelId: string): number | null {
  // Normalize model ID
  const normalized = modelId.toLowerCase().replace(/^google\//, '');

  // Direct match
  if (GOOGLE_VEO_OFFICIAL_PRICING[normalized]) {
    return GOOGLE_VEO_OFFICIAL_PRICING[normalized].perSecond;
  }

  // Pattern matching for AIML API model IDs
  if (normalized.includes('veo-3') && !normalized.includes('fast')) {
    // Default to video+audio for Veo 3 standard
    return GOOGLE_VEO_OFFICIAL_PRICING['veo-3-video-audio'].perSecond;
  }

  if (normalized.includes('veo-3') && normalized.includes('fast')) {
    // Default to video+audio for Veo 3 fast
    return GOOGLE_VEO_OFFICIAL_PRICING['veo-3-fast-video-audio'].perSecond;
  }

  if (normalized.includes('veo-2')) {
    return GOOGLE_VEO_OFFICIAL_PRICING['veo-2-standard'].perSecond;
  }

  return null;
}

/**
 * Check if model uses blended pricing (aggregator simplification)
 */
export function isBlendedPricing(modelId: string, source: string): boolean {
  return source === 'AIML API' && modelId.toLowerCase().includes('veo');
}

/**
 * Pricing comparison metadata
 */
export const PRICING_METADATA = {
  googleCloudDirect: {
    name: 'Google Cloud Direct',
    description: 'Official pricing from Google Cloud Vertex AI API',
    pros: ['Granular per-variant pricing', 'Official source', 'Most accurate for GCP users'],
    cons: ['Requires Google Cloud account', 'More complex billing'],
  },
  aimlApiBlended: {
    name: 'AIML API Blended',
    description: 'Simplified uniform pricing across all Veo variants',
    pros: ['Simple billing', 'No variant confusion', 'Aggregator convenience'],
    cons: ['Less granular', 'May not reflect actual Google Cloud costs'],
  },
};
