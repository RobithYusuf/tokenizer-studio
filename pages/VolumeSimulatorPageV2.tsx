import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { FxRate } from '../types';
import { getUsdToIdrRate } from '../services/pricingService';
import { USE_CASE_TEMPLATES, BUSINESS_DEFAULTS, UseCaseTemplate } from '../constants/useCaseTemplates';
import { AI_MODALITIES, AIModality, getModalityById, MODEL_PRICING_EXAMPLES } from '../constants/modalities';
import { calculateFromBudget, validateBudgetInput, BudgetCalculationResult } from '../services/budgetCalculator';
import { calculateCostFromVolume, validateVolumeInput, VolumeCalculationResult } from '../services/volumeCalculator';
import { getGoogleVeoOfficialPrice, isBlendedPricing } from '../constants/googleCloudOfficialPricing';
import { useModalityFilters } from '../hooks/useModalityFilters';
import Dropdown from '../components/Dropdown';
import Card from '../components/Card';
import Button from '../components/Button';
import SliderInput from '../components/SliderInput';
import { AppContext } from '../App';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

type SimulatorMode = 'budget' | 'volume';
type ComplexityLevel = 'light' | 'medium' | 'heavy';

/**
 * Get actual per-second pricing, using official Google Cloud pricing if available
 * This fixes blended pricing issues (e.g., Veo models)
 */
const getActualPerSecondPricing = (model: any): number => {
  const modelId = model.id || '';
  const source = model.source || '';

  // Check if this is a Veo model with blended pricing
  if (isBlendedPricing(modelId, source)) {
    const officialPrice = getGoogleVeoOfficialPrice(modelId);
    if (officialPrice) {
      return officialPrice;
    }
  }

  // Use model's pricing as-is
  return model.pricing.perSecond || 0;
};

const VolumeSimulatorPageV2: React.FC = () => {
  const [mode, setMode] = useState<SimulatorMode>('volume');
  const [fxRate, setFxRate] = useState<FxRate | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Budget Mode States (NEW - Modality-First Approach, same as Volume Mode)
  const [budgetIDR, setBudgetIDR] = useState<number>(BUSINESS_DEFAULTS.budgetIDR);
  const [budgetModality, setBudgetModality] = useState<AIModality>('text-to-text');
  const [budgetComplexity, setBudgetComplexity] = useState<ComplexityLevel>('medium');
  const [budgetModelName, setBudgetModelName] = useState<string>(''); // Empty = auto-select
  const [budgetModelSearchQuery, setBudgetModelSearchQuery] = useState<string>('');
  const [periodMonths, setPeriodMonths] = useState<number>(BUSINESS_DEFAULTS.periodMonths);
  const [growthRate, setGrowthRate] = useState<number>(BUSINESS_DEFAULTS.growthRate);
  const [budgetResult, setBudgetResult] = useState<BudgetCalculationResult | null>(null);

  // Volume Mode States - Modality-First Approach
  const [selectedModality, setSelectedModality] = useState<AIModality>('text-to-text'); // Default to most common
  const [selectedComplexity, setSelectedComplexity] = useState<ComplexityLevel>('medium');
  const [selectedModelName, setSelectedModelName] = useState<string>(''); // Empty = auto-select
  const [modelSearchQuery, setModelSearchQuery] = useState<string>(''); // Search filter for models
  const [apiCallsPerDay, setApiCallsPerDay] = useState<number>(5000);
  const [volumePeriod, setVolumePeriod] = useState<number>(1);
  const [volumeGrowth, setVolumeGrowth] = useState<number>(0);
  const [volumeResult, setVolumeResult] = useState<VolumeCalculationResult | null>(null);

  const appContext = useContext(AppContext);
  const {
    models: aaModels,
    isLoadingModels: isLoadingAA,
    openRouterModels,
    isLoadingOpenRouter,
    aimlApiModels,
    isLoadingAIML,
    heliconeModels,
    isLoadingHelicone
  } = appContext!;

  // Combine all models from 4 sources with source label
  const allModelsWithSource = useMemo(() => {
    const combined: Array<{
      id: string;
      name: string;
      provider: string;
      source: 'Artificial Analysis' | 'OpenRouter' | 'AIML API' | 'Helicone';
      category: string;
      modalities: { input: string[]; output: string[] };
      pricing: {
        inputPerMToken: number;
        outputPerMToken: number;
        perImage: number;
        perRequest: number;
        perSecond?: number; // For video models
        perCharacter?: number; // For TTS models
      };
      isFree?: boolean;
      description: string;
    }> = [];

    // Add Artificial Analysis models (text only)
    // Filter out models with 0/0 pricing (deprecated, preview, or open-source self-hosted)
    aaModels.forEach(m => {
      // Skip models with no pricing (0/0 = deprecated/preview/open-source)
      if (m.input_per_mtok_usd === 0 && m.output_per_mtok_usd === 0) {
        return; // Skip this model
      }

      combined.push({
        id: `aa-${m.id}`,
        name: m.name,
        provider: m.provider || 'Artificial Analysis',
        source: 'Artificial Analysis',
        category: 'text',
        modalities: { input: ['text'], output: ['text'] },
        pricing: {
          inputPerMToken: m.input_per_mtok_usd,
          outputPerMToken: m.output_per_mtok_usd,
          perImage: 0,
          perRequest: 0,
        },
        description: m.notes || 'LLM with performance benchmarks',
      });
    });

    // Add OpenRouter models
    openRouterModels.forEach(m => {
      combined.push({
        ...m,
        source: 'OpenRouter',
      });
    });

    // Add AIML API models
    aimlApiModels.forEach(m => {
      // Detect STT models (Speech-to-Text) by pricing structure and keywords
      const nameOrId = `${m.name} ${m.id}`.toLowerCase();
      const isSTT = (m.category === 'audio' && m.pricing.perSecond && m.pricing.perSecond > 0) ||
                    nameOrId.includes('whisper') || nameOrId.includes('deepgram') ||
                    nameOrId.includes('nova') || nameOrId.includes('aura') ||
                    nameOrId.includes('stt') || nameOrId.includes('transcribe');

      // Detect TTS models (Text-to-Speech) by pricing structure
      const isTTS = m.category === 'audio' && m.pricing.perCharacter && m.pricing.perCharacter > 0;

      combined.push({
        id: `aiml-${m.id}`,
        name: m.name,
        provider: m.provider,
        source: 'AIML API',
        category: m.category,
        modalities: {
          // Input modality
          input: isSTT ? ['audio'] :
                 isTTS ? ['text'] :
                 ['text'], // Default: text input
          // Output modality
          output: isSTT ? ['text'] :
                  m.category === 'image' ? ['image'] :
                  m.category === 'audio' ? ['audio'] :
                  m.category === 'video' ? ['video'] :
                  ['text']
        },
        pricing: {
          inputPerMToken: m.pricing.inputPerMToken,
          outputPerMToken: m.pricing.outputPerMToken,
          perImage: m.pricing.perImage,
          perRequest: 0,
          perSecond: m.pricing.perSecond,
          perCharacter: m.pricing.perCharacter,
        },
        description: m.type || 'Multimodal AI model',
      });
    });

    // Add Helicone models
    heliconeModels.forEach(m => {
      combined.push({
        id: `helicone-${m.id}`,
        name: m.name,
        provider: m.provider,
        source: 'Helicone',
        category: 'text', // Helicone mostly text models
        modalities: { input: ['text'], output: ['text'] },
        pricing: {
          inputPerMToken: m.pricing.inputPerMToken,
          outputPerMToken: m.pricing.outputPerMToken,
          perImage: m.pricing.perImage,
          perRequest: m.pricing.perCall,
        },
        description: 'Community-verified pricing',
      });
    });

    // Deduplicate models by ID (keep first occurrence = highest priority source)
    // Priority: AA > OpenRouter > AIML API > Helicone
    const seenIds = new Set<string>();
    const deduplicated = combined.filter(model => {
      if (seenIds.has(model.id)) {
        return false;
      }
      seenIds.add(model.id);
      return true;
    });

    return deduplicated;
  }, [aaModels, openRouterModels, aimlApiModels, heliconeModels]);

  // Use combined models for Simulator
  const models = allModelsWithSource;
  const isLoadingModels = isLoadingAA || isLoadingOpenRouter || isLoadingAIML || isLoadingHelicone;

  // Popular/Recommended models to show at top
  const POPULAR_MODEL_IDS = [
    'gpt-4o-mini',
    'gpt-4o',
    'claude-3.5-sonnet',
    'claude-3-haiku',
    'gemini-pro-1.5',
    'gemini-flash-1.5',
    'llama-3.1-70b',
  ];

  // Budget Mode: Get modality details
  const budgetModalityDetails = useMemo(() => {
    return getModalityById(budgetModality);
  }, [budgetModality]);

  // Budget Mode: Filter models by modality
  const budgetAvailableModels = useModalityFilters(models, budgetModality);

  // Budget Mode: Filter by search query
  const budgetFilteredModels = useMemo(() => {
    if (!budgetModelSearchQuery) return budgetAvailableModels;

    const query = budgetModelSearchQuery.toLowerCase();
    return budgetAvailableModels.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.provider.toLowerCase().includes(query) ||
      m.description.toLowerCase().includes(query)
    );
  }, [budgetAvailableModels, budgetModelSearchQuery]);

  // Budget Mode: Group models by provider
  const budgetGroupedModels = useMemo(() => {
    const groups: Record<string, typeof budgetFilteredModels> = {};

    budgetFilteredModels.forEach(model => {
      const providerKey = model.provider;
      if (!groups[providerKey]) {
        groups[providerKey] = [];
      }
      groups[providerKey].push(model);
    });

    return groups;
  }, [budgetFilteredModels]);

  // Budget Mode: Get selected model (or auto-select first)
  const budgetSelectedModel = useMemo(() => {
    if (budgetModelName) {
      return budgetAvailableModels.find(m => m.name === budgetModelName);
    }
    // Auto-select: first model (already sorted by popularity and price)
    return budgetAvailableModels[0];
  }, [budgetModelName, budgetAvailableModels]);

  // Get selected modality details for Volume Mode
  const modalityDetails = useMemo(() => {
    return getModalityById(selectedModality);
  }, [selectedModality]);

  // Use custom hook for filtering models by modality
  const availableModelsForModality = useModalityFilters(models, selectedModality);

  // Filter models by search query
  const filteredModels = useMemo(() => {
    if (!modelSearchQuery) return availableModelsForModality;

    const query = modelSearchQuery.toLowerCase();
    return availableModelsForModality.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.provider.toLowerCase().includes(query) ||
      m.description.toLowerCase().includes(query)
    );
  }, [availableModelsForModality, modelSearchQuery]);

  // Group models by provider for better organization
  const groupedModels = useMemo(() => {
    const groups: Record<string, typeof filteredModels> = {};

    filteredModels.forEach(model => {
      const providerKey = model.provider;
      if (!groups[providerKey]) {
        groups[providerKey] = [];
      }
      groups[providerKey].push(model);
    });

    return groups;
  }, [filteredModels]);

  // Get selected model (or auto-select first)
  const selectedModel = useMemo(() => {
    if (selectedModelName) {
      return availableModelsForModality.find(m => m.name === selectedModelName);
    }
    // Auto-select: first model (already sorted by popularity and price)
    return availableModelsForModality[0];
  }, [selectedModelName, availableModelsForModality]);

  // Budget Mode: Calculate cost per request based on modality, model, and complexity
  const budgetCostPerRequest = useMemo(() => {
    if (!budgetModalityDetails || !budgetSelectedModel || !fxRate) return { usd: 0, idr: 0 };

    const complexityConfig = budgetModalityDetails.defaultComplexity[budgetComplexity];
    let costUSD = 0;

    // Calculate based on modality type (same logic as Volume Mode)
    if (budgetModality === 'text-to-text' || budgetModality === 'image-to-text') {
      const totalTokens = complexityConfig.value;
      const inputTokens = Math.floor(totalTokens * 0.4);
      const outputTokens = Math.ceil(totalTokens * 0.6);

      const inputCost = (inputTokens / 1_000_000) * budgetSelectedModel.pricing.inputPerMToken;
      const outputCost = (outputTokens / 1_000_000) * budgetSelectedModel.pricing.outputPerMToken;
      costUSD = inputCost + outputCost + budgetSelectedModel.pricing.perRequest;
    } else if (budgetModality === 'text-to-image') {
      costUSD = budgetSelectedModel.pricing.perImage * complexityConfig.value + budgetSelectedModel.pricing.perRequest;
    } else if (budgetModality === 'text-to-video') {
      const actualPerSecondPrice = getActualPerSecondPricing(budgetSelectedModel);
      if (actualPerSecondPrice > 0) {
        costUSD = actualPerSecondPrice * complexityConfig.value + budgetSelectedModel.pricing.perRequest;
      } else if (budgetSelectedModel.pricing.inputPerMToken > 0 || budgetSelectedModel.pricing.outputPerMToken > 0) {
        const totalTokens = complexityConfig.value;
        const inputTokens = Math.floor(totalTokens * 0.4);
        const outputTokens = Math.ceil(totalTokens * 0.6);
        const inputCost = (inputTokens / 1_000_000) * budgetSelectedModel.pricing.inputPerMToken;
        const outputCost = (outputTokens / 1_000_000) * budgetSelectedModel.pricing.outputPerMToken;
        costUSD = inputCost + outputCost + budgetSelectedModel.pricing.perRequest;
      } else {
        costUSD = budgetSelectedModel.pricing.perRequest;
      }
    } else if (budgetModality === 'text-to-audio') {
      if (budgetSelectedModel.pricing.perCharacter && budgetSelectedModel.pricing.perCharacter > 0) {
        costUSD = budgetSelectedModel.pricing.perCharacter * complexityConfig.value + budgetSelectedModel.pricing.perRequest;
      } else if (budgetSelectedModel.pricing.inputPerMToken > 0 || budgetSelectedModel.pricing.outputPerMToken > 0) {
        const totalTokens = complexityConfig.value;
        const inputTokens = Math.floor(totalTokens * 0.4);
        const outputTokens = Math.ceil(totalTokens * 0.6);
        const inputCost = (inputTokens / 1_000_000) * budgetSelectedModel.pricing.inputPerMToken;
        const outputCost = (outputTokens / 1_000_000) * budgetSelectedModel.pricing.outputPerMToken;
        costUSD = inputCost + outputCost + budgetSelectedModel.pricing.perRequest;
      } else {
        costUSD = budgetSelectedModel.pricing.perRequest;
      }
    } else if (budgetModality === 'audio-to-text') {
      if (budgetSelectedModel.pricing.perSecond && budgetSelectedModel.pricing.perSecond > 0) {
        costUSD = budgetSelectedModel.pricing.perSecond * complexityConfig.value + budgetSelectedModel.pricing.perRequest;
      } else if (budgetSelectedModel.pricing.inputPerMToken > 0 || budgetSelectedModel.pricing.outputPerMToken > 0) {
        const totalTokens = complexityConfig.value;
        const inputTokens = Math.floor(totalTokens * 0.4);
        const outputTokens = Math.ceil(totalTokens * 0.6);
        const inputCost = (inputTokens / 1_000_000) * budgetSelectedModel.pricing.inputPerMToken;
        const outputCost = (outputTokens / 1_000_000) * budgetSelectedModel.pricing.outputPerMToken;
        costUSD = inputCost + outputCost + budgetSelectedModel.pricing.perRequest;
      } else {
        costUSD = budgetSelectedModel.pricing.perRequest;
      }
    }

    return {
      usd: costUSD,
      idr: costUSD * fxRate.rate,
    };
  }, [budgetModalityDetails, budgetSelectedModel, budgetComplexity, fxRate, budgetModality]);

  // Helper function to calculate cost for a specific complexity level
  const calculateCostForComplexity = useCallback((
    complexity: ComplexityLevel,
    modality: AIModality,
    model: typeof selectedModel,
    modalityInfo: ModalityOption | undefined,
    rate: FxRate | null
  ): number => {
    if (!modalityInfo || !model || !rate) return 0;

    const complexityConfig = modalityInfo.defaultComplexity[complexity];
    let costUSD = 0;

    // Calculate based on modality type
    if (modality === 'text-to-text' || modality === 'image-to-text') {
      const inputTokens = Math.floor(complexityConfig.value * 0.4);
      const outputTokens = Math.ceil(complexityConfig.value * 0.6);
      const inputCost = (inputTokens / 1_000_000) * model.pricing.inputPerMToken;
      const outputCost = (outputTokens / 1_000_000) * model.pricing.outputPerMToken;
      costUSD = inputCost + outputCost + model.pricing.perRequest;
    } else if (modality === 'text-to-image') {
      costUSD = model.pricing.perImage * complexityConfig.value + model.pricing.perRequest;
    } else if (modality === 'text-to-video') {
      const actualPerSecondPrice = getActualPerSecondPricing(model);
      if (actualPerSecondPrice > 0) {
        costUSD = actualPerSecondPrice * complexityConfig.value + model.pricing.perRequest;
      } else if (model.pricing.inputPerMToken > 0 || model.pricing.outputPerMToken > 0) {
        const inputTokens = Math.floor(complexityConfig.value * 0.4);
        const outputTokens = Math.ceil(complexityConfig.value * 0.6);
        const inputCost = (inputTokens / 1_000_000) * model.pricing.inputPerMToken;
        const outputCost = (outputTokens / 1_000_000) * model.pricing.outputPerMToken;
        costUSD = inputCost + outputCost + model.pricing.perRequest;
      } else {
        costUSD = model.pricing.perRequest;
      }
    } else if (modality === 'text-to-audio') {
      if (model.pricing.perCharacter && model.pricing.perCharacter > 0) {
        costUSD = model.pricing.perCharacter * complexityConfig.value + model.pricing.perRequest;
      } else if (model.pricing.inputPerMToken > 0 || model.pricing.outputPerMToken > 0) {
        const inputTokens = Math.floor(complexityConfig.value * 0.4);
        const outputTokens = Math.ceil(complexityConfig.value * 0.6);
        const inputCost = (inputTokens / 1_000_000) * model.pricing.inputPerMToken;
        const outputCost = (outputTokens / 1_000_000) * model.pricing.outputPerMToken;
        costUSD = inputCost + outputCost + model.pricing.perRequest;
      } else {
        costUSD = model.pricing.perRequest;
      }
    } else if (modality === 'audio-to-text') {
      if (model.pricing.perSecond && model.pricing.perSecond > 0) {
        costUSD = model.pricing.perSecond * complexityConfig.value + model.pricing.perRequest;
      } else if (model.pricing.inputPerMToken > 0 || model.pricing.outputPerMToken > 0) {
        const inputTokens = Math.floor(complexityConfig.value * 0.4);
        const outputTokens = Math.ceil(complexityConfig.value * 0.6);
        const inputCost = (inputTokens / 1_000_000) * model.pricing.inputPerMToken;
        const outputCost = (outputTokens / 1_000_000) * model.pricing.outputPerMToken;
        costUSD = inputCost + outputCost + model.pricing.perRequest;
      } else {
        costUSD = model.pricing.perRequest;
      }
    }

    return costUSD * rate.rate;
  }, []);

  // Volume Mode: Pre-calculate costs for all complexity levels (memoized)
  const complexityCosts = useMemo(() => {
    return {
      light: calculateCostForComplexity('light', selectedModality, selectedModel, modalityDetails, fxRate),
      medium: calculateCostForComplexity('medium', selectedModality, selectedModel, modalityDetails, fxRate),
      heavy: calculateCostForComplexity('heavy', selectedModality, selectedModel, modalityDetails, fxRate),
    };
  }, [calculateCostForComplexity, selectedModality, selectedModel, modalityDetails, fxRate]);

  // Budget Mode: Pre-calculate costs for all complexity levels (memoized)
  const budgetComplexityCosts = useMemo(() => {
    return {
      light: calculateCostForComplexity('light', budgetModality, budgetSelectedModel, budgetModalityDetails, fxRate),
      medium: calculateCostForComplexity('medium', budgetModality, budgetSelectedModel, budgetModalityDetails, fxRate),
      heavy: calculateCostForComplexity('heavy', budgetModality, budgetSelectedModel, budgetModalityDetails, fxRate),
    };
  }, [calculateCostForComplexity, budgetModality, budgetSelectedModel, budgetModalityDetails, fxRate]);

  // Volume Mode: Calculate cost per request based on modality, model, and complexity
  const costPerRequest = useMemo(() => {
    if (!modalityDetails || !selectedModel || !fxRate) return { usd: 0, idr: 0 };

    const complexityConfig = modalityDetails.defaultComplexity[selectedComplexity];
    let costUSD = 0;

    // Calculate based on modality type
    if (selectedModality === 'text-to-text' || selectedModality === 'image-to-text') {
      // Text-based: calculate from tokens
      const totalTokens = complexityConfig.value;
      // Assume 40% input, 60% output for text generation
      const inputTokens = Math.floor(totalTokens * 0.4);
      const outputTokens = Math.ceil(totalTokens * 0.6);

      const inputCost = (inputTokens / 1_000_000) * selectedModel.pricing.inputPerMToken;
      const outputCost = (outputTokens / 1_000_000) * selectedModel.pricing.outputPerMToken;
      costUSD = inputCost + outputCost + selectedModel.pricing.perRequest;
    } else if (selectedModality === 'text-to-image') {
      // Image generation: per image
      costUSD = selectedModel.pricing.perImage * complexityConfig.value + selectedModel.pricing.perRequest;
    } else if (selectedModality === 'text-to-video') {
      // Video generation: per second pricing (use official Google Cloud pricing if available)
      const actualPerSecondPrice = getActualPerSecondPricing(selectedModel);
      if (actualPerSecondPrice > 0) {
        costUSD = actualPerSecondPrice * complexityConfig.value + selectedModel.pricing.perRequest;
      } else if (selectedModel.pricing.inputPerMToken > 0 || selectedModel.pricing.outputPerMToken > 0) {
        // Fallback to token-based pricing
        const totalTokens = complexityConfig.value;
        const inputTokens = Math.floor(totalTokens * 0.4);
        const outputTokens = Math.ceil(totalTokens * 0.6);
        const inputCost = (inputTokens / 1_000_000) * selectedModel.pricing.inputPerMToken;
        const outputCost = (outputTokens / 1_000_000) * selectedModel.pricing.outputPerMToken;
        costUSD = inputCost + outputCost + selectedModel.pricing.perRequest;
      } else {
        costUSD = selectedModel.pricing.perRequest;
      }
    } else if (selectedModality === 'text-to-audio') {
      // TTS models: per character pricing (AIML API uses this)
      if (selectedModel.pricing.perCharacter && selectedModel.pricing.perCharacter > 0) {
        costUSD = selectedModel.pricing.perCharacter * complexityConfig.value + selectedModel.pricing.perRequest;
      } else if (selectedModel.pricing.inputPerMToken > 0 || selectedModel.pricing.outputPerMToken > 0) {
        // Fallback to token-based pricing
        const totalTokens = complexityConfig.value;
        const inputTokens = Math.floor(totalTokens * 0.4);
        const outputTokens = Math.ceil(totalTokens * 0.6);
        const inputCost = (inputTokens / 1_000_000) * selectedModel.pricing.inputPerMToken;
        const outputCost = (outputTokens / 1_000_000) * selectedModel.pricing.outputPerMToken;
        costUSD = inputCost + outputCost + selectedModel.pricing.perRequest;
      } else {
        costUSD = selectedModel.pricing.perRequest;
      }
    } else if (selectedModality === 'audio-to-text') {
      // STT models: per-second pricing (audio duration), token-based, or per-request
      if (selectedModel.pricing.perSecond && selectedModel.pricing.perSecond > 0) {
        // Most STT models (Whisper, Deepgram) charge per audio duration in seconds
        costUSD = selectedModel.pricing.perSecond * complexityConfig.value + selectedModel.pricing.perRequest;
      } else if (selectedModel.pricing.inputPerMToken > 0 || selectedModel.pricing.outputPerMToken > 0) {
        // Fallback to token-based pricing
        const totalTokens = complexityConfig.value;
        const inputTokens = Math.floor(totalTokens * 0.4);
        const outputTokens = Math.ceil(totalTokens * 0.6);
        const inputCost = (inputTokens / 1_000_000) * selectedModel.pricing.inputPerMToken;
        const outputCost = (outputTokens / 1_000_000) * selectedModel.pricing.outputPerMToken;
        costUSD = inputCost + outputCost + selectedModel.pricing.perRequest;
      } else {
        costUSD = selectedModel.pricing.perRequest;
      }
    }

    return {
      usd: costUSD,
      idr: costUSD * fxRate.rate,
    };
  }, [modalityDetails, selectedModel, selectedComplexity, fxRate, selectedModality]);

  // Fetch exchange rate
  useEffect(() => {
    const fetchRate = async () => {
      const rate = await getUsdToIdrRate();
      setFxRate(rate);
    };
    fetchRate();
  }, []);

  // Handle Budget Calculation (NEW - Using real pricing from models)
  const handleBudgetCalculate = () => {
    if (!fxRate || !budgetModalityDetails || !budgetSelectedModel) return;

    // Validation
    const validationErrors: string[] = [];
    if (!budgetIDR || budgetIDR <= 0) {
      validationErrors.push('Budget must be greater than 0');
    }
    if (budgetIDR > 1_000_000_000) {
      validationErrors.push('Budget seems unrealistically high (max Rp 1 billion)');
    }
    if (!periodMonths || periodMonths <= 0 || periodMonths > 24) {
      validationErrors.push('Period must be between 1 and 24 months');
    }
    if (growthRate < 0 || growthRate > 100) {
      validationErrors.push('Growth rate must be between 0% and 100%');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setBudgetResult(null);
      return;
    }

    setErrors([]);

    // Calculate monthly budget
    const monthlyBudgetIDR = budgetIDR / periodMonths;
    const monthlyBudgetUSD = monthlyBudgetIDR / fxRate.rate;

    // Calculate estimated volume per month based on cost per request
    const estimatedVolumePerMonth = Math.floor(monthlyBudgetUSD / budgetCostPerRequest.usd);

    // Calculate monthly breakdown with growth
    const monthlyBreakdown = [];
    let totalVolume = 0;

    for (let month = 1; month <= periodMonths; month++) {
      const monthVolume = Math.floor(
        estimatedVolumePerMonth * Math.pow(1 + growthRate / 100, month - 1)
      );

      totalVolume += monthVolume;

      monthlyBreakdown.push({
        month,
        budgetIDR: monthlyBudgetIDR,
        budgetUSD: monthlyBudgetUSD,
        estimatedVolume: monthVolume,
        costPerRequestUSD: budgetCostPerRequest.usd,
      });
    }

    const result: BudgetCalculationResult = {
      monthlyBudgetIDR,
      monthlyBudgetUSD,
      estimatedVolumePerMonth,
      totalVolumeOverPeriod: totalVolume,
      costPerRequest: budgetCostPerRequest,
      billingUnit: budgetModalityDetails.billingUnit,
      monthlyBreakdown,
    };

    setBudgetResult(result);
  };

  // Handle Volume Calculation (NEW - Modality-based)
  const handleVolumeCalculate = () => {
    if (!fxRate || !modalityDetails || !selectedModel) return;

    // Calculate monthly totals
    const monthlyRequests = apiCallsPerDay * 30;
    const monthlyCostUSD = monthlyRequests * costPerRequest.usd;
    const monthlyCostIDR = monthlyRequests * costPerRequest.idr;

    // Calculate with growth over time
    const monthlyBreakdown = [];
    let cumulativeRequests = 0;
    let cumulativeCostUSD = 0;
    let cumulativeCostIDR = 0;

    for (let month = 1; month <= volumePeriod; month++) {
      const growthMultiplier = Math.pow(1 + volumeGrowth / 100, month - 1);
      const monthRequests = Math.round(monthlyRequests * growthMultiplier);
      const monthCostUSD = monthRequests * costPerRequest.usd;
      const monthCostIDR = monthRequests * costPerRequest.idr;

      cumulativeRequests += monthRequests;
      cumulativeCostUSD += monthCostUSD;
      cumulativeCostIDR += monthCostIDR;

      monthlyBreakdown.push({
        month,
        users: Math.ceil(apiCallsPerDay * growthMultiplier / 5), // Estimate users (for display)
        requests: monthRequests,
        costUSD: monthCostUSD,
        costIDR: monthCostIDR,
      });
    }

    // Set result in compatible format
    const result: VolumeCalculationResult = {
      monthlyUsers: Math.ceil(apiCallsPerDay / 5),
      monthlyRequests: monthlyRequests,
      monthlyCostUSD: monthlyCostUSD,
      monthlyCostIDR: monthlyCostIDR,
      totalCostUSD: cumulativeCostUSD,
      totalCostIDR: cumulativeCostIDR,
      totalRequests: cumulativeRequests,
      costPerRequest: costPerRequest,
      costPerUser: {
        usd: costPerRequest.usd * 5, // Assuming 5 req/user/day
        idr: costPerRequest.idr * 5,
      },
      modelName: selectedModel.name,
      billingUnit: modalityDetails.billingUnit,
      monthlyBreakdown,
    };

    setVolumeResult(result);
    setErrors([]);
  };

  // Chart data for budget mode
  const budgetChartData = useMemo(() => {
    if (!budgetResult) return [];
    return budgetResult.monthlyBreakdown.map(month => ({
      month: `Month ${month.month}`,
      Volume: month.estimatedVolume,
      Budget: Math.round(month.budgetUSD),
    }));
  }, [budgetResult]);

  // Chart data for volume mode (NEW)
  const volumeChartData = useMemo(() => {
    if (!volumeResult) return [];
    return volumeResult.monthlyBreakdown.map(month => ({
      month: `Month ${month.month}`,
      Users: month.users,
      Requests: Math.round(month.requests / 1000), // Show in thousands
      'Cost (USD)': Math.round(month.costUSD),
    }));
  }, [volumeResult]);

  // Save budget simulation to dashboard
  const handleSaveBudget = () => {
    if (!appContext || !budgetResult || !budgetSelectedModel) return;

    appContext.addUsageLog({
      provider: 'openai' as any, // Generic provider for simulator
      model: budgetSelectedModel.name,
      inputTokens: 0, // Not applicable for simulator
      outputTokens: 0, // Not applicable for simulator
      costUSD: budgetResult.monthlyBudgetUSD * periodMonths,
      costIDR: budgetResult.monthlyBudgetIDR * periodMonths,
      type: 'simulator-budget',
      simulatorData: {
        mode: 'budget',
        modality: budgetModality,
        periodMonths: periodMonths,
        monthlyRequests: budgetResult.estimatedVolumePerMonth,
        totalRequests: budgetResult.totalVolumeOverPeriod,
      },
    });
    appContext.showToast('Budget simulation saved to dashboard successfully', 'success');
  };

  // Save volume simulation to dashboard
  const handleSaveVolume = () => {
    if (!appContext || !volumeResult || !selectedModel) return;

    appContext.addUsageLog({
      provider: 'openai' as any, // Generic provider for simulator
      model: selectedModel.name,
      inputTokens: 0, // Not applicable for simulator
      outputTokens: 0, // Not applicable for simulator
      costUSD: volumeResult.totalCostUSD,
      costIDR: volumeResult.totalCostIDR,
      type: 'simulator-volume',
      simulatorData: {
        mode: 'volume',
        modality: selectedModality,
        periodMonths: volumePeriod,
        monthlyRequests: volumeResult.monthlyRequests,
        totalRequests: volumeResult.totalRequests,
        apiCallsPerDay: apiCallsPerDay,
      },
    });
    appContext.showToast('Volume simulation saved to dashboard successfully', 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-1">AI Cost Simulator</h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Simulate your AI costs: Calculate volume from budget or estimate costs from usage
            </p>
          </div>
        </div>
      </Card>

      {/* Mode Tabs - Compact */}
      <Card className="p-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setMode('volume')}
            className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
              mode === 'volume'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Volume → Cost</span>
            </div>
          </button>
          <button
            onClick={() => setMode('budget')}
            className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
              mode === 'budget'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Budget → Volume</span>
            </div>
          </button>
        </div>
      </Card>

      {/* MODE 1: BUDGET → VOLUME */}
      {mode === 'budget' && (
        <>
          {/* STEP 1: Select AI Capability (Modality) */}
          <Card>
            <h2 className="text-lg font-semibold text-blue-900 mb-1">Step 1: What can the AI do?</h2>
            <p className="text-xs text-gray-600 mb-3">Select AI capability for budget estimation</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {AI_MODALITIES.map(modality => (
                <button
                  key={modality.id}
                  onClick={() => {
                    setBudgetModality(modality.id);
                    setBudgetModelName(''); // Reset model selection
                  }}
                  className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                    budgetModality === modality.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl">{modality.icon}</span>
                    {budgetModality === modality.id && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <h3 className="font-semibold text-blue-900 text-xs mb-0.5 leading-tight">{modality.name}</h3>
                  <p className="text-[10px] text-gray-600 leading-tight line-clamp-2">{modality.description}</p>
                </button>
              ))}
            </div>

            {/* Show examples for selected modality */}
            {budgetModalityDetails && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-[10px] font-medium text-blue-900 mb-1">💡 Examples:</p>
                <ul className="text-[10px] text-blue-700 space-y-0.5 grid sm:grid-cols-2 lg:grid-cols-3">
                  {budgetModalityDetails.examples.map((ex, i) => (
                    <li key={i} className="truncate">• {ex}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* STEP 2: Select AI Model */}
          <Card>
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Step 2: Choose AI Model</h2>
            <p className="text-sm text-gray-600 mb-2">
              Model affects pricing • Found {budgetAvailableModels.length} models
            </p>

            {/* Search Box */}
            {budgetAvailableModels.length > 10 && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="🔍 Search by name, provider, or description..."
                  value={budgetModelSearchQuery}
                  onChange={(e) => setBudgetModelSearchQuery(e.target.value)}
                  className="w-full rounded-lg border-2 border-blue-300 bg-white px-4 py-2 text-sm text-blue-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {budgetModelSearchQuery && (
                  <p className="text-xs text-gray-500 mt-1">
                    Showing {budgetFilteredModels.length} of {budgetAvailableModels.length} models
                  </p>
                )}
              </div>
            )}

            {isLoadingModels && (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading models...
              </div>
            )}

            {!isLoadingModels && budgetAvailableModels.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No models available for this modality yet. Try selecting a different modality.
              </div>
            )}

            {!isLoadingModels && budgetFilteredModels.length === 0 && budgetModelSearchQuery && (
              <div className="text-center py-8 text-gray-500">
                No models found matching "{budgetModelSearchQuery}". Try a different search term.
              </div>
            )}

            <div className="max-h-[800px] overflow-y-auto space-y-4">
              {Object.entries(budgetGroupedModels).map(([provider, providerModels]) => (
                <div key={provider}>
                  {/* Provider Header */}
                  <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1.5 rounded-md mb-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                      {provider} ({providerModels.length})
                    </h3>
                  </div>

                  {/* Models Grid - 2 columns on desktop */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    {providerModels.map(model => {
                      const isSelected = budgetModelName === model.name || (!budgetModelName && model === budgetAvailableModels[0]);

                      return (
                        <button
                          key={model.id}
                          onClick={() => setBudgetModelName(model.name)}
                          className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? 'border-green-500 bg-green-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="font-semibold text-gray-900 text-sm truncate">{model.name}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                                model.source === 'Artificial Analysis' ? 'bg-blue-100 text-blue-700' :
                                model.source === 'OpenRouter' ? 'bg-purple-100 text-purple-700' :
                                model.source === 'AIML API' ? 'bg-orange-100 text-orange-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {model.source === 'Artificial Analysis' ? 'AA' :
                                 model.source === 'OpenRouter' ? 'OR' :
                                 model.source === 'AIML API' ? 'AIML' :
                                 'HC'}
                              </span>
                            </div>
                            {isSelected && (
                              <svg className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="text-xs font-medium flex items-center gap-2 flex-wrap mt-1">
                            {/* Token-based pricing (text models) */}
                            {(model.pricing.inputPerMToken > 0 || model.pricing.outputPerMToken > 0) && (
                              <span className="text-blue-600">
                                ${model.pricing.inputPerMToken.toFixed(2)}/${model.pricing.outputPerMToken.toFixed(2)} per 1M tokens
                              </span>
                            )}

                            {/* Image-based pricing */}
                            {budgetModality === 'text-to-image' && model.pricing.perImage > 0 && (
                              <span className="text-blue-600">
                                ${model.pricing.perImage.toFixed(4)} per image
                              </span>
                            )}

                            {/* Video per-second pricing */}
                            {budgetModality === 'text-to-video' && (() => {
                              const actualPrice = getActualPerSecondPricing(model);
                              const isBlended = isBlendedPricing(model.id || '', model.source || '');
                              return actualPrice > 0 && (
                                <span className="text-blue-600">
                                  ${actualPrice.toFixed(3)} per second
                                  {isBlended && model.pricing.perSecond !== actualPrice && (
                                    <span className="text-xs text-orange-600 ml-1">
                                      (official)
                                    </span>
                                  )}
                                </span>
                              );
                            })()}

                            {/* TTS per-character pricing */}
                            {budgetModality === 'text-to-audio' && model.pricing.perCharacter && model.pricing.perCharacter > 0 && (
                              <span className="text-blue-600">
                                ${(model.pricing.perCharacter * 1000).toFixed(4)} per 1K chars
                              </span>
                            )}

                            {/* STT per-second pricing (audio duration) */}
                            {budgetModality === 'audio-to-text' && model.pricing.perSecond && model.pricing.perSecond > 0 && (
                              <span className="text-blue-600">
                                ${(model.pricing.perSecond * 60).toFixed(4)} per minute
                              </span>
                            )}

                            {/* Request-based pricing */}
                            {model.pricing.perRequest > 0 && (
                              <span className="text-purple-600">
                                + ${model.pricing.perRequest.toFixed(4)}/req
                              </span>
                            )}

                            {/* Free models */}
                            {model.isFree && (
                              <span className="text-green-600 font-semibold">✨ FREE</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* STEP 3: Select Request Complexity */}
          <Card>
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Step 3: Request Size/Complexity</h2>
            <p className="text-sm text-gray-600 mb-4">How large or complex is each request?</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['light', 'medium', 'heavy'].map(complexity => {
                const config = budgetModalityDetails?.defaultComplexity[complexity as ComplexityLevel];
                if (!config) return null;

                return (
                  <button
                    key={complexity}
                    onClick={() => setBudgetComplexity(complexity as ComplexityLevel)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      budgetComplexity === complexity
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 capitalize">{complexity}</span>
                      {budgetComplexity === complexity && (
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{config.description}</p>
                    <p className="text-sm font-bold text-purple-600">
                      ≈ Rp {Math.round(budgetComplexityCosts[complexity]).toLocaleString('id-ID')}/request
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* STEP 4: Budget & Time Configuration */}
          <Card>
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Step 4: Budget & Time Configuration</h2>

            <div className="space-y-6">
              {/* Budget Input */}
              <div>
                <label htmlFor="budgetIDR" className="mb-2 block text-sm font-medium text-blue-800">
                  💰 Total Budget (IDR)
                </label>
                <input
                  id="budgetIDR"
                  type="text"
                  inputMode="numeric"
                  value={budgetIDR.toLocaleString('id-ID')}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setBudgetIDR(parseInt(value, 10) || 0);
                  }}
                  className="w-full rounded-lg border-2 border-blue-300 bg-white px-4 py-2.5 text-sm text-blue-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-blue-400"
                  placeholder="e.g., 5.000.000"
                />
                <p className="mt-1 text-xs text-blue-600">
                  Default: Rp {BUSINESS_DEFAULTS.budgetIDR.toLocaleString('id-ID')} (typical SMB budget)
                </p>
              </div>

              {/* Period & Growth */}
              <div className="grid md:grid-cols-2 gap-4">
                <SliderInput
                  label="📅 Simulation Period"
                  value={periodMonths}
                  onChange={setPeriodMonths}
                  min={1}
                  max={12}
                  step={1}
                  unit="months"
                  helpText="Duration for budget projection"
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-blue-800">
                    📈 Expected Growth
                  </label>
                  <select
                    value={growthRate}
                    onChange={(e) => setGrowthRate(Number(e.target.value))}
                    className="w-full rounded-lg border-2 border-blue-300 bg-white px-4 py-2 text-sm text-blue-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value={0}>No Growth (0%)</option>
                    <option value={5}>Low Growth (~5%/month)</option>
                    <option value={15}>Medium Growth (~15%/month)</option>
                    <option value={30}>High Growth (~30%/month)</option>
                  </select>
                  <p className="mt-1 text-xs text-blue-600">
                    Usage growth over time
                  </p>
                </div>
              </div>

              {/* Quick Preview */}
              {fxRate && budgetSelectedModel && budgetModalityDetails && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">💰 Quick Preview</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-700">Cost per request:</p>
                      <p className="font-bold text-green-700">
                        Rp {Math.round(budgetCostPerRequest.idr).toLocaleString('id-ID')}
                        <span className="text-xs font-normal text-gray-600 ml-1">
                          (${budgetCostPerRequest.usd.toFixed(4)})
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700">Est. monthly volume:</p>
                      <p className="font-bold text-green-700">
                        {Math.floor((budgetIDR / periodMonths) / (budgetCostPerRequest.idr)).toLocaleString()} requests
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Calculate Button */}
            <Button
              onClick={handleBudgetCalculate}
              className="w-full mt-6"
              disabled={!fxRate || !budgetSelectedModel || !budgetModalityDetails}
            >
              💰 Calculate Volume from Budget
            </Button>
          </Card>

          {/* Error Display */}
          {errors.length > 0 && (
            <Card className="border-2 border-red-300 bg-red-50">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Validation Errors</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Results */}
          {budgetResult && (
            <>
              {/* Results Title */}
              <div className="mt-2 mb-2">
                <h2 className="text-2xl font-bold text-blue-900 mb-1">📊 Budget Allocation Results</h2>
                <p className="text-sm text-gray-600">What you can get with your budget</p>
              </div>

              {/* Results Summary */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
                <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-blue-200">
                  <h3 className="text-xl font-semibold text-blue-900">
                    💰 Budget Breakdown
                  </h3>
                  {budgetSelectedModel && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                      {budgetSelectedModel.name}
                    </span>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column - Budget Stats */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-blue-600 font-medium">Monthly Budget</p>
                      <p className="text-3xl font-bold mt-1 text-blue-900">Rp {budgetResult.monthlyBudgetIDR.toLocaleString('id-ID')}</p>
                      <p className="text-xs text-blue-600 mt-1">${budgetResult.monthlyBudgetUSD.toFixed(2)} USD</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                      <p className="text-xs uppercase tracking-wide text-blue-600 font-medium">Est. Monthly Volume</p>
                      <p className="text-3xl font-bold mt-1 text-blue-900">{budgetResult.estimatedVolumePerMonth.toLocaleString()}</p>
                      <p className="text-xs text-blue-600 mt-1">{budgetResult.billingUnit} per month</p>
                    </div>

                    <div className="rounded-lg p-4 border-2 shadow-md bg-white border-blue-200">
                      <p className="text-xs uppercase tracking-wide font-medium text-blue-600">
                        💰 Cost per Request
                      </p>
                      <p className="text-2xl font-bold mt-1 text-gray-900">
                        Rp {Math.round(budgetResult.costPerRequest.idr).toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-gray-600">${budgetResult.costPerRequest.usd.toFixed(6)}</p>
                    </div>
                  </div>

                  {/* Right Column - Total Summary */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
                      <p className="text-sm uppercase tracking-wide text-blue-100 font-medium">💰 Total Budget</p>
                      <p className="text-4xl font-bold mt-2">Rp {(budgetResult.monthlyBudgetIDR * periodMonths).toLocaleString('id-ID')}</p>
                      <p className="text-lg mt-1 text-blue-100">${(budgetResult.monthlyBudgetUSD * periodMonths).toFixed(2)} USD</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
                      <p className="text-sm uppercase tracking-wide text-green-100 font-medium">📊 Total Volume Over {periodMonths} Months</p>
                      <p className="text-4xl font-bold mt-2">{budgetResult.totalVolumeOverPeriod.toLocaleString()}</p>
                      <p className="text-lg mt-1 text-green-100">{budgetResult.billingUnit}</p>
                    </div>

                    <Button
                      variant="primary"
                      onClick={handleSaveBudget}
                      className="w-full"
                    >
                      💾 Save to Dashboard
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Chart */}
              <Card>
                <h2 className="text-xl font-semibold text-blue-900 mb-4">Volume Projection</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="month" stroke="#3b82f6" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#3b82f6" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '2px solid #3b82f6', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="Volume" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Monthly Breakdown Table */}
              <Card>
                <h2 className="text-xl font-semibold text-blue-900 mb-4">Monthly Breakdown</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-blue-200">
                        <th className="px-3 py-3 text-left text-xs font-semibold text-blue-900">Month</th>
                        <th className="px-3 py-3 text-right text-xs font-semibold text-blue-900">Budget (IDR)</th>
                        <th className="px-3 py-3 text-right text-xs font-semibold text-blue-900">Budget (USD)</th>
                        <th className="px-3 py-3 text-right text-xs font-semibold text-blue-900">Est. Volume</th>
                        <th className="px-3 py-3 text-right text-xs font-semibold text-blue-900">Cost/Request</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgetResult.monthlyBreakdown.map((month) => (
                        <tr key={month.month} className="border-b border-blue-100 hover:bg-blue-50">
                          <td className="px-3 py-3 font-medium text-blue-900">Month {month.month}</td>
                          <td className="px-3 py-3 text-right text-blue-800">Rp {month.budgetIDR.toLocaleString('id-ID')}</td>
                          <td className="px-3 py-3 text-right text-blue-800">${month.budgetUSD.toFixed(2)}</td>
                          <td className="px-3 py-3 text-right text-blue-900 font-semibold">{month.estimatedVolume.toLocaleString()}</td>
                          <td className="px-3 py-3 text-right text-blue-800">${month.costPerRequestUSD.toFixed(6)}</td>
                        </tr>
                      ))}
                      <tr className="bg-blue-100 font-bold">
                        <td className="px-3 py-3 text-blue-900">TOTAL</td>
                        <td className="px-3 py-3 text-right text-blue-900">Rp {(budgetResult.monthlyBudgetIDR * periodMonths).toLocaleString('id-ID')}</td>
                        <td className="px-3 py-3 text-right text-blue-900">${(budgetResult.monthlyBudgetUSD * periodMonths).toFixed(2)}</td>
                        <td className="px-3 py-3 text-right text-blue-900">{budgetResult.totalVolumeOverPeriod.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right text-blue-900">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </>
      )}

      {/* MODE 2: VOLUME → COST */}
      {mode === 'volume' && (
        <>

          {/* STEP 1: Select AI Capability (Modality) */}
          <Card>
            <h2 className="text-lg font-semibold text-blue-900 mb-1">Step 1: What can the AI do?</h2>
            <p className="text-xs text-gray-600 mb-3">Select AI capability</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {AI_MODALITIES.map(modality => (
                <button
                  key={modality.id}
                  onClick={() => {
                    setSelectedModality(modality.id);
                    setSelectedModelName(''); // Reset model selection
                  }}
                  className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                    selectedModality === modality.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl">{modality.icon}</span>
                    {selectedModality === modality.id && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <h3 className="font-semibold text-blue-900 text-xs mb-0.5 leading-tight">{modality.name}</h3>
                  <p className="text-[10px] text-gray-600 leading-tight line-clamp-2">{modality.description}</p>
                </button>
              ))}
            </div>

            {/* Show examples for selected modality */}
            {modalityDetails && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-[10px] font-medium text-blue-900 mb-1">💡 Examples:</p>
                <ul className="text-[10px] text-blue-700 space-y-0.5 grid sm:grid-cols-2 lg:grid-cols-3">
                  {modalityDetails.examples.map((ex, i) => (
                    <li key={i} className="truncate">• {ex}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* STEP 2: Select AI Model */}
          <Card>
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Step 2: Choose AI Model</h2>
            <p className="text-sm text-gray-600 mb-2">
              Select which model to use (affects pricing) • Found {availableModelsForModality.length} models
            </p>

            {/* Limited Availability Notices */}
            {availableModelsForModality.length <= 5 && (
              <div className="mb-3 p-2.5 bg-amber-50 border border-amber-300 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 flex-shrink-0">⚠️</span>
                  <div className="text-xs text-amber-900">
                    {selectedModality === 'text-to-image' && (
                      <>
                        <strong>Only {availableModelsForModality.length} image generation model(s) available.</strong> DALL-E, Midjourney, Stable Diffusion not in OpenRouter API.
                      </>
                    )}
                    {selectedModality === 'text-to-audio' && (
                      <>
                        <strong>No TTS models available.</strong> Use OpenAI TTS, Google Cloud TTS, or ElevenLabs.
                      </>
                    )}
                    {selectedModality === 'text-to-video' && (
                      <>
                        <strong>No video generation models available.</strong> Use Runway ML, Pika Labs, or Stable Video Diffusion.
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Search Box */}
            {availableModelsForModality.length > 10 && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="🔍 Search by name, provider, or description..."
                  value={modelSearchQuery}
                  onChange={(e) => setModelSearchQuery(e.target.value)}
                  className="w-full rounded-lg border-2 border-blue-300 bg-white px-4 py-2 text-sm text-blue-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {modelSearchQuery && (
                  <p className="text-xs text-gray-500 mt-1">
                    Showing {filteredModels.length} of {availableModelsForModality.length} models
                  </p>
                )}
              </div>
            )}

            {isLoadingModels && (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading models...
              </div>
            )}

            {!isLoadingModels && availableModelsForModality.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No models available for this modality yet. Try selecting a different modality.
              </div>
            )}

            {!isLoadingModels && filteredModels.length === 0 && modelSearchQuery && (
              <div className="text-center py-8 text-gray-500">
                No models found matching "{modelSearchQuery}". Try a different search term.
              </div>
            )}

            <div className="max-h-[800px] overflow-y-auto space-y-4">
              {Object.entries(groupedModels).map(([provider, providerModels]) => (
                <div key={provider}>
                  {/* Provider Header */}
                  <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1.5 rounded-md mb-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                      {provider} ({providerModels.length})
                    </h3>
                  </div>

                  {/* Models Grid - 2 columns on desktop */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    {providerModels.map(model => {
                      const isSelected = selectedModelName === model.name || (!selectedModelName && model === availableModelsForModality[0]);

                      return (
                        <button
                          key={model.id}
                          onClick={() => setSelectedModelName(model.name)}
                          className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? 'border-green-500 bg-green-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="font-semibold text-gray-900 text-sm truncate">{model.name}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                                model.source === 'Artificial Analysis' ? 'bg-blue-100 text-blue-700' :
                                model.source === 'OpenRouter' ? 'bg-purple-100 text-purple-700' :
                                model.source === 'AIML API' ? 'bg-orange-100 text-orange-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {model.source === 'Artificial Analysis' ? 'AA' :
                                 model.source === 'OpenRouter' ? 'OR' :
                                 model.source === 'AIML API' ? 'AIML' :
                                 'HC'}
                              </span>
                            </div>
                            {isSelected && (
                              <svg className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="text-xs font-medium flex items-center gap-2 flex-wrap mt-1">
                            {/* Token-based pricing (text, vision, audio, video) */}
                            {(model.pricing.inputPerMToken > 0 || model.pricing.outputPerMToken > 0) && (
                              <span className="text-blue-600">
                                ${model.pricing.inputPerMToken.toFixed(2)}/${model.pricing.outputPerMToken.toFixed(2)} per 1M tokens
                              </span>
                            )}

                            {/* Video per-second pricing */}
                            {selectedModality === 'text-to-video' && (() => {
                              const actualPrice = getActualPerSecondPricing(model);
                              const isBlended = isBlendedPricing(model.id || '', model.source || '');
                              return actualPrice > 0 && (
                                <span className="text-blue-600">
                                  ${actualPrice.toFixed(3)} per second
                                  {isBlended && model.pricing.perSecond !== actualPrice && (
                                    <span className="text-xs text-orange-600 ml-1">
                                      (official)
                                    </span>
                                  )}
                                </span>
                              );
                            })()}

                            {/* TTS per-character pricing */}
                            {selectedModality === 'text-to-audio' && model.pricing.perCharacter && model.pricing.perCharacter > 0 && (
                              <span className="text-blue-600">
                                ${(model.pricing.perCharacter * 1000).toFixed(4)} per 1K chars
                              </span>
                            )}

                            {/* STT per-second pricing (audio duration) */}
                            {selectedModality === 'audio-to-text' && model.pricing.perSecond && model.pricing.perSecond > 0 && (
                              <span className="text-blue-600">
                                ${(model.pricing.perSecond * 60).toFixed(4)} per minute
                              </span>
                            )}

                            {/* Image-based pricing */}
                            {selectedModality === 'text-to-image' && model.pricing.perImage > 0 && (
                              <span className="text-blue-600">
                                ${model.pricing.perImage.toFixed(4)} per image
                              </span>
                            )}

                            {/* Request-based pricing */}
                            {model.pricing.perRequest > 0 && (
                              <span className="text-purple-600">
                                + ${model.pricing.perRequest.toFixed(4)}/req
                              </span>
                            )}

                            {/* Free models */}
                            {model.isFree && (
                              <span className="text-green-600 font-semibold">✨ FREE</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* STEP 3: Select Request Complexity */}
          <Card>
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Step 3: Request Size/Complexity</h2>
            <p className="text-sm text-gray-600 mb-4">How large or complex is each request?</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['light', 'medium', 'heavy'] as ComplexityLevel[]).map(complexity => {
                const config = modalityDetails?.defaultComplexity[complexity];
                if (!config) return null;

                // Use pre-calculated memoized cost
                const complexityCost = complexityCosts[complexity];

                return (
                  <button
                    key={complexity}
                    onClick={() => setSelectedComplexity(complexity)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedComplexity === complexity
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 capitalize">{complexity}</span>
                      {selectedComplexity === complexity && (
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{config.description}</p>
                    <p className="text-sm font-bold text-purple-600">
                      ≈ Rp {Math.round(complexityCost).toLocaleString('id-ID')}/request
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* STEP 4: Volume & Time Configuration */}
          <Card>
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Step 4: Volume & Time Configuration</h2>

            <div className="space-y-6">
              {/* API Calls per Day */}
              <div>
                <label className="mb-2 block text-sm font-medium text-blue-800">
                  🔄 API Calls per Day
                </label>
                <SliderInput
                  label=""
                  value={apiCallsPerDay}
                  onChange={setApiCallsPerDay}
                  min={100}
                  max={100000}
                  step={100}
                  helpText={`≈ ${(apiCallsPerDay * 30).toLocaleString()} requests/month`}
                />
              </div>

              {/* Period & Growth - Side by Side */}
              <div className="grid md:grid-cols-2 gap-4">
                <SliderInput
                  label="📅 Simulation Period"
                  value={volumePeriod}
                  onChange={setVolumePeriod}
                  min={1}
                  max={12}
                  step={1}
                  unit="months"
                  helpText="Duration for cost projection"
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-blue-800">
                    📈 Expected Growth
                  </label>
                  <select
                    value={volumeGrowth}
                    onChange={(e) => setVolumeGrowth(Number(e.target.value))}
                    className="w-full rounded-lg border-2 border-blue-300 bg-white px-4 py-2 text-sm text-blue-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value={0}>No Growth (0%)</option>
                    <option value={5}>Low Growth (~5%/month)</option>
                    <option value={15}>Medium Growth (~15%/month)</option>
                    <option value={30}>High Growth (~30%/month)</option>
                  </select>
                  <p className="mt-1 text-xs text-blue-600">
                    Traffic growth over time
                  </p>
                </div>
              </div>

              {/* Real-time Cost Preview */}
              {fxRate && selectedModel && modalityDetails && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">💰 Quick Cost Preview</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-700">Cost per request:</p>
                      <p className="font-bold text-green-700">
                        Rp {Math.round(costPerRequest.idr).toLocaleString('id-ID')}
                        <span className="text-xs font-normal text-gray-600 ml-1">
                          (${costPerRequest.usd.toFixed(4)})
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700">Estimated monthly cost:</p>
                      <p className="font-bold text-green-700">
                        Rp {Math.round(apiCallsPerDay * 30 * costPerRequest.idr).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Calculate Button */}
            <Button
              onClick={handleVolumeCalculate}
              className="w-full mt-6"
              disabled={!fxRate || !selectedModel || !modalityDetails}
            >
              💰 Calculate Full Cost Estimate
            </Button>
          </Card>

          {/* Results Title */}
          {volumeResult && (
            <div className="mt-8 mb-2">
              <h2 className="text-2xl font-bold text-blue-900 mb-1">📊 Simulation Results</h2>
              <p className="text-sm text-gray-600">Detailed cost breakdown for your selected configuration</p>
            </div>
          )}

          {/* Results Summary */}
          {volumeResult && (
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-blue-200">
                <h3 className="text-xl font-semibold text-blue-900">
                  💰 Cost Estimate Summary
                </h3>
                {volumeResult.modelName && selectedModel && (
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      selectedModel.source === 'Artificial Analysis' ? 'bg-blue-100 text-blue-700' :
                      selectedModel.source === 'OpenRouter' ? 'bg-purple-100 text-purple-700' :
                      selectedModel.source === 'AIML API' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {selectedModel.source}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                      {volumeResult.modelName}
                    </span>
                  </div>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Volume Stats */}
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-blue-600 font-medium">API Calls per Day</p>
                    <p className="text-3xl font-bold mt-1 text-blue-900">{apiCallsPerDay.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 mt-1">≈ {Math.round(apiCallsPerDay / 1000 * 10) / 10}K calls/day</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-blue-600 font-medium">Monthly API Calls</p>
                    <p className="text-3xl font-bold mt-1 text-blue-900">{volumeResult.monthlyRequests.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 mt-1">{Math.round(volumeResult.monthlyRequests / 1000)}K calls total</p>
                  </div>

                  <div className="rounded-lg p-4 border-2 shadow-md bg-white border-blue-200">
                    <p className="text-xs uppercase tracking-wide font-medium text-blue-600">
                      💰 Cost per Request
                    </p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">
                      Rp {Math.round(volumeResult.costPerRequest.idr).toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-600">${Math.round(volumeResult.costPerRequest.usd * 1000) / 1000}</p>
                  </div>
                </div>

                {/* Right Column - Cost Summary */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
                    <p className="text-sm uppercase tracking-wide text-blue-100 font-medium">💰 Monthly Cost</p>
                    <p className="text-4xl font-bold mt-2">Rp {Math.round(volumeResult.monthlyCostIDR).toLocaleString('id-ID')}</p>
                    <p className="text-lg mt-1 text-blue-100">${Math.round(volumeResult.monthlyCostUSD).toLocaleString()} USD</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
                    <p className="text-sm uppercase tracking-wide text-green-100 font-medium">📊 Total Over {volumePeriod} Months</p>
                    <p className="text-4xl font-bold mt-2">Rp {Math.round(volumeResult.totalCostIDR).toLocaleString('id-ID')}</p>
                    <p className="text-lg mt-1 text-green-100">${Math.round(volumeResult.totalCostUSD).toLocaleString()} USD</p>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleSaveVolume}
                    className="w-full"
                  >
                    💾 Save to Dashboard
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Error Display */}
          {errors.length > 0 && (
            <Card className="border-2 border-red-300 bg-red-50">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Validation Errors</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Charts and Details */}
          {volumeResult && (
            <>
              <Card>
                <h2 className="text-xl font-semibold text-blue-900 mb-4">Cost Projection</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={volumeChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="month" stroke="#3b82f6" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#3b82f6" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '2px solid #3b82f6', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Cost (USD)" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Users" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <h2 className="text-xl font-semibold text-blue-900 mb-4">Monthly Breakdown</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-blue-200">
                        <th className="px-3 py-3 text-left text-xs font-semibold text-blue-900">Month</th>
                        <th className="px-3 py-3 text-right text-xs font-semibold text-blue-900">Users</th>
                        <th className="px-3 py-3 text-right text-xs font-semibold text-blue-900">Requests</th>
                        <th className="px-3 py-3 text-right text-xs font-semibold text-blue-900">Cost (USD)</th>
                        <th className="px-3 py-3 text-right text-xs font-semibold text-blue-900">Cost (IDR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volumeResult.monthlyBreakdown.map((month) => (
                        <tr key={month.month} className="border-b border-blue-100 hover:bg-blue-50">
                          <td className="px-3 py-3 font-medium text-blue-900">Month {month.month}</td>
                          <td className="px-3 py-3 text-right text-blue-800">{month.users.toLocaleString()}</td>
                          <td className="px-3 py-3 text-right text-blue-800">{month.requests.toLocaleString()}</td>
                          <td className="px-3 py-3 text-right text-blue-900 font-semibold">${Math.round(month.costUSD).toLocaleString()}</td>
                          <td className="px-3 py-3 text-right text-blue-900 font-semibold">Rp {Math.round(month.costIDR).toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                      <tr className="bg-blue-100 font-bold">
                        <td className="px-3 py-3 text-blue-900">TOTAL</td>
                        <td className="px-3 py-3 text-right text-blue-900">-</td>
                        <td className="px-3 py-3 text-right text-blue-900">{volumeResult.totalRequests.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right text-blue-900">${Math.round(volumeResult.totalCostUSD).toLocaleString()}</td>
                        <td className="px-3 py-3 text-right text-blue-900">Rp {Math.round(volumeResult.totalCostIDR).toLocaleString('id-ID')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Business Insights */}
              <Card className="border-2 border-green-300 bg-green-50">
                <h3 className="text-lg font-semibold text-green-900 mb-3">💡 Business Insights</h3>
                <div className="space-y-2 text-sm text-green-800">
                  <p>
                    ✅ <strong>Cost per API call:</strong> Rp {Math.round(volumeResult.costPerRequest.idr).toLocaleString('id-ID')}
                    {volumeResult.costPerRequest.idr < 50 && ' - Excellent! Very cost-effective'}
                    {volumeResult.costPerRequest.idr >= 50 && volumeResult.costPerRequest.idr < 200 && ' - Good, within industry standards'}
                    {volumeResult.costPerRequest.idr >= 200 && ' - Consider optimizing with a more cost-effective model'}
                  </p>
                  <p>
                    📈 <strong>Growth projection:</strong> By month {volumePeriod}, you'll process {volumeResult.monthlyBreakdown[volumePeriod - 1].requests.toLocaleString()} API calls
                    {volumeGrowth > 0 && ` (${volumeGrowth}% monthly growth)`}
                  </p>
                  <p>
                    💰 <strong>Budget planning:</strong> Allocate Rp {Math.round(volumeResult.monthlyCostIDR * 1.2).toLocaleString('id-ID')}/month (20% buffer for spikes)
                  </p>
                  {volumeResult.monthlyCostIDR > 7500000 && (
                    <p>
                      💡 <strong>Suggestion:</strong> For high-volume usage, consider negotiating enterprise pricing with your AI provider
                    </p>
                  )}
                  {apiCallsPerDay > 10000 && (
                    <p>
                      🚀 <strong>High volume detected:</strong> Consider implementing caching, request batching, or prompt optimization to reduce costs
                    </p>
                  )}
                </div>
              </Card>
            </>
          )}
        </>
      )}

      {/* Disclaimer */}
      <Card className="border-2 border-amber-300 bg-amber-50">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-amber-900">Accuracy & Data Sources</h3>
            <p className="mt-1 text-xs text-amber-800 leading-relaxed">
              <strong>Cost calculations</strong> use real-time pricing from <strong>4 pricing sources</strong>:
              Artificial Analysis (~50 LLMs with benchmarks),
              OpenRouter (324+ multimodal models from 60+ providers),
              AIML API (350+ models with +5% markup), and
              Helicone (1000+ community-verified models).
              Estimates are <strong>~95% accurate</strong> for typical usage patterns. Actual costs may vary based on:
              prompt complexity, caching, rate limits, provider changes, and markup differences. Always add 10-20% buffer for production planning.
            </p>
          </div>
        </div>
      </Card>

      {/* Cost Factors Notice */}
      <Card className="border-2 border-blue-300 bg-blue-50">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-2">⚠️ Factors That Can Affect Your Actual Costs</h3>
            <p className="text-xs text-blue-800 mb-2">The estimates above may differ from your actual costs due to several factors:</p>

            <div className="space-y-2 text-xs text-blue-800">
              <div>
                <strong className="text-green-700">💰 Factors That Can REDUCE Costs:</strong>
                <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                  <li><strong>Prompt Caching:</strong> Reusing system prompts can save 50-90% on input tokens (supported by Claude, Gemini, GPT-4)</li>
                  <li><strong>Batch API Processing:</strong> Up to 50% discount for non-time-sensitive requests (OpenAI, Anthropic offer batch APIs)</li>
                  <li><strong>Response Streaming:</strong> Early termination can reduce output tokens if you don't need full responses</li>
                  <li><strong>Prompt Engineering:</strong> Optimized, concise prompts reduce token usage significantly</li>
                  <li><strong>Model Fine-tuning:</strong> Custom models may need shorter prompts for same quality</li>
                  <li><strong>Smart Fallbacks:</strong> Use cheaper models for simple queries, expensive ones only when needed</li>
                  <li><strong>Output Limiting:</strong> Set max_tokens to prevent unnecessarily long responses</li>
                  <li><strong>Volume Discounts:</strong> Enterprise plans may offer 20-40% discounts for high-volume usage</li>
                </ul>
              </div>

              <div className="mt-2">
                <strong className="text-red-700">💸 Factors That Can INCREASE Costs:</strong>
                <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                  <li><strong>Rate Limit Retries:</strong> Failed requests due to rate limits may cause duplicate charges</li>
                  <li><strong>Provider Markup:</strong> Third-party APIs (OpenRouter, AIML API) add 5-30% markup vs. direct provider pricing</li>
                  <li><strong>Hidden Fees:</strong> Some providers charge extra for features like vision, function calling, or structured outputs</li>
                  <li><strong>Traffic Spikes:</strong> Unexpected viral growth or bot attacks can multiply costs overnight</li>
                  <li><strong>Inefficient Prompts:</strong> Verbose, redundant prompts waste tokens and increase costs</li>
                  <li><strong>Error Handling:</strong> Poor retry logic can cause same request to be charged multiple times</li>
                  <li><strong>Context Window Usage:</strong> Loading large contexts (PDFs, docs) uses many input tokens per request</li>
                  <li><strong>Regional Pricing:</strong> Some providers charge more in certain regions or currencies</li>
                  <li><strong>Real-time Requirements:</strong> Streaming, low-latency, or realtime API models often cost 2-3x more</li>
                </ul>
              </div>

              <div className="mt-2 p-2 bg-white rounded border border-blue-200">
                <strong className="text-blue-900">💡 Best Practice:</strong>
                <span className="ml-1">
                  Start with a <strong>20-30% cost buffer</strong> in your budget. Monitor actual usage for 1-2 months, then adjust.
                  Implement <strong>cost alerts</strong> at 50%, 75%, and 90% of your budget to avoid surprises.
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VolumeSimulatorPageV2;
