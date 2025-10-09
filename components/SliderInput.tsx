import React from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  helpText?: string;
  formatValue?: (value: number) => string;
  marks?: { [key: number]: string };
}

const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  helpText,
  formatValue,
  marks,
}) => {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const displayValue = formatValue ? formatValue(localValue) : localValue.toLocaleString();

  // Generate mark positions - show more detailed marks (memoized to prevent re-calculation)
  const markPositions = React.useMemo(() => {
    if (marks) {
      return Object.keys(marks).map(Number);
    }

    const range = max - min;
    // For small ranges (like 1-12 or 0-50), show more marks
    if (range <= 12) {
      // Show every value for very small ranges
      return Array.from({ length: range + 1 }, (_, i) => min + i);
    } else if (range <= 100) {
      // Show ~10 marks for medium ranges
      const markStep = Math.ceil(range / 10);
      const positions = [];
      for (let i = min; i <= max; i += markStep) {
        positions.push(i);
      }
      if (positions[positions.length - 1] !== max) positions.push(max);
      return positions;
    } else {
      // Show ~8 marks for large ranges
      const markStep = Math.ceil(range / 8);
      const positions = [];
      for (let i = min; i <= max; i += markStep) {
        positions.push(i);
      }
      if (positions[positions.length - 1] !== max) positions.push(max);
      return positions;
    }
  }, [min, max, marks]);

  const getMarkLabel = React.useCallback((markValue: number): string => {
    if (marks && marks[markValue]) return marks[markValue];
    if (markValue >= 1000000) return `${(markValue / 1000000).toFixed(1)}M`;
    if (markValue >= 1000) return `${(markValue / 1000).toFixed(0)}K`;
    return markValue.toString();
  }, [marks]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-blue-800">{label}</label>
        <span className="text-base font-semibold text-blue-900">
          {displayValue}
          {unit && <span className="text-sm text-blue-700 ml-1">{unit}</span>}
        </span>
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onInput={(e) => setLocalValue(Number((e.target as HTMLInputElement).value))}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full cursor-pointer"
        />
        {markPositions && markPositions.length > 0 && (
          <div className="flex justify-between text-xs text-blue-600">
            {markPositions.map((markValue) => (
              <span key={`mark-${markValue}`} className="select-none">
                {getMarkLabel(markValue)}
              </span>
            ))}
          </div>
        )}
      </div>

      {helpText && (
        <p className="text-xs text-blue-600 italic">{helpText}</p>
      )}
    </div>
  );
};

export default SliderInput;
