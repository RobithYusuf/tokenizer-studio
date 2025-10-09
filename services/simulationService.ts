import { Model, FxRate } from '../types';

export interface SimulationInput {
  model: Model;
  baseInputTokens: number;
  baseOutputTokens: number;
  volumePerMonth: number;
  periodMonths: number;
  growthRate: number; // percentage per month (0-100)
  useBusinessDefaults: boolean;
}

export interface MonthlyResult {
  month: number;
  volume: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  inputCostUSD: number;
  outputCostUSD: number;
  totalCostUSD: number;
  inputCostIDR: number;
  outputCostIDR: number;
  totalCostIDR: number;
}

export interface SimulationResult {
  monthlyBreakdown: MonthlyResult[];
  summary: {
    totalVolume: number;
    totalCostUSD: number;
    totalCostIDR: number;
    avgCostPerRequestUSD: number;
    avgCostPerRequestIDR: number;
    avgMonthlyVolumeGrowth: number;
  };
}

// Business defaults based on industry averages
export const BUSINESS_DEFAULTS = {
  volumePerMonth: 5000, // Average small-medium business API usage
  periodMonths: 3,
  growthRate: 15, // 15% monthly growth is typical for growing SaaS
};

/**
 * Simulate volume-based cost over multiple months
 * Provides accurate cost projection with optional growth rate
 */
export const simulateVolumeCost = (
  input: SimulationInput,
  fxRate: FxRate
): SimulationResult => {
  const monthlyBreakdown: MonthlyResult[] = [];
  let totalVolume = 0;
  let totalCostUSD = 0;
  let totalCostIDR = 0;

  for (let month = 1; month <= input.periodMonths; month++) {
    // Calculate volume with growth rate (compound growth)
    const monthVolume = Math.round(
      input.volumePerMonth * Math.pow(1 + input.growthRate / 100, month - 1)
    );

    // Calculate total tokens for this month's volume
    const totalInputTokens = input.baseInputTokens * monthVolume;
    const totalOutputTokens = input.baseOutputTokens * monthVolume;

    // Calculate costs in USD (per million tokens)
    const inputCostUSD = (totalInputTokens / 1_000_000) * input.model.input_per_mtok_usd;
    const outputCostUSD = (totalOutputTokens / 1_000_000) * input.model.output_per_mtok_usd;
    const monthTotalCostUSD = inputCostUSD + outputCostUSD;

    // Convert to IDR
    const inputCostIDR = Math.round(inputCostUSD * fxRate.rate);
    const outputCostIDR = Math.round(outputCostUSD * fxRate.rate);
    const monthTotalCostIDR = Math.round(monthTotalCostUSD * fxRate.rate);

    // Accumulate totals
    totalVolume += monthVolume;
    totalCostUSD += monthTotalCostUSD;
    totalCostIDR += monthTotalCostIDR;

    monthlyBreakdown.push({
      month,
      volume: monthVolume,
      totalInputTokens,
      totalOutputTokens,
      inputCostUSD,
      outputCostUSD,
      totalCostUSD: monthTotalCostUSD,
      inputCostIDR,
      outputCostIDR,
      totalCostIDR: monthTotalCostIDR,
    });
  }

  // Calculate summary statistics
  const avgCostPerRequestUSD = totalCostUSD / totalVolume;
  const avgCostPerRequestIDR = totalCostIDR / totalVolume;

  // Calculate average volume growth (if period > 1)
  let avgMonthlyVolumeGrowth = 0;
  if (input.periodMonths > 1) {
    const firstMonthVolume = monthlyBreakdown[0].volume;
    const lastMonthVolume = monthlyBreakdown[input.periodMonths - 1].volume;
    avgMonthlyVolumeGrowth = ((lastMonthVolume - firstMonthVolume) / firstMonthVolume) * 100;
  }

  return {
    monthlyBreakdown,
    summary: {
      totalVolume,
      totalCostUSD,
      totalCostIDR,
      avgCostPerRequestUSD,
      avgCostPerRequestIDR,
      avgMonthlyVolumeGrowth,
    },
  };
};

/**
 * Validate simulation input to ensure accuracy
 */
export const validateSimulationInput = (input: Partial<SimulationInput>): string[] => {
  const errors: string[] = [];

  if (!input.model) {
    errors.push('Model is required');
  }

  if (!input.baseInputTokens || input.baseInputTokens <= 0) {
    errors.push('Base input tokens must be greater than 0');
  }

  if (!input.baseOutputTokens || input.baseOutputTokens <= 0) {
    errors.push('Base output tokens must be greater than 0');
  }

  if (!input.volumePerMonth || input.volumePerMonth <= 0) {
    errors.push('Volume per month must be greater than 0');
  }

  if (input.volumePerMonth && input.volumePerMonth > 10_000_000) {
    errors.push('Volume per month seems unrealistically high (max 10M)');
  }

  if (!input.periodMonths || input.periodMonths <= 0 || input.periodMonths > 24) {
    errors.push('Period must be between 1 and 24 months');
  }

  if (input.growthRate !== undefined && (input.growthRate < 0 || input.growthRate > 100)) {
    errors.push('Growth rate must be between 0% and 100%');
  }

  return errors;
};
