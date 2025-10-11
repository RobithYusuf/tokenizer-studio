import React from 'react';
import Card from '../components/Card';
import { PROVIDERS } from '../constants';

const DocumentationPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h1 className="text-3xl font-bold text-blue-900">Documentation & FAQ</h1>
        <p className="mt-2 text-blue-700">Comprehensive guide to Tokenizer Studio - AI Token Cost Estimator</p>
      </Card>

      {/* Overview */}
      <Card>
        <h2 className="text-2xl font-semibold text-blue-900">📋 Overview</h2>
        <p className="mt-3 text-blue-800">
          <strong>Tokenizer Studio</strong> adalah platform komprehensif untuk menghitung dan menganalisis biaya AI model dari berbagai provider.
          Dengan <strong>4 pricing data sources</strong> (Artificial Analysis, OpenRouter, AIML API, dan Helicone), aplikasi ini menyediakan akses ke
          <strong> 1000+ multimodal models</strong> termasuk text, image, audio, dan video generation dengan konversi otomatis ke Rupiah (IDR).
        </p>
      </Card>

      {/* Features */}
      <Card>
        <h2 className="text-2xl font-semibold text-blue-900">✨ Features</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">1. Token Estimator (<code>/</code>)</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>✅ Real-time token counting menggunakan tiktoken (cl100k_base)</li>
              <li>✅ Input & output token estimation</li>
              <li>✅ Multi-provider support: OpenAI, Anthropic, Google, Meta, Mistral, Deepseek, Z.AI</li>
              <li>✅ Cost calculation dalam USD & IDR</li>
              <li>✅ Visual token breakdown dengan 12 warna berbeda</li>
              <li>✅ Usage log management dengan localStorage persistence</li>
            </ul>
          </div>

          <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
            <h3 className="font-semibold text-purple-900">2. Volume Simulator (<code>/simulator</code>)</h3>
            <ul className="mt-2 space-y-1 text-sm text-purple-800">
              <li>✅ <strong>2 Calculation Modes:</strong> Budget-First (max volume from budget) & Volume-First (cost from API calls)</li>
              <li>✅ <strong>Modality-First Approach:</strong> Pilih AI capability (text, image, audio, video, multimodal)</li>
              <li>✅ <strong>Complexity Selector:</strong> Light, Medium, Heavy dengan token/parameter estimations</li>
              <li>✅ <strong>Dynamic Model Selection:</strong> 1000+ models dari 4 data sources (AA, OpenRouter, AIML API, Helicone)</li>
              <li>✅ Growth rate projections (0-50% monthly growth)</li>
              <li>✅ Multi-month simulation (1-12 bulan)</li>
              <li>✅ Visual charts dan monthly breakdown</li>
              <li>✅ Real-time cost calculations dengan USD & IDR</li>
            </ul>
          </div>

          <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
            <h3 className="font-semibold text-orange-900">3. Pricing Page (<code>/pricing</code>)</h3>
            <ul className="mt-2 space-y-1 text-sm text-orange-800">
              <li>✅ <strong>4 Data Sources</strong> dengan tab switcher:</li>
              <li>&nbsp;&nbsp;&nbsp;&nbsp;• <strong>Artificial Analysis:</strong> ~50 LLM models dengan performance benchmarks</li>
              <li>&nbsp;&nbsp;&nbsp;&nbsp;• <strong>OpenRouter:</strong> 324+ multimodal models (0% markup, pass-through pricing)</li>
              <li>&nbsp;&nbsp;&nbsp;&nbsp;• <strong>AIML API:</strong> 350+ models (Text, Image, Video, Audio) dengan +5% markup</li>
              <li>&nbsp;&nbsp;&nbsp;&nbsp;• <strong>Helicone:</strong> 1000+ models dari open-source pricing database</li>
              <li>✅ Real-time pricing dari semua API sources</li>
              <li>✅ Search & filter dengan provider grouping</li>
              <li>✅ Category badges (text, multimodal, image, audio, video)</li>
              <li>✅ Match Type indicators untuk Helicone (Exact, Series, Pattern)</li>
              <li>✅ Markup transparency badges (+5% untuk AIML API)</li>
              <li>✅ FREE model indicators</li>
              <li>✅ USD & IDR dual currency display</li>
              <li>✅ Responsive grid: 2 tabs (mobile) → 4 tabs (desktop)</li>
            </ul>
          </div>

          <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-green-900">4. Dashboard (<code>/dashboard</code>)</h3>
            <ul className="mt-2 space-y-1 text-sm text-green-800">
              <li>✅ Usage tracking per model/provider</li>
              <li>✅ Cost trend visualization dengan Recharts</li>
              <li>✅ Provider mix analysis</li>
              <li>✅ Recent logs dengan read/delete functionality</li>
              <li>✅ Export capabilities</li>
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
            <h3 className="text-lg font-semibold text-blue-900">3. Data Sources & Architecture</h3>
            <div className="mt-3 rounded-lg bg-blue-50 p-4 text-sm">
              <p className="font-semibold text-blue-900 mb-2">Multi-Source API Architecture (4 Sources):</p>
              <div className="space-y-3 ml-3">
                <div>
                  <p className="font-semibold text-blue-900">📊 Artificial Analysis API</p>
                  <ul className="mt-1 space-y-1 text-xs text-blue-800 ml-3">
                    <li>• Used by: PricingPage (Tab 1)</li>
                    <li>• Models: ~50 LLMs dengan performance benchmarks & quality scores</li>
                    <li>• Endpoint: <code className="bg-white px-1 rounded">https://artificialanalysis.ai/api/v2/data/llms/models</code></li>
                    <li>• Cache: 1 jam</li>
                    <li>• Best for: Mainstream LLM comparison dengan detailed metrics</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">🌐 OpenRouter API</p>
                  <ul className="mt-1 space-y-1 text-xs text-blue-800 ml-3">
                    <li>• Used by: Simulator + PricingPage (Tab 2)</li>
                    <li>• Models: 324+ multimodal (text, image, audio, video)</li>
                    <li>• Endpoint: <code className="bg-white px-1 rounded">https://openrouter.ai/api/v1/models</code></li>
                    <li>• Markup: 0% (pass-through pricing dari official providers)</li>
                    <li>• Cache: 1 jam</li>
                    <li>• Best for: Comprehensive multimodal coverage tanpa markup</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">🎨 AIML API</p>
                  <ul className="mt-1 space-y-1 text-xs text-blue-800 ml-3">
                    <li>• Used by: PricingPage (Tab 3)</li>
                    <li>• Models: 350+ (48 Image, 63 Video, 64 Audio + Text models)</li>
                    <li>• Endpoint: <code className="bg-white px-1 rounded">https://api.aimlapi.com/models</code></li>
                    <li>• Markup: +5% vs official pricing (transparently disclosed)</li>
                    <li>• Cache: 1 jam</li>
                    <li>• Best for: Advanced image/video/audio generation (Sora 2, Flux, Imagen 4.0)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">🗄️ Helicone API</p>
                  <ul className="mt-1 space-y-1 text-xs text-blue-800 ml-3">
                    <li>• Used by: PricingPage (Tab 4)</li>
                    <li>• Models: 1000+ dari open-source community database</li>
                    <li>• Endpoint: <code className="bg-white px-1 rounded">https://www.helicone.ai/api/llm-costs</code></li>
                    <li>• Match Types: Exact (spesifik), Series (varian), Pattern (mirip)</li>
                    <li>• Cache: 1 jam</li>
                    <li>• Best for: Community-verified pricing & open-source transparency</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">💱 Exchange Rate API</p>
                  <ul className="mt-1 space-y-1 text-xs text-blue-800 ml-3">
                    <li>• USD to IDR real-time conversion</li>
                    <li>• Cache: 10-15 menit</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* FAQ */}
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-blue-900 mb-2">❓ Frequently Asked Questions</h2>
          <p className="text-sm text-blue-700">Temukan jawaban untuk pertanyaan umum tentang Tokenizer Studio</p>
        </div>

        <div className="mt-6 space-y-4">
          {/* FAQ 1 */}
          <div className="rounded-lg border border-blue-200 bg-white p-5 hover:border-blue-400 hover:shadow-sm transition-all">
            <h3 className="text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span className="text-blue-500">•</span>
              Apakah token counting 100% akurat?
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed pl-4">
              <strong className="text-blue-900">Untuk OpenAI:</strong> Ya, karena menggunakan tiktoken yang sama dengan API resmi.<br/>
              <strong className="text-blue-900">Untuk provider lain</strong> (Anthropic, Google, dll): Sekitar 90-98% akurat karena menggunakan approximation dengan cl100k_base encoding.
            </p>
          </div>

          {/* FAQ 2 */}
          <div className="rounded-lg border border-blue-200 bg-white p-5 hover:border-blue-400 hover:shadow-sm transition-all">
            <h3 className="text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span className="text-blue-500">•</span>
              Apakah data saya aman?
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed pl-4">
              Ya! Semua perhitungan token dilakukan di <strong className="text-blue-900">browser Anda (client-side)</strong>. Text input tidak dikirim ke server eksternal.
              Usage history disimpan di localStorage browser Anda saja.
            </p>
          </div>

          {/* FAQ 3 */}
          <div className="rounded-lg border border-blue-200 bg-white p-5 hover:border-blue-400 hover:shadow-sm transition-all">
            <h3 className="text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span className="text-blue-500">•</span>
              Berapa lama pricing data di-update?
            </h3>
            <div className="space-y-1 text-sm text-blue-800 pl-4">
              <p><span className="inline-block w-32 font-semibold">Pricing API:</span> Cache 1 jam (auto-refresh)</p>
              <p><span className="inline-block w-32 font-semibold">Exchange rate:</span> 10-15 menit</p>
            </div>
          </div>

          {/* FAQ 4 - Pricing Sources */}
          <div className="rounded-lg border border-blue-200 bg-white p-5 hover:border-blue-400 hover:shadow-sm transition-all">
            <h3 className="text-base font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span className="text-blue-500">•</span>
              Apa perbedaan 4 pricing sources?
            </h3>
            <div className="space-y-2 pl-4 text-sm text-blue-800">
              <div className="pb-2 border-b border-blue-100">
                <p className="font-semibold text-blue-900">📊 Artificial Analysis</p>
                <p className="text-xs mt-1">~50 mainstream LLMs dengan performance benchmarks. Best untuk: Membandingkan quality vs pricing.</p>
              </div>
              <div className="pb-2 border-b border-blue-100">
                <p className="font-semibold text-blue-900">🌐 OpenRouter</p>
                <p className="text-xs mt-1">324+ multimodal models, 0% markup. Best untuk: Comprehensive coverage tanpa markup.</p>
              </div>
              <div className="pb-2 border-b border-blue-100">
                <p className="font-semibold text-blue-900">🎨 AIML API</p>
                <p className="text-xs mt-1">350+ models, fokus multimodal (+5% markup). Best untuk: Advanced generation (Sora 2, Flux Pro).</p>
              </div>
              <div>
                <p className="font-semibold text-blue-900">🗄️ Helicone</p>
                <p className="text-xs mt-1">1000+ models dari open-source database. Best untuk: Transparansi maksimal.</p>
              </div>
            </div>
          </div>

          {/* FAQ 5 */}
          <div className="rounded-lg border border-blue-200 bg-white p-5 hover:border-blue-400 hover:shadow-sm transition-all">
            <h3 className="text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span className="text-blue-500">•</span>
              Bagaimana cara mengestimasi output tokens?
            </h3>
            <div className="space-y-1 text-sm text-blue-800 pl-4">
              <p>• <strong>50-100 tokens:</strong> Jawaban singkat (1 kalimat)</p>
              <p>• <strong>200-500 tokens:</strong> Response medium (1 paragraf)</p>
              <p>• <strong>1K-2K tokens:</strong> Penjelasan panjang (beberapa paragraf)</p>
              <p>• <strong>3K-5K+ tokens:</strong> Artikel detail / code lengkap</p>
            </div>
          </div>

          {/* FAQ 6 */}
          <div className="rounded-lg border border-blue-200 bg-white p-5 hover:border-blue-400 hover:shadow-sm transition-all">
            <h3 className="text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span className="text-blue-500">•</span>
              Apa itu "Match Type" di Helicone?
            </h3>
            <p className="text-sm text-blue-800 mb-2 pl-4">Match Type menunjukkan cara Helicone mencocokkan pricing dengan nama model:</p>
            <div className="space-y-1 text-sm text-blue-800 pl-4">
              <p>• <strong className="text-green-700">Exact:</strong> Pricing untuk model spesifik (e.g., "gpt-4o")</p>
              <p>• <strong className="text-blue-700">Series:</strong> Berlaku untuk semua varian (e.g., "gpt-4" → "gpt-4-turbo")</p>
              <p>• <strong className="text-purple-700">Pattern:</strong> Model dengan nama mirip (flexible matching)</p>
            </div>
          </div>

          {/* FAQ 7 */}
          <div className="rounded-lg border border-blue-200 bg-white p-5 hover:border-blue-400 hover:shadow-sm transition-all">
            <h3 className="text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span className="text-blue-500">•</span>
              Kenapa AIML API ada markup +5%?
            </h3>
            <p className="text-sm text-blue-800 mb-2 pl-4">AIML API mengenakan markup +5% karena menyediakan:</p>
            <ul className="space-y-1 text-sm text-blue-800 pl-4">
              <li>• Unified API untuk 350+ models dari berbagai providers</li>
              <li>• Advanced models (Sora 2, Flux Pro, Imagen 4.0)</li>
              <li>• Simplified billing & infrastructure management</li>
            </ul>
            <p className="mt-2 text-xs text-blue-700 pl-4">
              <strong>Note:</strong> Markup transparently disclosed dengan orange badge. Untuk harga tanpa markup, gunakan OpenRouter tab.
            </p>
          </div>

          {/* FAQ 8 - Blended Pricing */}
          <div className="rounded-lg border border-blue-200 bg-white p-5 hover:border-blue-400 hover:shadow-sm transition-all">
            <h3 className="text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span className="text-blue-500">•</span>
              Apa itu "Blended Pricing"?
            </h3>
            <p className="text-sm text-blue-800 mb-3 pl-4">
              <strong>Blended Pricing</strong> adalah strategi pricing dari aggregator API yang menyederhanakan harga beberapa variant model menjadi satu harga uniform untuk simplified billing.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 ml-4">
              <p className="font-semibold text-yellow-900 mb-2 text-sm">📊 Contoh: Google Veo di AIML API</p>
              <div className="space-y-1 text-xs text-yellow-800">
                <p><strong>AIML API (Blended):</strong> $0.788/sec (semua varian sama)</p>
                <p><strong>Google Cloud Official:</strong> $0.10-$0.50/sec</p>
                <p className="ml-2 text-[11px]">• Veo 3 Fast: $0.10/sec (4-8x lebih murah!)</p>
                <p className="ml-2 text-[11px]">• Veo 3 Standard: $0.40/sec</p>
                <p className="ml-2 text-[11px]">• Veo 2 Standard: $0.50/sec</p>
              </div>
            </div>

            <div className="text-xs text-blue-800 pl-4">
              <p className="font-semibold text-blue-900 mb-1">💡 Rekomendasi:</p>
              <p>• Gunakan AIML API untuk <strong>simplified billing</strong></p>
              <p>• Gunakan Google Cloud untuk <strong>cost optimization</strong> (4-8x lebih murah)</p>
              <p>• Cek badge "Blended Pricing" di PricingPage untuk transparency</p>
            </div>
          </div>

          {/* FAQ 9 */}
          <div className="rounded-lg border border-blue-200 bg-white p-5 hover:border-blue-400 hover:shadow-sm transition-all">
            <h3 className="text-base font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span className="text-blue-500">•</span>
              Apakah perlu API key untuk menggunakan aplikasi ini?
            </h3>
            <p className="text-sm text-blue-800 pl-4">
              <strong className="text-blue-900">Tidak!</strong> Aplikasi ini hanya untuk <strong>estimasi biaya</strong>. Anda tidak perlu API key dari provider manapun.
            </p>
          </div>
        </div>
      </Card>

      {/* AI Modalities & Complexity Levels */}
      <Card>
        <h2 className="text-2xl font-semibold text-blue-900">🎯 AI Modalities & Complexity Levels</h2>
        <p className="mt-2 text-sm text-blue-700">Volume Simulator menggunakan pendekatan Modality-First dengan Complexity Selector:</p>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900 mb-3">📋 Available Modalities</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="text-sm text-blue-800">
                <strong>Text-to-Text:</strong> LLM conversations, code generation, analysis
              </div>
              <div className="text-sm text-blue-800">
                <strong>Text-to-Image:</strong> Image generation dari text prompts
              </div>
              <div className="text-sm text-blue-800">
                <strong>Text-to-Audio:</strong> TTS, music generation, sound effects
              </div>
              <div className="text-sm text-blue-800">
                <strong>Text-to-Video:</strong> Video generation dari text descriptions
              </div>
              <div className="text-sm text-blue-800">
                <strong>Multimodal:</strong> Vision models (image + text → text)
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
            <h3 className="font-semibold text-purple-900 mb-3">⚙️ Complexity Levels</h3>
            <div className="space-y-2 text-sm text-purple-800">
              <div>
                <strong>Light:</strong> Simple queries, short responses (e.g., chatbot, quick Q&A)
              </div>
              <div>
                <strong>Medium:</strong> Standard interactions, moderate context (e.g., content writing, code review)
              </div>
              <div>
                <strong>Heavy:</strong> Complex analysis, long context windows (e.g., document processing, advanced code gen)
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
            <h3 className="font-semibold text-orange-900 mb-2">💡 How It Works</h3>
            <ol className="ml-4 space-y-1 list-decimal text-sm text-orange-800">
              <li>Pilih <strong>AI Modality</strong> (text, image, audio, video, multimodal)</li>
              <li>Pilih <strong>Model</strong> dari 1000+ models (atau auto-select recommended)</li>
              <li>Pilih <strong>Complexity Level</strong> (light/medium/heavy) untuk estimate token usage</li>
              <li>Input <strong>Budget</strong> atau <strong>API Calls per Day</strong></li>
              <li>Lihat simulasi biaya dengan growth projection</li>
            </ol>
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
              Gunakan Simulator untuk forecast monthly AI costs. Pilih modality (text/image/audio/video), complexity level, dan lihat proyeksi growth rate untuk 1-12 bulan.
            </p>
          </div>

          <div className="rounded-lg border-2 border-purple-200 bg-white p-4">
            <h3 className="font-semibold text-purple-900">Prompt Engineering</h3>
            <p className="mt-2 text-sm text-purple-800">
              Optimize prompt untuk reduce token usage. Lihat token breakdown untuk identify inefficient tokens.
            </p>
          </div>

          <div className="rounded-lg border-2 border-orange-200 bg-white p-4">
            <h3 className="font-semibold text-orange-900">Multimodal Comparison</h3>
            <p className="mt-2 text-sm text-orange-800">
              Bandingkan harga text, image, audio, dan video models dari 1000+ models via 4 pricing sources.
              Compare markup: OpenRouter (0%), AIML API (+5%), atau Helicone (community pricing).
            </p>
          </div>
        </div>
      </Card>

      {/* Responsive Design */}
      <Card>
        <h2 className="text-2xl font-semibold text-blue-900">📱 Responsive Design</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">Mobile (&lt;768px)</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>✅ Hamburger menu dengan floating overlay (tidak push content)</li>
              <li>✅ Backdrop dengan blur effect</li>
              <li>✅ Vertical navigation</li>
              <li>✅ Shorter labels ("AA", "OR", "AIML", "HC")</li>
              <li>✅ Pricing tabs: 2 columns × 2 rows (grid-cols-2)</li>
            </ul>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border-2 border-blue-200 bg-white p-4">
              <h3 className="font-semibold text-blue-900">Tablet (≥768px)</h3>
              <ul className="mt-2 space-y-1 text-sm text-blue-800">
                <li>✅ Horizontal navigation</li>
                <li>✅ Full labels</li>
                <li>✅ Pricing tabs: 4 columns (grid-cols-4)</li>
                <li>✅ Side-by-side layouts</li>
              </ul>
            </div>

            <div className="rounded-lg border-2 border-blue-200 bg-white p-4">
              <h3 className="font-semibold text-blue-900">Desktop (≥1024px)</h3>
              <ul className="mt-2 space-y-1 text-sm text-blue-800">
                <li>✅ Full features</li>
                <li>✅ Full label names (AI Analysis, OpenRouter, AIML API, Helicone)</li>
                <li>✅ Multi-column grids</li>
                <li>✅ Enhanced spacing</li>
              </ul>
            </div>
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
            <p className="text-xs text-blue-700">Responsive Styling</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-sm">
            <p className="font-semibold text-blue-900">React Router v6</p>
            <p className="text-xs text-blue-700">Client-side Routing</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-sm">
            <p className="font-semibold text-blue-900">tiktoken</p>
            <p className="text-xs text-blue-700">Token Counting (cl100k_base)</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-sm">
            <p className="font-semibold text-blue-900">Recharts</p>
            <p className="text-xs text-blue-700">Data Visualization</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-sm">
            <p className="font-semibold text-blue-900">React Context API</p>
            <p className="text-xs text-blue-700">State Management</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-sm">
            <p className="font-semibold text-blue-900">localStorage</p>
            <p className="text-xs text-blue-700">Usage Log Persistence</p>
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

          {/* Additional Models Card */}
          <div className="rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 hover:border-blue-400 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-blue-900">Dan Model Lainnya</h3>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">1000+</span>
            </div>
            <p className="text-sm text-blue-700">
              Akses ke <span className="font-semibold">1000+ models</span> dari berbagai providers melalui 4 data sources kami
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">Cohere</span>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">Perplexity</span>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">Groq</span>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">Together AI</span>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">Fireworks</span>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">dan lainnya...</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DocumentationPage;
