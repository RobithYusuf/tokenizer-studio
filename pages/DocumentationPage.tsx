import React from 'react';
import Card from '../components/Card';
import { PROVIDERS } from '../constants';

const DocumentationPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h1 className="text-3xl font-bold text-blue-900">Documentation & FAQ</h1>
        <p className="mt-2 text-blue-700">Learn how AI Token Cost Estimator works and how to use it effectively</p>
      </Card>

      {/* Overview */}
      <Card>
        <h2 className="text-2xl font-semibold text-blue-900">📋 Overview</h2>
        <p className="mt-3 text-blue-800">
          AI Token Cost Estimator adalah aplikasi web untuk menghitung dan mengestimasi biaya penggunaan AI model berdasarkan jumlah token.
          Platform ini mendukung berbagai provider AI populer dengan konversi otomatis ke Rupiah (IDR) menggunakan exchange rate real-time.
        </p>
      </Card>

      {/* Features */}
      <Card>
        <h2 className="text-2xl font-semibold text-blue-900">✨ Features</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">1. Token Estimator</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>✅ Real-time token counting menggunakan tiktoken</li>
              <li>✅ Input & output token estimation</li>
              <li>✅ Multi-provider support (ChatGPT, Claude, Gemini, dll)</li>
              <li>✅ Cost calculation dalam USD & IDR</li>
              <li>✅ Clipboard integration (paste/copy)</li>
              <li>✅ File upload support (.txt, .md, .js, .py, dll)</li>
            </ul>
          </div>

          <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-green-900">2. Token Visualization</h3>
            <ul className="mt-2 space-y-1 text-sm text-green-800">
              <li>✅ Colorful token breakdown (12 warna berbeda)</li>
              <li>✅ Interactive hover dengan detail token</li>
              <li>✅ Whitespace toggle control</li>
              <li>✅ Token efficiency analysis</li>
            </ul>
          </div>

          <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
            <h3 className="font-semibold text-purple-900">3. Dashboard Analytics</h3>
            <ul className="mt-2 space-y-1 text-sm text-purple-800">
              <li>✅ Usage tracking per model/provider</li>
              <li>✅ Cost trend visualization (chart)</li>
              <li>✅ Provider mix analysis</li>
              <li>✅ Recent logs dengan detail lengkap</li>
            </ul>
          </div>

          <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
            <h3 className="font-semibold text-orange-900">4. Pricing Information</h3>
            <ul className="mt-2 space-y-1 text-sm text-orange-800">
              <li>✅ Real-time pricing dari ArtificialAnalysis API</li>
              <li>✅ Model comparison antar provider</li>
              <li>✅ Per-provider breakdown</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* How it Works */}
      <Card>
        <h2 className="text-2xl font-semibold text-blue-900">🔧 How It Works</h2>

        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">1. Token Counting</h3>
            <p className="mt-2 text-sm text-blue-800">
              Aplikasi menggunakan <span className="font-semibold">tiktoken</span> library (OpenAI's official tokenizer) dengan encoding <code className="rounded bg-blue-100 px-2 py-1 text-xs">cl100k_base</code> untuk menghitung token.
            </p>
            <div className="mt-2 rounded-lg bg-gray-50 p-3">
              <code className="text-xs text-gray-800">
                encoding = get_encoding('cl100k_base')<br/>
                tokens = encoding.encode(text)<br/>
                count = tokens.length
              </code>
            </div>
            <p className="mt-2 text-xs text-blue-700">
              <strong>Akurasi:</strong> OpenAI (100%), Anthropic/Google/Mistral (~95-98%), DeepSeek/Qwen/Grok (~90-95%)
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-900">2. Cost Calculation Formula</h3>
            <div className="mt-2 rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-mono text-blue-900">
                INPUT COST (USD) = (input_tokens / 1,000,000) × input_price<br/>
                OUTPUT COST (USD) = (output_tokens / 1,000,000) × output_price<br/>
                TOTAL COST (USD) = INPUT COST + OUTPUT COST<br/>
                <br/>
                COST (IDR) = TOTAL COST (USD) × exchange_rate
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-900">3. Data Sources</h3>
            <div className="mt-2 space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <span className="font-semibold text-blue-900">Model Pricing:</span>
                <div>
                  <a href="https://artificialanalysis.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    ArtificialAnalysis.ai
                  </a>
                  <p className="text-xs text-blue-700">Pricing data dari berbagai AI providers (cache: 1 jam)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold text-blue-900">Exchange Rate:</span>
                <div>
                  <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    ExchangeRate-API.com
                  </a>
                  <p className="text-xs text-blue-700">USD to IDR real-time (cache: 10 menit)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* FAQ */}
      <Card>
        <h2 className="text-2xl font-semibold text-blue-900">❓ Frequently Asked Questions</h2>

        <div className="mt-6 space-y-6">
          <div className="border-b border-blue-200 pb-4">
            <h3 className="text-lg font-semibold text-blue-900">Apakah token counting 100% akurat?</h3>
            <p className="mt-2 text-sm text-blue-800 leading-relaxed">
              Untuk OpenAI: Ya, karena menggunakan tiktoken yang sama dengan API resmi.
              Untuk provider lain (Anthropic, Google, dll): Sekitar 90-98% akurat karena menggunakan approximation dengan cl100k_base encoding.
            </p>
          </div>

          <div className="border-b border-blue-200 pb-4">
            <h3 className="text-lg font-semibold text-blue-900">Apakah data saya aman?</h3>
            <p className="mt-2 text-sm text-blue-800 leading-relaxed">
              Ya! Semua perhitungan token dilakukan di browser Anda (client-side). Text input tidak dikirim ke server eksternal.
              Usage history disimpan di localStorage browser Anda saja.
            </p>
          </div>

          <div className="border-b border-blue-200 pb-4">
            <h3 className="text-lg font-semibold text-blue-900">Berapa lama pricing data di-update?</h3>
            <p className="mt-2 text-sm text-blue-800 leading-relaxed">
              Pricing model: 1 jam (dari ArtificialAnalysis API)<br/>
              Exchange rate IDR: 10 menit (dari ExchangeRate-API)
            </p>
          </div>

          <div className="border-b border-blue-200 pb-4">
            <h3 className="text-lg font-semibold text-blue-900">Bagaimana cara mengestimasi output tokens?</h3>
            <p className="mt-2 text-sm text-blue-800 leading-relaxed">
              <strong>Panduan estimasi:</strong><br/>
              • Jawaban singkat (1 kalimat): ~50-100 tokens<br/>
              • Response medium (1 paragraf): ~200-500 tokens<br/>
              • Penjelasan panjang (beberapa paragraf): ~1,000-2,000 tokens<br/>
              • Artikel detail/code lengkap: ~3,000-5,000+ tokens
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-900">Apakah perlu API key untuk menggunakan aplikasi ini?</h3>
            <p className="mt-2 text-sm text-blue-800 leading-relaxed">
              Tidak! Aplikasi ini hanya untuk estimasi biaya. Anda tidak perlu API key dari provider manapun.
            </p>
          </div>
        </div>
      </Card>

      {/* Use Cases */}
      <Card>
        <h2 className="text-2xl font-semibold text-blue-900">💡 Use Cases</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border-2 border-blue-200 bg-white p-4">
            <h3 className="font-semibold text-blue-900">Developer Freelance</h3>
            <p className="mt-2 text-sm text-blue-800">
              Estimate biaya AI API sebelum membuat proposal ke client. Hitung margin profit dengan data biaya yang akurat.
            </p>
          </div>

          <div className="rounded-lg border-2 border-green-200 bg-white p-4">
            <h3 className="font-semibold text-green-900">Startup Budget Planning</h3>
            <p className="mt-2 text-sm text-green-800">
              Forecast monthly AI API costs, monitor usage trends, dan optimize dengan memilih model yang cost-effective.
            </p>
          </div>

          <div className="rounded-lg border-2 border-purple-200 bg-white p-4">
            <h3 className="font-semibold text-purple-900">Prompt Engineering</h3>
            <p className="mt-2 text-sm text-purple-800">
              Optimize prompt untuk reduce token usage. Lihat token breakdown untuk identify inefficient tokens.
            </p>
          </div>

          <div className="rounded-lg border-2 border-orange-200 bg-white p-4">
            <h3 className="font-semibold text-orange-900">Model Comparison</h3>
            <p className="mt-2 text-sm text-orange-800">
              Bandingkan harga antar provider dan model. Pilih yang paling sesuai dengan budget dan kebutuhan.
            </p>
          </div>
        </div>
      </Card>

      {/* Tech Stack */}
      <Card>
        <h2 className="text-2xl font-semibold text-blue-900">🔧 Technology Stack</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-3 text-sm">
            <p className="font-semibold text-blue-900">React 19</p>
            <p className="text-xs text-blue-700">UI Framework</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-sm">
            <p className="font-semibold text-blue-900">TypeScript</p>
            <p className="text-xs text-blue-700">Type Safety</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-sm">
            <p className="font-semibold text-blue-900">Tailwind CSS</p>
            <p className="text-xs text-blue-700">Styling</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-sm">
            <p className="font-semibold text-blue-900">Vite</p>
            <p className="text-xs text-blue-700">Build Tool</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-sm">
            <p className="font-semibold text-blue-900">tiktoken</p>
            <p className="text-xs text-blue-700">Token Counting</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-sm">
            <p className="font-semibold text-blue-900">Recharts</p>
            <p className="text-xs text-blue-700">Data Visualization</p>
          </div>
        </div>
      </Card>

      {/* Provider Support */}
      <Card>
        <h2 className="text-2xl font-semibold text-blue-900">📊 Supported Providers</h2>
        <p className="mt-2 text-sm text-blue-700">All providers are active and ready to use</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROVIDERS.map((provider) => {
            const accuracy = provider.id === 'openai' ? '100% (Exact)' :
                           provider.id === 'anthropic' ? '~98%' :
                           provider.id === 'gemini' ? '~95%' :
                           provider.id === 'grok' ? '~95%' :
                           provider.id === 'zai' ? '~95%' :
                           provider.id === 'mistral' ? '~95%' : '~90%';

            return (
              <div key={provider.id} className="rounded-lg border-2 border-blue-200 bg-white p-4 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-900">{provider.name}</h3>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Active</span>
                </div>
                <p className="text-sm text-blue-700">Token Accuracy: <span className="font-semibold">{accuracy}</span></p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default DocumentationPage;
