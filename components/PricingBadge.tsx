import React from 'react';

interface PricingBadgeProps {
  isBlendedPricing: boolean;
  officialPrice?: number;
  aimlPrice?: number;
  tooltip?: string;
}

/**
 * Badge component to indicate pricing confidence/type
 * Shows when pricing is blended/simplified vs official provider pricing
 */
export const PricingBadge: React.FC<PricingBadgeProps> = ({
  isBlendedPricing,
  officialPrice,
  aimlPrice,
  tooltip,
}) => {
  if (!isBlendedPricing) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-300"
        title={tooltip || 'Simplified aggregator pricing - actual provider pricing may differ'}
      >
        Blended Pricing
      </span>
      {officialPrice && aimlPrice && (
        <span
          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200"
          title={`Google Cloud official: $${officialPrice}/sec vs AIML API blended: $${aimlPrice}/sec`}
        >
          Official: ${officialPrice}/sec
        </span>
      )}
    </div>
  );
};

interface PricingTooltipProps {
  children: React.ReactNode;
  metadata?: {
    isBlendedPricing: boolean;
    officialPrice?: number;
    source: string;
    note?: string;
  };
}

/**
 * Wrapper component that shows pricing with tooltip
 */
export const PricingWithTooltip: React.FC<PricingTooltipProps> = ({
  children,
  metadata,
}) => {
  if (!metadata || !metadata.isBlendedPricing) {
    return <>{children}</>;
  }

  return (
    <div className="inline-flex items-center gap-1">
      {children}
      <span
        className="text-yellow-600 cursor-help"
        title={metadata.note || 'Blended pricing - see documentation for details'}
      >

      </span>
    </div>
  );
};
