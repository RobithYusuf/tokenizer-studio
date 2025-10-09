import React, { useContext, useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import { PROVIDERS } from '../constants';
import { AppContext } from '../App';
import { FxRate } from '../types';
import { getUsdToIdrRate } from '../services/pricingService';
import { PricingBadge } from '../components/PricingBadge';

type PricingSource = 'artificial-analysis' | 'openrouter' | 'aimlapi' | 'helicone';

const PricingPage: React.FC = () => {
  const appContext = useContext(AppContext);
  const { models, isLoadingModels, modelError, openRouterModels, isLoadingOpenRouter, openRouterError, aimlApiModels, isLoadingAIML, aimlError, heliconeModels, isLoadingHelicone, heliconeError } = appContext!;

  const [source, setSource] = useState<PricingSource>('artificial-analysis');
  const [fxRate, setFxRate] = useState<FxRate | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchRate = async () => {
      const rate = await getUsdToIdrRate();
      setFxRate(rate);
    };
    fetchRate();
  }, []);

  // Filter models based on source
  const filteredModels = useMemo(() => {
    if (source === 'artificial-analysis') {
      return models.filter(model => {
        // Skip models with 0/0 pricing (deprecated/preview/open-source)
        if (model.input_per_mtok_usd === 0 && model.output_per_mtok_usd === 0) {
          return false;
        }
        return model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          PROVIDERS.find(p => p.id === model.provider)?.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    } else if (source === 'openrouter') {
      return openRouterModels.filter(model =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (source === 'aimlapi') {
      return aimlApiModels.filter(model =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      return heliconeModels.filter(model =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }, [source, models, openRouterModels, aimlApiModels, heliconeModels, searchQuery]);

  // Group OpenRouter models by provider
  const openRouterByProvider = useMemo(() => {
    const grouped: Record<string, typeof openRouterModels> = {};
    openRouterModels.forEach(model => {
      if (!grouped[model.provider]) {
        grouped[model.provider] = [];
      }
      grouped[model.provider].push(model);
    });
    return grouped;
  }, [openRouterModels]);

  // Group AIML API models by provider
  const aimlByProvider = useMemo(() => {
    const grouped: Record<string, typeof aimlApiModels> = {};
    aimlApiModels.forEach(model => {
      if (!grouped[model.provider]) {
        grouped[model.provider] = [];
      }
      grouped[model.provider].push(model);
    });
    return grouped;
  }, [aimlApiModels]);

  // Group Helicone models by provider
  const heliconeByProvider = useMemo(() => {
    const grouped: Record<string, typeof heliconeModels> = {};
    heliconeModels.forEach(model => {
      if (!grouped[model.provider]) {
        grouped[model.provider] = [];
      }
      grouped[model.provider].push(model);
    });
    return grouped;
  }, [heliconeModels]);

  const isLoading = source === 'artificial-analysis' ? isLoadingModels :
                    source === 'openrouter' ? isLoadingOpenRouter :
                    source === 'aimlapi' ? isLoadingAIML : isLoadingHelicone;
  const error = source === 'artificial-analysis' ? modelError :
                source === 'openrouter' ? openRouterError :
                source === 'aimlapi' ? aimlError : heliconeError;

  if (isLoading) {
    return <div className="py-16 text-center text-blue-700">Loading pricing data...</div>;
  }

  if (error) {
    return <div className="py-16 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-blue-900">Model Pricing</h1>
              <p className="mt-2 text-sm text-blue-700">
                {source === 'artificial-analysis'
                  ? 'LLM pricing with performance benchmarks from Artificial Analysis'
                  : source === 'openrouter'
                  ? 'Multimodal AI pricing from 60+ providers via OpenRouter'
                  : source === 'aimlapi'
                  ? 'Complete multimodal coverage: Text, Image, Video, Audio from AIML API'
                  : 'Open-source LLM pricing database with 300+ models from Helicone'}
              </p>
              {source === 'aimlapi' && (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>+5% premium vs official pricing • Includes exclusive multimodal models</span>
                </div>
              )}
            </div>
            {fxRate && (
              <div className="rounded-lg border-2 border-blue-500 bg-blue-50 px-4 py-2 text-right">
                <p className="text-xs font-medium text-blue-700">Exchange Rate</p>
                <p className="flex items-center gap-1 text-lg font-semibold text-blue-900">
                  USD→IDR {fxRate.rate.toLocaleString('id-ID')}
                  <a
                    href="https://www.exchangerate-api.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                    title="Exchange rate source"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Source Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => {
                setSource('artificial-analysis');
                setSearchQuery('');
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                source === 'artificial-analysis'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden lg:inline">AI Analysis</span>
                <span className="lg:hidden">AA</span>
              </div>
              <span className="text-xs opacity-80">
                ({models.filter(m => !(m.input_per_mtok_usd === 0 && m.output_per_mtok_usd === 0)).length})
              </span>
            </button>
            <button
              onClick={() => {
                setSource('openrouter');
                setSearchQuery('');
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                source === 'openrouter'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <span className="hidden lg:inline">OpenRouter</span>
                <span className="lg:hidden">OR</span>
              </div>
              <span className="text-xs opacity-80">({openRouterModels.length})</span>
            </button>
            <button
              onClick={() => {
                setSource('aimlapi');
                setSearchQuery('');
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                source === 'aimlapi'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <span className="hidden lg:inline">AIML API</span>
                <span className="lg:hidden">AIML</span>
              </div>
              <span className="text-xs opacity-80">({aimlApiModels.length})</span>
            </button>
            <button
              onClick={() => {
                setSource('helicone');
                setSearchQuery('');
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                source === 'helicone'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <span className="hidden lg:inline">Helicone</span>
                <span className="lg:hidden">HC</span>
              </div>
              <span className="text-xs opacity-80">({heliconeModels.length})</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search models or providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border-2 border-blue-300 bg-white px-4 py-2.5 pl-10 text-sm text-blue-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-blue-400"
            />
            <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-blue-500 hover:bg-blue-100"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* No Results */}
      {searchQuery && filteredModels.length === 0 && (
        <Card>
          <div className="py-8 text-center text-blue-700">
            No models found matching "{searchQuery}"
          </div>
        </Card>
      )}

      {/* Artificial Analysis View */}
      {source === 'artificial-analysis' && PROVIDERS.map(provider => {
        const providerModels = searchQuery
          ? filteredModels.filter(m => m.provider === provider.id)
          : models.filter(m => {
              // Skip models with 0/0 pricing (deprecated/preview/open-source)
              if (m.input_per_mtok_usd === 0 && m.output_per_mtok_usd === 0) {
                return false;
              }
              return m.provider === provider.id;
            });
        if (providerModels.length === 0) return null;

        return (
          <Card key={provider.id} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-blue-900">{provider.name}</h2>
              <span className="rounded-lg border-2 border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
                {providerModels.length} models
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-200 text-sm">
                <thead className="bg-white text-left text-xs font-semibold uppercase tracking-wide text-blue-700">
                  <tr>
                    <th className="px-6 py-3">Model</th>
                    <th className="px-6 py-3 text-right">Input / 1M tokens</th>
                    <th className="px-6 py-3 text-right">Output / 1M tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-200 bg-white">
                  {providerModels.map(model => (
                    <tr key={model.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-blue-900">{model.name}</div>
                        {model.notes && <div className="text-xs text-blue-700">{model.notes}</div>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-semibold text-blue-900">
                          ${model.input_per_mtok_usd.toFixed(2)}
                          {fxRate && (
                            <span className="text-xs text-blue-700"> / Rp {Math.round(model.input_per_mtok_usd * fxRate.rate).toLocaleString('id-ID')}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-semibold text-blue-900">
                          ${model.output_per_mtok_usd.toFixed(2)}
                          {fxRate && (
                            <span className="text-xs text-blue-700"> / Rp {Math.round(model.output_per_mtok_usd * fxRate.rate).toLocaleString('id-ID')}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}

      {/* OpenRouter View */}
      {source === 'openrouter' && Object.entries(openRouterByProvider)
        .filter(([providerName]) => {
          if (!searchQuery) return true;
          const providerModels = openRouterByProvider[providerName];
          return providerModels.some(m =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.provider.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([providerName, providerModels]) => {
          const displayModels = searchQuery
            ? providerModels.filter(m =>
                m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.provider.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : providerModels;

          if (displayModels.length === 0) return null;

          return (
            <Card key={providerName} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-blue-900 capitalize">{providerName}</h2>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg border-2 border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
                    {displayModels.length} models
                  </span>
                  {displayModels.some(m => m.isFree) && (
                    <span className="rounded-lg border-2 border-green-300 bg-green-50 px-3 py-1 text-xs font-medium text-green-800">
                      {displayModels.filter(m => m.isFree).length} free
                    </span>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-200 text-sm">
                  <thead className="bg-white text-left text-xs font-semibold uppercase tracking-wide text-blue-700">
                    <tr>
                      <th className="px-6 py-3">Model</th>
                      <th className="px-6 py-3 text-center">Category</th>
                      <th className="px-6 py-3 text-right">Input / 1M tokens</th>
                      <th className="px-6 py-3 text-right">Output / 1M tokens</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-200 bg-white">
                    {displayModels.map(model => (
                      <tr key={model.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-blue-900">{model.name}</div>
                          <div className="text-xs text-blue-600">
                            {model.modalities.input.join(', ')} → {model.modalities.output.join(', ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                            model.category === 'text' ? 'bg-blue-100 text-blue-800' :
                            model.category === 'multimodal' ? 'bg-purple-100 text-purple-800' :
                            model.category === 'image' ? 'bg-pink-100 text-pink-800' :
                            model.category === 'audio' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {model.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {model.pricing.inputPerMToken > 0 ? (
                            <div className="text-sm font-semibold text-blue-900">
                              ${model.pricing.inputPerMToken.toFixed(2)}
                              {fxRate && (
                                <span className="text-xs text-blue-700"> / Rp {Math.round(model.pricing.inputPerMToken * fxRate.rate).toLocaleString('id-ID')}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-green-700 font-semibold">FREE</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {model.pricing.outputPerMToken > 0 ? (
                            <div className="text-sm font-semibold text-blue-900">
                              ${model.pricing.outputPerMToken.toFixed(2)}
                              {fxRate && (
                                <span className="text-xs text-blue-700"> / Rp {Math.round(model.pricing.outputPerMToken * fxRate.rate).toLocaleString('id-ID')}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-green-700 font-semibold">FREE</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}

      {/* AIML API View */}
      {source === 'aimlapi' && Object.entries(aimlByProvider)
        .filter(([providerName]) => {
          if (!searchQuery) return true;
          const providerModels = aimlByProvider[providerName];
          return providerModels.some(m =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.provider.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([providerName, providerModels]) => {
          const displayModels = searchQuery
            ? providerModels.filter(m =>
                m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.provider.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : providerModels;

          if (displayModels.length === 0) return null;

          return (
            <Card key={providerName} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-blue-900 capitalize">{providerName}</h2>
                <span className="rounded-lg border-2 border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
                  {displayModels.length} models
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-200 text-sm">
                  <thead className="bg-white text-left text-xs font-semibold uppercase tracking-wide text-blue-700">
                    <tr>
                      <th className="px-6 py-3">Model</th>
                      <th className="px-6 py-3 text-center">Type</th>
                      <th className="px-6 py-3 text-right">
                        <div>Pricing</div>
                        <div className="text-[10px] text-orange-600 font-normal normal-case">
                          (+5% vs official)
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-200 bg-white">
                    {displayModels.map(model => (
                      <tr key={model.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-blue-900">{model.name}</div>
                          <div className="text-xs text-blue-600">{model.type}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                            model.category === 'text' ? 'bg-blue-100 text-blue-800' :
                            model.category === 'multimodal' ? 'bg-purple-100 text-purple-800' :
                            model.category === 'image' ? 'bg-pink-100 text-pink-800' :
                            model.category === 'audio' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {model.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {model.pricing.inputPerMToken > 0 || model.pricing.outputPerMToken > 0 ? (
                            <div className="text-sm font-semibold text-blue-900">
                              ${model.pricing.inputPerMToken.toFixed(2)} / ${model.pricing.outputPerMToken.toFixed(2)} per 1M tokens
                              {fxRate && (
                                <div className="text-xs text-blue-700">
                                  Rp {Math.round(model.pricing.inputPerMToken * fxRate.rate).toLocaleString('id-ID')} / {Math.round(model.pricing.outputPerMToken * fxRate.rate).toLocaleString('id-ID')}
                                </div>
                              )}
                            </div>
                          ) : model.pricing.perImage > 0 ? (
                            <div className="text-sm font-semibold text-blue-900">
                              ${model.pricing.perImage.toFixed(4)} per image
                              {fxRate && (
                                <div className="text-xs text-blue-700">
                                  Rp {Math.round(model.pricing.perImage * fxRate.rate).toLocaleString('id-ID')}
                                </div>
                              )}
                            </div>
                          ) : model.pricing.perSecond > 0 ? (
                            <div className="space-y-1.5">
                              <div className="text-sm font-semibold text-blue-900">
                                {/* STT models: show per minute (more readable) */}
                                {model.type && model.type.toLowerCase().includes('stt') ? (
                                  <>
                                    ${(model.pricing.perSecond * 60).toFixed(4)} per minute
                                    {fxRate && (
                                      <div className="text-xs text-blue-700">
                                        Rp {Math.round(model.pricing.perSecond * 60 * fxRate.rate).toLocaleString('id-ID')}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    ${model.pricing.perSecond.toFixed(4)} per second
                                    {fxRate && (
                                      <div className="text-xs text-blue-700">
                                        Rp {Math.round(model.pricing.perSecond * fxRate.rate).toLocaleString('id-ID')}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                              {model.pricingMetadata?.isBlendedPricing && (
                                <PricingBadge
                                  isBlendedPricing={true}
                                  officialPrice={model.pricingMetadata.officialPrice}
                                  aimlPrice={model.pricing.perSecond}
                                  tooltip={model.pricingMetadata.note}
                                />
                              )}
                            </div>
                          ) : model.pricing.perCharacter > 0 ? (
                            <div className="text-sm font-semibold text-blue-900">
                              ${(model.pricing.perCharacter * 1000).toFixed(4)} per 1K chars
                              {fxRate && (
                                <div className="text-xs text-blue-700">
                                  Rp {Math.round(model.pricing.perCharacter * 1000 * fxRate.rate).toLocaleString('id-ID')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 font-medium italic">Contact provider</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}

      {/* Helicone View */}
      {source === 'helicone' && Object.entries(heliconeByProvider)
        .filter(([providerName]) => {
          if (!searchQuery) return true;
          const providerModels = heliconeByProvider[providerName];
          return providerModels.some(m =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.provider.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([providerName, providerModels]) => {
          const displayModels = searchQuery
            ? providerModels.filter(m =>
                m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.provider.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : providerModels;

          if (displayModels.length === 0) return null;

          return (
            <Card key={providerName} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-blue-900 capitalize">{providerName}</h2>
                <span className="rounded-lg border-2 border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
                  {displayModels.length} models
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-200 text-sm">
                  <thead className="bg-white text-left text-xs font-semibold uppercase tracking-wide text-blue-700">
                    <tr>
                      <th className="px-6 py-3">Model</th>
                      <th className="px-6 py-3 text-center">Match Type</th>
                      <th className="px-6 py-3 text-right">Input / 1M tokens</th>
                      <th className="px-6 py-3 text-right">Output / 1M tokens</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-200 bg-white">
                    {displayModels.map((model, idx) => (
                      <tr key={`${model.provider}-${model.model}-${idx}`} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-blue-900">{model.name}</div>
                          <div className="text-xs text-blue-600">{model.model}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                            model.operator === 'equals' ? 'bg-green-100 text-green-800' :
                            model.operator === 'startsWith' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {model.operator === 'equals' ? 'Exact' :
                             model.operator === 'startsWith' ? 'Series' :
                             'Pattern'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {model.pricing.inputPerMToken > 0 ? (
                            <div className="text-sm font-semibold text-blue-900">
                              ${model.pricing.inputPerMToken.toFixed(2)}
                              {fxRate && (
                                <span className="text-xs text-blue-700"> / Rp {Math.round(model.pricing.inputPerMToken * fxRate.rate).toLocaleString('id-ID')}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 font-medium">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {model.pricing.outputPerMToken > 0 ? (
                            <div className="text-sm font-semibold text-blue-900">
                              ${model.pricing.outputPerMToken.toFixed(2)}
                              {fxRate && (
                                <span className="text-xs text-blue-700"> / Rp {Math.round(model.pricing.outputPerMToken * fxRate.rate).toLocaleString('id-ID')}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 font-medium">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}

      {/* Data Source Info */}
      <Card className="border-2 border-blue-300 bg-blue-50">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-blue-900">Data Sources</h3>
            <p className="mt-1 text-xs text-blue-800 leading-relaxed">
              {source === 'artificial-analysis' ? (
                <>
                  <strong>Artificial Analysis</strong> provides LLM pricing with intelligence benchmarks, quality scores, and performance metrics.
                  Best for comparing mainstream LLMs from major providers with detailed evaluation data.
                </>
              ) : source === 'openrouter' ? (
                <>
                  <strong>OpenRouter</strong> aggregates 324+ multimodal AI models from 60+ providers including text, image, audio, and video models.
                  Real-time pricing with pass-through rates (no markup). Best for comprehensive coverage across all AI modalities.
                </>
              ) : source === 'aimlapi' ? (
                <>
                  <strong>AIML API</strong> provides access to 350+ models with complete multimodal coverage: Text (GPT-5, Claude 4), Image (DALL-E 3, Flux, Imagen 4.0),
                  Video (Sora 2, Kling), and Audio (ElevenLabs, Deepgram). Pricing is official rates + 5% markup.
                  Best for projects requiring advanced image/video/audio generation capabilities not available elsewhere.
                </>
              ) : (
                <>
                  <strong>Helicone</strong> is an open-source LLM pricing calculator with 300+ models from major providers.
                  Community-driven database with flexible matching (equals, startsWith, includes) for model identification.
                  Best for transparent, community-verified pricing data and developers seeking open-source solutions.
                </>
              )}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PricingPage;
