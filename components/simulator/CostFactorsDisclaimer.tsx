import React from 'react';
import Card from '../Card';

const CostFactorsDisclaimer: React.FC = () => {
  return (
    <>
      {/* Accuracy Disclaimer */}
      <Card className="border-2 border-amber-300 bg-amber-50">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-amber-900">Accuracy & Data Sources</h3>
            <p className="mt-1 text-xs text-amber-800 leading-relaxed">
              <strong>Cost calculations</strong> use real-time pricing from <strong>4 pricing sources</strong>:
              Artificial Analysis (~50 LLMs with benchmarks),
              OpenRouter (324+ multimodal models from 60+ providers),
              AIML API (350+ models with +5% markup), and
              Helicone (1000+ community-verified models).
              Estimates are <strong>~95% accurate</strong> for typical usage patterns. Actual costs may vary based on:
              prompt complexity, caching, rate limits, provider changes, and markup differences. Always add 10-20% buffer for production planning.
            </p>
          </div>
        </div>
      </Card>

      {/* Cost Factors Notice */}
      <Card className="border-2 border-blue-300 bg-blue-50">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-2">⚠️ Factors That Can Affect Your Actual Costs</h3>
            <p className="text-xs text-blue-800 mb-2">The estimates above may differ from your actual costs due to several factors:</p>

            <div className="space-y-2 text-xs text-blue-800">
              <div>
                <strong className="text-green-700">💰 Factors That Can REDUCE Costs:</strong>
                <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                  <li><strong>Prompt Caching:</strong> Reusing system prompts can save 50-90% on input tokens (supported by Claude, Gemini, GPT-4)</li>
                  <li><strong>Batch API Processing:</strong> Up to 50% discount for non-time-sensitive requests (OpenAI, Anthropic offer batch APIs)</li>
                  <li><strong>Response Streaming:</strong> Early termination can reduce output tokens if you don't need full responses</li>
                  <li><strong>Prompt Engineering:</strong> Optimized, concise prompts reduce token usage significantly</li>
                  <li><strong>Model Fine-tuning:</strong> Custom models may need shorter prompts for same quality</li>
                  <li><strong>Smart Fallbacks:</strong> Use cheaper models for simple queries, expensive ones only when needed</li>
                  <li><strong>Output Limiting:</strong> Set max_tokens to prevent unnecessarily long responses</li>
                  <li><strong>Volume Discounts:</strong> Enterprise plans may offer 20-40% discounts for high-volume usage</li>
                </ul>
              </div>

              <div className="mt-2">
                <strong className="text-red-700">💸 Factors That Can INCREASE Costs:</strong>
                <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                  <li><strong>Rate Limit Retries:</strong> Failed requests due to rate limits may cause duplicate charges</li>
                  <li><strong>Provider Markup:</strong> Third-party APIs (OpenRouter, AIML API) add 5-30% markup vs. direct provider pricing</li>
                  <li><strong>Hidden Fees:</strong> Some providers charge extra for features like vision, function calling, or structured outputs</li>
                  <li><strong>Traffic Spikes:</strong> Unexpected viral growth or bot attacks can multiply costs overnight</li>
                  <li><strong>Inefficient Prompts:</strong> Verbose, redundant prompts waste tokens and increase costs</li>
                  <li><strong>Error Handling:</strong> Poor retry logic can cause same request to be charged multiple times</li>
                  <li><strong>Context Window Usage:</strong> Loading large contexts (PDFs, docs) uses many input tokens per request</li>
                  <li><strong>Regional Pricing:</strong> Some providers charge more in certain regions or currencies</li>
                  <li><strong>Real-time Requirements:</strong> Streaming, low-latency, or realtime API models often cost 2-3x more</li>
                </ul>
              </div>

              <div className="mt-2 p-2 bg-white rounded border border-blue-200">
                <strong className="text-blue-900">💡 Best Practice:</strong>
                <span className="ml-1">
                  Start with a <strong>20-30% cost buffer</strong> in your budget. Monitor actual usage for 1-2 months, then adjust.
                  Implement <strong>cost alerts</strong> at 50%, 75%, and 90% of your budget to avoid surprises.
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default CostFactorsDisclaimer;
