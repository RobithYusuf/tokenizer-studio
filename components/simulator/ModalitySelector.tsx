import React from 'react';
import { AI_MODALITIES, AIModality } from '../../constants/modalities';

interface ModalitySelectorProps {
  selectedModality: AIModality;
  onModalityChange: (modality: AIModality) => void;
  modalityDetails?: {
    name: string;
    description: string;
    examples: string[];
  };
}

const ModalitySelector: React.FC<ModalitySelectorProps> = ({
  selectedModality,
  onModalityChange,
  modalityDetails,
}) => {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {AI_MODALITIES.map(modality => (
          <button
            key={modality.id}
            onClick={() => onModalityChange(modality.id)}
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
          <p className="text-[10px] text-blue-700 leading-relaxed">
            {modalityDetails.examples.join(' • ')}
          </p>
        </div>
      )}
    </>
  );
};

export default ModalitySelector;
