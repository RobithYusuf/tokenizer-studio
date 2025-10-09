import React from 'react';

type ComplexityLevel = 'light' | 'medium' | 'heavy';

interface ComplexityOption {
  value: number;
  description: string;
  label: string;
}

interface ComplexitySelectorProps {
  selectedComplexity: ComplexityLevel;
  onComplexityChange: (complexity: ComplexityLevel) => void;
  complexityOptions: Record<ComplexityLevel, ComplexityOption>;
  complexityCosts?: Record<ComplexityLevel, number>;
  currency?: 'IDR' | 'USD';
}

const ComplexitySelector: React.FC<ComplexitySelectorProps> = ({
  selectedComplexity,
  onComplexityChange,
  complexityOptions,
  complexityCosts,
  currency = 'IDR',
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {(['light', 'medium', 'heavy'] as const).map((complexity) => {
        const config = complexityOptions[complexity];
        if (!config) return null;

        const cost = complexityCosts?.[complexity];

        return (
          <button
            key={complexity}
            onClick={() => onComplexityChange(complexity)}
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
            {cost !== undefined && cost > 0 && (
              <p className="text-sm font-bold text-purple-600">
                ≈ {currency === 'IDR' ? 'Rp' : '$'} {Math.round(cost).toLocaleString(currency === 'IDR' ? 'id-ID' : 'en-US')}/request
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ComplexitySelector;
