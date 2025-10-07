import React, { useContext, useState, useEffect } from 'react';
import Card from '../components/Card';
import { PROVIDERS } from '../constants';
import { AppContext } from '../App';
import { FxRate } from '../types';
import { getUsdToIdrRate } from '../services/pricingService';

const PricingPage: React.FC = () => {
  const appContext = useContext(AppContext);
  const { models, isLoadingModels, modelError } = appContext!;
  const [fxRate, setFxRate] = useState<FxRate | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchRate = async () => {
      const rate = await getUsdToIdrRate();
      setFxRate(rate);
    };
    fetchRate();
  }, []);

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    PROVIDERS.find(p => p.id === model.provider)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingModels) {
    return <div className="py-16 text-center text-blue-700">Loading pricing...</div>;
  }

  if (modelError) {
    return <div className="py-16 text-center text-red-600">{modelError}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-blue-900">Model Pricing</h1>
              <p className="mt-2 text-sm text-blue-700">Cost per one million tokens.</p>
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

      {searchQuery && filteredModels.length === 0 && (
        <Card>
          <div className="py-8 text-center text-blue-700">
            No models found matching "{searchQuery}"
          </div>
        </Card>
      )}

      {PROVIDERS.map(provider => {
        const providerModels = searchQuery
          ? filteredModels.filter(m => m.provider === provider.id)
          : models.filter(m => m.provider === provider.id);
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
    </div>
  );
};

export default PricingPage;
