import { FxRate } from '../types';
import { NormalizedModel } from './openRouterService';
import { UseCaseTemplate, BillingUnit } from '../constants/useCaseTemplates';

export interface BudgetCalculationInput {
  budgetIDR: number;
  template: UseCaseTemplate;
  model?: NormalizedModel; // For text-based (from OpenRouter), optional for custom pricing
  fxRate: FxRate;
  periodMonths: number;
  growthRate: number; // percentage (0-100)
}

export interface BudgetCalculationResult {
  monthlyBudgetIDR: number;
  monthlyBudgetUSD: number;
  estimatedVolumePerMonth: number;
  totalVolumeOverPeriod: number;
  costPerRequest: {
    usd: number;
    idr: number;
  };
  billingUnit: BillingUnit;
  monthlyBreakdown: {
    month: number;
    budgetIDR: number;
    budgetUSD: number;
    estimatedVolume: number;
    costPerRequestUSD: number;
  }[];
}

/**
 * Calculate how many requests a user can make given a budget
 * This is the reverse of volume-to-cost calculation
 */
export const calculateFromBudget = (
  input: BudgetCalculationInput
): BudgetCalculationResult => {
  const { budgetIDR, template, model, fxRate, periodMonths, growthRate } = input;

  // Calculate monthly budget
  const monthlyBudgetIDR = budgetIDR / periodMonths;
  const monthlyBudgetUSD = monthlyBudgetIDR / fxRate.rate;

  // Calculate cost per request based on billing unit
  let costPerRequestUSD: number;

  if (template.customPricing) {
    // Custom pricing (image, audio, video)
    const { inputPricePerUnit, outputPricePerUnit } = template.customPricing;

    // Calculate based on billing unit
    if (template.billingUnit === 'images') {
      // Images: simple per-unit pricing
      costPerRequestUSD = outputPricePerUnit * template.estimatedOutputUnit;
    } else if (template.billingUnit === 'characters') {
      // Characters: pricing per 1000 characters
      const inputCost = (template.estimatedInputUnit / 1000) * inputPricePerUnit;
      const outputCost = (template.estimatedOutputUnit / 1000) * outputPricePerUnit;
      costPerRequestUSD = inputCost + outputCost;
    } else if (template.billingUnit === 'seconds') {
      // Seconds: pricing per second
      costPerRequestUSD = outputPricePerUnit * template.estimatedOutputUnit;
    } else {
      costPerRequestUSD = 0;
    }
  } else if (model && template.billingUnit === 'tokens') {
    // Text-based: use model pricing from OpenRouter
    const inputCost = (template.estimatedInputUnit / 1_000_000) * model.pricing.inputPerMToken;
    const outputCost = (template.estimatedOutputUnit / 1_000_000) * model.pricing.outputPerMToken;
    costPerRequestUSD = inputCost + outputCost;
  } else {
    throw new Error('Invalid template or model configuration');
  }

  // Calculate volume that fits in budget
  const estimatedVolumePerMonth = Math.floor(monthlyBudgetUSD / costPerRequestUSD);

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
      costPerRequestUSD,
    });
  }

  return {
    monthlyBudgetIDR,
    monthlyBudgetUSD,
    estimatedVolumePerMonth,
    totalVolumeOverPeriod: totalVolume,
    costPerRequest: {
      usd: costPerRequestUSD,
      idr: costPerRequestUSD * fxRate.rate,
    },
    billingUnit: template.billingUnit,
    monthlyBreakdown,
  };
};

/**
 * Validate budget calculation input
 */
export const validateBudgetInput = (input: Partial<BudgetCalculationInput>): string[] => {
  const errors: string[] = [];

  if (!input.budgetIDR || input.budgetIDR <= 0) {
    errors.push('Budget must be greater than 0');
  }

  if (input.budgetIDR && input.budgetIDR > 1_000_000_000) {
    errors.push('Budget seems unrealistically high (max Rp 1 billion)');
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
