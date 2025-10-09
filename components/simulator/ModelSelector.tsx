import React, { useState } from 'react';
import Card from '../Card';

interface Model {
  id: string;
  name: string;
  provider: string;
  source: string;
  pricing: {
    inputPerMToken: number;
    outputPerMToken: number;
    perRequest: number;
    perImage?: number;
    perSecond?: number;
    perCharacter?: number;
  };
}

interface ModelSelectorProps {
  models: Model[];
  groupedModels: Record<string, Model[]>;
  selectedModelName: string;
  searchQuery: string;
  onModelChange: (modelName: string) => void;
  onSearchChange: (query: string) => void;
  modalityName?: string;
  className?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  groupedModels,
  selectedModelName,
  searchQuery,
  onModelChange,
  onSearchChange,
  modalityName = 'models',
  className = '',
}) => {
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());

  const toggleProvider = (provider: string) => {
    const newExpanded = new Set(expandedProviders);
    if (newExpanded.has(provider)) {
      newExpanded.delete(provider);
    } else {
      newExpanded.add(provider);
    }
    setExpandedProviders(newExpanded);
  };

  const formatPrice = (model: Model): string => {
    if (model.pricing.inputPerMToken > 0 || model.pricing.outputPerMToken > 0) {
      return `$${model.pricing.inputPerMToken.toFixed(2)}/$${model.pricing.outputPerMToken.toFixed(2)} per 1M tokens`;
    } else if (model.pricing.perImage && model.pricing.perImage > 0) {
      return `$${model.pricing.perImage.toFixed(4)}/image`;
    } else if (model.pricing.perSecond && model.pricing.perSecond > 0) {
      return `$${model.pricing.perSecond.toFixed(4)}/sec`;
    } else if (model.pricing.perCharacter && model.pricing.perCharacter > 0) {
      return `$${(model.pricing.perCharacter * 1000).toFixed(4)}/1K chars`;
    } else if (model.pricing.perRequest > 0) {
      return `$${model.pricing.perRequest.toFixed(4)}/request`;
    }
    return 'FREE';
  };

  const getSourceBadge = (source: string): { text: string; color: string } => {
    switch (source) {
      case 'artificial-analysis':
        return { text: 'AA', color: 'bg-purple-100 text-purple-700' };
      case 'openrouter':
        return { text: 'OR', color: 'bg-blue-100 text-blue-700' };
      case 'aiml-api':
        return { text: 'AIML', color: 'bg-green-100 text-green-700' };
      case 'helicone':
        return { text: 'HC', color: 'bg-orange-100 text-orange-700' };
      default:
        return { text: source.substring(0, 2).toUpperCase(), color: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-blue-900">Step 2: Choose AI Model</h2>
          <p className="text-xs text-gray-600">Model affects pricing • Found {models.length} {modalityName}</p>
        </div>
        <div className="flex-1 max-w-xs ml-4">
          <input
            type="text"
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {Object.entries(groupedModels).map(([provider, providerModels]) => (
          <div key={provider} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleProvider(provider)}
              className="w-full px-3 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors"
            >
              <span className="font-medium text-sm text-gray-900">
                {provider} ({providerModels.length})
              </span>
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  expandedProviders.has(provider) ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedProviders.has(provider) && (
              <div className="p-2 space-y-1">
                {providerModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => onModelChange(model.name)}
                    className={`w-full p-2.5 rounded-lg border-2 text-left transition-all ${
                      selectedModelName === model.name
                        ? 'border-green-500 bg-green-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900 truncate">
                            {model.provider}: {model.name}
                          </span>
                          <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${getSourceBadge(model.source).color}`}>
                            {getSourceBadge(model.source).text}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{formatPrice(model)}</p>
                        {model.pricing.perRequest > 0 && (
                          <p className="text-[10px] text-gray-500">+ ${model.pricing.perRequest.toFixed(4)}/req</p>
                        )}
                      </div>
                      {selectedModelName === model.name && (
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {models.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <p className="text-sm">No models found for this modality</p>
          <p className="text-xs mt-1">Try selecting a different AI capability</p>
        </div>
      )}
    </Card>
  );
};

export default ModelSelector;
