import { FxRate } from '../types';
import { NormalizedModel } from './openRouterService';
import { UseCaseTemplate, BillingUnit } from '../constants/useCaseTemplates';

export interface VolumeCalculationInput {
  monthlyUsers: number;
  requestsPerUserPerDay: number;
  template: UseCaseTemplate;
  model?: NormalizedModel; // For text-based
  avgInputTokens?: number; // Override template default
  avgOutputTokens?: number; // Override template default
  fxRate: FxRate;
  periodMonths: number;
  growthRate: number; // percentage (0-100)
}

export interface VolumeCalculationResult {
  // Monthly stats (base month)
  monthlyUsers: number;
  monthlyRequests: number;
  monthlyTokensInput: number;
  monthlyTokensOutput: number;
  monthlyCostUSD: number;
  monthlyCostIDR: number;

  // Per-unit costs
  costPerUser: {
    usd: number;
    idr: number;
  };
  costPerRequest: {
    usd: number;
    idr: number;
  };

  // Total over period
  totalCostUSD: number;
  totalCostIDR: number;
  totalRequests: number;

  // Breakdown by month
  monthlyBreakdown: {
    month: number;
    users: number;
    requests: number;
    tokensInput?: number;
    tokensOutput?: number;
    costUSD: number;
    costIDR: number;
  }[];

  // Metadata
  billingUnit: BillingUnit;
  modelName?: string;
}

/**
 * Calculate cost from volume (users + requests)
 * This is the reverse of budget-to-volume calculation
 */
export const calculateCostFromVolume = (
  input: VolumeCalculationInput
): VolumeCalculationResult => {
  const {
    monthlyUsers,
    requestsPerUserPerDay,
    template,
    model,
    avgInputTokens,
    avgOutputTokens,
    fxRate,
    periodMonths,
    growthRate,
  } = input;

  // Calculate monthly requests (30 days average)
  const baseMonthlyRequests = monthlyUsers * requestsPerUserPerDay * 30;

  // Get token counts (use override if provided, else template defaults)
  const inputUnits = avgInputTokens ?? template.estimatedInputUnit;
  const outputUnits = avgOutputTokens ?? template.estimatedOutputUnit;

  // Calculate cost per request based on billing unit
  let costPerRequestUSD: number;

  if (template.customPricing) {
    // Custom pricing (image, audio, video)
    const { inputPricePerUnit, outputPricePerUnit } = template.customPricing;

    if (template.billingUnit === 'images') {
      costPerRequestUSD = outputPricePerUnit * outputUnits;
    } else if (template.billingUnit === 'characters') {
      const inputCost = (inputUnits / 1000) * inputPricePerUnit;
      const outputCost = (outputUnits / 1000) * outputPricePerUnit;
      costPerRequestUSD = inputCost + outputCost;
    } else if (template.billingUnit === 'seconds') {
      costPerRequestUSD = outputPricePerUnit * outputUnits;
    } else {
      costPerRequestUSD = 0;
    }
  } else if (model && template.billingUnit === 'tokens') {
    // Text-based: use model pricing from OpenRouter
    const inputCost = (inputUnits / 1_000_000) * model.pricing.inputPerMToken;
    const outputCost = (outputUnits / 1_000_000) * model.pricing.outputPerMToken;
    costPerRequestUSD = inputCost + outputCost;
  } else {
    throw new Error('Invalid template or model configuration');
  }

  // Calculate base month costs
  const baseMonthlyCostUSD = baseMonthlyRequests * costPerRequestUSD;
  const baseMonthlyCostIDR = baseMonthlyCostUSD * fxRate.rate;

  // Monthly breakdown with growth
  const monthlyBreakdown = [];
  let totalCostUSD = 0;
  let totalRequests = 0;

  for (let month = 1; month <= periodMonths; month++) {
    // Apply growth rate: users grow month-over-month
    const monthUsers = Math.floor(monthlyUsers * Math.pow(1 + growthRate / 100, month - 1));
    const monthRequests = monthUsers * requestsPerUserPerDay * 30;
    const monthCostUSD = monthRequests * costPerRequestUSD;
    const monthCostIDR = monthCostUSD * fxRate.rate;

    totalCostUSD += monthCostUSD;
    totalRequests += monthRequests;

    monthlyBreakdown.push({
      month,
      users: monthUsers,
      requests: monthRequests,
      tokensInput: template.billingUnit === 'tokens' ? monthRequests * inputUnits : undefined,
      tokensOutput: template.billingUnit === 'tokens' ? monthRequests * outputUnits : undefined,
      costUSD: monthCostUSD,
      costIDR: monthCostIDR,
    });
  }

  const totalCostIDR = totalCostUSD * fxRate.rate;

  return {
    // Base month stats
    monthlyUsers,
    monthlyRequests: baseMonthlyRequests,
    monthlyTokensInput: template.billingUnit === 'tokens' ? baseMonthlyRequests * inputUnits : 0,
    monthlyTokensOutput: template.billingUnit === 'tokens' ? baseMonthlyRequests * outputUnits : 0,
    monthlyCostUSD: baseMonthlyCostUSD,
    monthlyCostIDR: baseMonthlyCostIDR,

    // Per-unit costs
    costPerUser: {
      usd: baseMonthlyCostUSD / monthlyUsers,
      idr: (baseMonthlyCostUSD / monthlyUsers) * fxRate.rate,
    },
    costPerRequest: {
      usd: costPerRequestUSD,
      idr: costPerRequestUSD * fxRate.rate,
    },

    // Totals
    totalCostUSD,
    totalCostIDR,
    totalRequests,

    // Breakdown
    monthlyBreakdown,

    // Metadata
    billingUnit: template.billingUnit,
    modelName: model?.name,
  };
};

/**
 * Validate volume calculation input
 */
export const validateVolumeInput = (input: Partial<VolumeCalculationInput>): string[] => {
  const errors: string[] = [];

  if (!input.monthlyUsers || input.monthlyUsers <= 0) {
    errors.push('Monthly users must be greater than 0');
  }

  if (input.monthlyUsers && input.monthlyUsers > 10_000_000) {
    errors.push('Monthly users seems unrealistically high (max 10M)');
  }

  if (!input.requestsPerUserPerDay || input.requestsPerUserPerDay <= 0) {
    errors.push('Requests per user per day must be greater than 0');
  }

  if (input.requestsPerUserPerDay && input.requestsPerUserPerDay > 1000) {
    errors.push('Requests per user per day seems unrealistically high (max 1000)');
  }

  if (!input.template) {
    errors.push('Use case template is required');
  }

  if (input.template && input.template.billingUnit === 'tokens' && !input.model) {
    errors.push('Model is required for text-based use cases');
  }

  if (!input.fxRate) {
    errors.push('Exchange rate is required');
  }

  if (!input.periodMonths || input.periodMonths <= 0 || input.periodMonths > 24) {
    errors.push('Period must be between 1 and 24 months');
  }

  if (input.growthRate !== undefined && (input.growthRate < 0 || input.growthRate > 100)) {
    errors.push('Growth rate must be between 0% and 100%');
  }

  return errors;
};

/**
 * Get recommended model based on use case and budget constraints
 */
export const getRecommendedModel = (
  models: NormalizedModel[],
  template: UseCaseTemplate,
  budgetTier: 'economy' | 'balanced' | 'premium'
): NormalizedModel | null => {
  // Filter text/multimodal models for token-based templates
  const eligibleModels = models.filter(
    m => (m.category === 'text' || m.category === 'multimodal') && !m.isFree
  );

  if (eligibleModels.length === 0) return null;

  // Sort by cost (average of input + output)
  const sortedByPrice = eligibleModels.sort((a, b) => {
    const avgA = (a.pricing.inputPerMToken + a.pricing.outputPerMToken) / 2;
    const avgB = (b.pricing.inputPerMToken + b.pricing.outputPerMToken) / 2;
    return avgA - avgB;
  });

  // Select based on tier
  if (budgetTier === 'economy') {
    // Cheapest model
    return sortedByPrice[0];
  } else if (budgetTier === 'balanced') {
    // Mid-range model
    const midIndex = Math.floor(sortedByPrice.length / 3);
    return sortedByPrice[midIndex];
  } else {
    // Premium: prefer specific high-quality models
    const premiumModels = sortedByPrice.filter(m =>
      m.id.includes('gpt-4o') ||
      m.id.includes('claude-3.5-sonnet') ||
      m.id.includes('claude-3-opus')
    );
    return premiumModels.length > 0 ? premiumModels[0] : sortedByPrice[sortedByPrice.length - 1];
  }
};
