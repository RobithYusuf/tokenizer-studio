import React, { useState, useEffect, useMemo, useCallback, useContext, useRef } from 'react';
import { Provider, FxRate } from '../types';
import { PROVIDERS, DEFAULT_INPUT_TEXT } from '../constants';
import { getUsdToIdrRate } from '../services/pricingService';
import { countTokens } from '../services/tokenService';
import Dropdown from '../components/Dropdown';
import Textarea from '../components/Textarea';
import Card from '../components/Card';
import Button from '../components/Button';
import TokenBreakdown from '../components/TokenBreakdown';
import ConfirmModal from '../components/ConfirmModal';
import { AppContext } from '../App';

const EstimatorPage: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<Provider>(Provider.OpenAI);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [inputText, setInputText] = useState<string>(DEFAULT_INPUT_TEXT);
  const [inputTokens, setInputTokens] = useState<number>(0);
  const [outputTokens, setOutputTokens] = useState<number>(2000);
  const [fxRate, setFxRate] = useState<FxRate | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [inputMode, setInputMode] = useState<'text' | 'token'>('text');
  const [manualInputTokens, setManualInputTokens] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const appContext = useContext(AppContext);
  const { models, isLoadingModels } = appContext!;

  const availableModels = useMemo(() => models.filter(m => m.provider === selectedProvider), [models, selectedProvider]);
  const selectedModel = useMemo(() => models.find(m => m.id === selectedModelId), [models, selectedModelId]);

  useEffect(() => {
    if (!isLoadingModels && availableModels.length > 0) {
      if (!availableModels.some(m => m.id === selectedModelId)) {
        setSelectedModelId(availableModels[0].id);
      }
    }
  }, [availableModels, isLoadingModels, selectedModelId]);

  useEffect(() => {
    const fetchRate = async () => {
      const rate = await getUsdToIdrRate();
      setFxRate(rate);
    };
    fetchRate();
  }, []);

  const calculateTokens = useCallback(async () => {
    if (inputMode === 'token') {
      setInputTokens(manualInputTokens);
      return;
    }
    if (!inputText || !selectedProvider) return;
    setIsCalculating(true);
    try {
      const tokens = await countTokens(selectedProvider, inputText);
      setInputTokens(tokens);
    } catch (error) {
      console.error('Token calculation failed:', error);
      setInputTokens(0);
    } finally {
      setIsCalculating(false);
    }
  }, [inputText, selectedProvider, inputMode, manualInputTokens]);

  useEffect(() => {
    if (inputMode === 'token') {
      setInputTokens(manualInputTokens);
      return;
    }
    const handler = setTimeout(() => {
      calculateTokens();
    }, 500);
    return () => clearTimeout(handler);
  }, [calculateTokens, inputMode, manualInputTokens]);

  const costCalculation = useMemo(() => {
    if (!selectedModel || !fxRate) {
      return {
        inputCostUSD: 0,
        outputCostUSD: 0,
        totalCostUSD: 0,
        inputCostIDR: 0,
        outputCostIDR: 0,
        totalCostIDR: 0
      };
    }

    const inputCostUSD = (inputTokens / 1_000_000) * selectedModel.input_per_mtok_usd;
    const outputCostUSD = (outputTokens / 1_000_000) * selectedModel.output_per_mtok_usd;
    const totalCostUSD = inputCostUSD + outputCostUSD;

    const inputCostIDR = Math.round(inputCostUSD * fxRate.rate);
    const outputCostIDR = Math.round(outputCostUSD * fxRate.rate);
    const totalCostIDR = Math.round(totalCostUSD * fxRate.rate);

    return {
      inputCostUSD,
      outputCostUSD,
      totalCostUSD,
      inputCostIDR,
      outputCostIDR,
      totalCostIDR
    };
  }, [inputTokens, outputTokens, selectedModel, fxRate]);

  const handleLogUsage = () => {
    if (!appContext || !selectedModel || inputTokens === 0 || costCalculation.totalCostUSD === 0) return;
    setIsModalOpen(true);
  };

  const confirmLogUsage = () => {
    if (!appContext || !selectedModel) return;
    appContext.addUsageLog({
      provider: selectedProvider,
      model: selectedModel.name,
      inputTokens: inputTokens,
      outputTokens: outputTokens,
      costUSD: costCalculation.totalCostUSD,
      costIDR: costCalculation.totalCostIDR,
      inputText: inputText,
    });
    appContext.showToast('Estimate saved to dashboard successfully', 'success');
    setIsModalOpen(false);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      alert('Failed to paste from clipboard. Please check browser permissions.');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inputText);
      alert('Text copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputText(text);
    };
    reader.onerror = () => {
      alert('Failed to read file.');
    };
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-2 relative z-[60]">
        <Card className="overflow-visible">
          <Dropdown
            label="Provider"
            value={selectedProvider}
            options={PROVIDERS.map(p => ({ value: p.id, label: p.name }))}
            onChange={(value) => setSelectedProvider(value as Provider)}
            disabled={isLoadingModels}
            placeholder="Select a provider"
          />
        </Card>
        <Card className="overflow-visible">
          <Dropdown
            label="Model"
            value={selectedModelId}
            options={
              isLoadingModels
                ? [{ value: '', label: 'Loading models...' }]
                : availableModels.map(m => ({ value: m.id, label: m.name }))
            }
            onChange={setSelectedModelId}
            disabled={isLoadingModels || !availableModels.length}
            placeholder="Select a model"
          />
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <label className="block text-sm font-medium text-blue-800">
                    {inputMode === 'text' ? 'Input text' : 'Input tokens'}
                  </label>
                  <button
                    onClick={() => setInputMode(inputMode === 'text' ? 'token' : 'text')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      inputMode === 'token' ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    title={`Switch to ${inputMode === 'text' ? 'token' : 'text'} input mode`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        inputMode === 'token' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-xs text-blue-700">
                    {inputMode === 'text' ? 'Text mode' : 'Token mode'}
                  </span>
                </div>
                {inputMode === 'text' && (
                  <div className="flex gap-2">
                    <button
                      onClick={handlePasteFromClipboard}
                      disabled={isLoadingModels}
                      className="flex items-center gap-1 rounded-lg bg-blue-100 px-2 sm:px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-200 disabled:opacity-50"
                      title="Paste from clipboard"
                    >
                      <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="hidden sm:inline">Paste</span>
                    </button>
                    <button
                      onClick={handleCopyToClipboard}
                      disabled={isLoadingModels || !inputText}
                      className="flex items-center gap-1 rounded-lg bg-blue-100 px-2 sm:px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-200 disabled:opacity-50"
                      title="Copy to clipboard"
                    >
                      <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Copy</span>
                    </button>
                    <button
                      onClick={triggerFileUpload}
                      disabled={isLoadingModels}
                      className="flex items-center gap-1 rounded-lg bg-blue-100 px-2 sm:px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-200 disabled:opacity-50"
                      title="Upload text file"
                    >
                      <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="hidden sm:inline">Upload</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.md,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.go,.rs,.php,.rb,.swift,.kt,.html,.css,.json,.xml,.yaml,.yml"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              {inputMode === 'text' ? (
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your prompt here"
                  disabled={isLoadingModels}
                />
              ) : (
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={manualInputTokens || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/^0+/, '') || '0';
                      const numValue = parseInt(value, 10);
                      setManualInputTokens(isNaN(numValue) ? 0 : numValue);
                    }}
                    className="w-full rounded-lg border-2 border-blue-300 bg-white px-4 py-2.5 text-sm text-blue-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-blue-400"
                    disabled={isLoadingModels}
                    placeholder="Enter number of input tokens, e.g., 1500"
                  />
                  <p className="mt-2 text-xs text-blue-600">
                    Directly enter the number of input tokens for calculation. Use this mode when you already know the token count.
                  </p>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="outputTokens" className="mb-1 block text-sm font-medium text-blue-800">
                Expected output tokens
              </label>
              <p className="mb-2 text-xs text-blue-600">
                Estimate how many tokens the AI will respond with. Examples:
                <span className="block mt-1">• Short answer (1 sentence): ~50-100 tokens</span>
                <span className="block">• Medium response (1 paragraph): ~200-500 tokens</span>
                <span className="block">• Long explanation (multiple paragraphs): ~1,000-2,000 tokens</span>
                <span className="block">• Detailed article or code: ~3,000-5,000+ tokens</span>
              </p>
              <input
                id="outputTokens"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={outputTokens || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/^0+/, '') || '0';
                  const numValue = parseInt(value, 10);
                  setOutputTokens(isNaN(numValue) ? 0 : numValue);
                }}
                className="w-full rounded-lg border-2 border-blue-300 bg-white px-4 py-2.5 text-sm text-blue-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-blue-400"
                disabled={isLoadingModels}
                placeholder="e.g., 2000"
              />
            </div>
          </div>
        </Card>

        <Card className="space-y-4 sm:space-y-5">
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900">Estimate</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-blue-700">{fxRate ? `USD→IDR ${fxRate.rate.toLocaleString('id-ID')}` : 'Currency loading...'}</p>
              {fxRate && (
                <a
                  href="https://www.exchangerate-api.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-full bg-blue-100 p-1 text-blue-700 transition-colors hover:bg-blue-200 flex-shrink-0"
                  title="Exchange rate source: ExchangeRate-API.com"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
          <div className="grid gap-2 sm:gap-3 grid-cols-2">
            <div className="rounded-lg border-2 border-blue-200 bg-white px-3 py-2 sm:px-4 sm:py-3 text-sm shadow-md">
              <p className="text-xs text-blue-700">Input tokens</p>
              <p className="mt-1 text-xl sm:text-2xl font-semibold text-blue-900">{isCalculating ? '...' : inputTokens.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border-2 border-blue-200 bg-white px-3 py-2 sm:px-4 sm:py-3 text-sm shadow-md">
              <p className="text-xs text-blue-700">Output tokens</p>
              <p className="mt-1 text-xl sm:text-2xl font-semibold text-blue-900">{outputTokens.toLocaleString()}</p>
            </div>
          </div>
          <div className="rounded-lg border-2 border-blue-600 bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-4 sm:px-5 sm:py-5 text-white shadow-lg">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Total cost</p>
            <p className="mt-2 text-2xl sm:text-3xl font-semibold break-all">${costCalculation.totalCostUSD.toFixed(6)}</p>
            <p className="text-xs sm:text-sm text-blue-100 break-all">Rp {costCalculation.totalCostIDR.toLocaleString('id-ID')}</p>
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-blue-800">
            <div className="flex justify-between gap-2">
              <span className="flex-shrink-0">Input</span>
              <span className="text-right break-all">${costCalculation.inputCostUSD.toFixed(6)} · Rp {costCalculation.inputCostIDR.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="flex-shrink-0">Output</span>
              <span className="text-right break-all">${costCalculation.outputCostUSD.toFixed(6)} · Rp {costCalculation.outputCostIDR.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <Button onClick={handleLogUsage} className="w-full" disabled={costCalculation.totalCostUSD === 0 || isLoadingModels}>
            Save to Dashboard
          </Button>
        </Card>
      </section>

      <Card>
        <TokenBreakdown text={inputText} />
      </Card>

      <ConfirmModal
        isOpen={isModalOpen}
        title="Save to Dashboard"
        message={`Save this estimate to dashboard history? This will be stored locally on your device. Model: ${selectedModel?.name} | Tokens: ${inputTokens.toLocaleString()} in / ${outputTokens.toLocaleString()} out | Cost: $${costCalculation.totalCostUSD.toFixed(6)} (Rp ${costCalculation.totalCostIDR.toLocaleString('id-ID')})`}
        confirmText="Save History"
        cancelText="Cancel"
        onConfirm={confirmLogUsage}
        onCancel={() => setIsModalOpen(false)}
        type="info"
      />
    </div>
  );
};

export default EstimatorPage;
