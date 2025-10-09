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
              <li>✅ <strong>Budget-First Mode:</strong> Hitung volume maksimal dari budget</li>
              <li>✅ <strong>12 Use Case Templates:</strong> Text (6), Image (2), TTS (2), Video (2)</li>
              <li>✅ Dynamic model selection untuk text-based templates</li>
              <li>✅ Growth rate projections (0-50% monthly growth)</li>
              <li>✅ Multi-month simulation (1-12 bulan)</li>
              <li>✅ Visual charts dan monthly breakdown</li>
              <li>✅ Data source: <strong>OpenRouter API</strong> (324+ multimodal models)</li>
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
              Semua pricing API: Cache 1 jam (auto-refresh setiap jam)<br/>
              Exchange rate USD→IDR: 10-15 menit
            </p>
          </div>

          <div className="border-b border-blue-200 pb-4">
            <h3 className="text-lg font-semibold text-blue-900">Apa perbedaan 4 pricing sources?</h3>
            <div className="mt-2 text-sm text-blue-800 leading-relaxed space-y-2">
              <div>
                <strong className="text-blue-900">📊 Artificial Analysis:</strong><br/>
                ~50 mainstream LLMs dengan performance benchmarks (Quality Index, Speed, Context Window).
                Best untuk: Membandingkan quality vs pricing.
              </div>
              <div>
                <strong className="text-blue-900">🌐 OpenRouter:</strong><br/>
                324+ multimodal models dari 60+ providers. 0% markup (pass-through pricing).
                Best untuk: Comprehensive coverage tanpa markup, free models.
              </div>
              <div>
                <strong className="text-blue-900">🎨 AIML API:</strong><br/>
                350+ models dengan fokus multimodal (48 Image, 63 Video, 64 Audio). +5% markup.
                Best untuk: Advanced generation (Sora 2, Flux Pro, Imagen 4.0, Kling).
              </div>
              <div>
                <strong className="text-blue-900">🗄️ Helicone:</strong><br/>
                1000+ models dari open-source database. Community-verified pricing.
                Best untuk: Transparansi maksimal & developer yang prefer open-source.
              </div>
            </div>
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

          <div className="border-b border-blue-200 pb-4">
            <h3 className="text-lg font-semibold text-blue-900">Apa itu "Match Type" di Helicone?</h3>
            <div className="mt-2 text-sm text-blue-800 leading-relaxed">
              <p className="mb-2">Match Type menunjukkan cara Helicone mencocokkan pricing dengan nama model:</p>
              <ul className="ml-4 space-y-1 list-disc">
                <li><strong className="text-green-700">Exact:</strong> Pricing untuk model spesifik ini saja (e.g., "gpt-4o")</li>
                <li><strong className="text-blue-700">Series:</strong> Pricing berlaku untuk semua varian (e.g., "gpt-4" covers "gpt-4-turbo", "gpt-4-vision")</li>
                <li><strong className="text-purple-700">Pattern:</strong> Pricing untuk model dengan nama mirip (flexible matching)</li>
              </ul>
              <p className="mt-2 text-xs text-blue-700">
                <em>Note: Ini adalah metadata teknis untuk sistem Helicone, bukan indikator kualitas model.</em>
              </p>
            </div>
          </div>

          <div className="border-b border-blue-200 pb-4">
            <h3 className="text-lg font-semibold text-blue-900">Kenapa AIML API ada markup +5%?</h3>
            <p className="mt-2 text-sm text-blue-800 leading-relaxed">
              AIML API mengenakan markup +5% vs official pricing karena menyediakan:<br/>
              • Unified API untuk 350+ models dari berbagai providers<br/>
              • Advanced models (Sora 2, Flux Pro, Imagen 4.0) yang tidak tersedia di OpenRouter<br/>
              • Simplified billing & infrastructure management<br/><br/>
              Markup ini <strong>transparently disclosed</strong> dengan orange badge di UI.
              Untuk harga tanpa markup, gunakan OpenRouter tab.
            </p>
          </div>

          <div className="border-b border-blue-200 pb-4">
            <h3 className="text-lg font-semibold text-blue-900">Apa itu "Blended Pricing" dan bagaimana Tokenizer Studio mengatasinya?</h3>
            <div className="mt-2 text-sm text-blue-800 leading-relaxed">
              <p className="mb-3">
                <strong>Blended Pricing</strong> adalah strategi pricing dari aggregator API (seperti AIML API) yang menyederhanakan harga beberapa variant model menjadi satu harga uniform untuk simplified billing.
              </p>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 mb-3">
                <p className="font-semibold text-yellow-900 mb-2">Contoh: Google Veo di AIML API</p>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>AIML API (Blended):</span>
                    <span className="font-mono font-semibold">$0.788/sec</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>• Veo 2, Veo 3, Standard, Fast</span>
                    <span>sama semua</span>
                  </div>
                  <div className="border-t border-yellow-300 my-2"></div>
                  <div className="flex justify-between">
                    <span>Google Cloud (Official):</span>
                    <span className="font-mono font-semibold">$0.10-$0.50/sec</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>• Veo 3 Fast (video only):</span>
                    <span className="font-mono">$0.10/sec</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>• Veo 3 Standard (video+audio):</span>
                    <span className="font-mono">$0.40/sec</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>• Veo 2 Standard:</span>
                    <span className="font-mono">$0.50/sec</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-3">
                <p className="font-semibold text-blue-900 mb-2">✨ Solusi Tokenizer Studio: Hybrid Pricing dengan Transparency</p>
                <ul className="ml-4 space-y-2 list-disc text-xs">
                  <li>
                    <strong>Reference Dataset:</strong> Kami maintain database pricing official dari Google Cloud Vertex AI untuk cross-reference
                  </li>
                  <li>
                    <strong>"Blended Pricing" Badge:</strong> Video models dengan blended pricing akan menampilkan badge kuning di PricingPage
                  </li>
                  <li>
                    <strong>Official Price Display:</strong> Badge juga menampilkan harga official dari Google Cloud untuk comparison
                  </li>
                  <li>
                    <strong>Tooltip Information:</strong> Hover badge untuk detail penjelasan tentang pricing difference
                  </li>
                </ul>
              </div>

              <div className="text-xs bg-gray-50 border border-gray-300 rounded p-2">
                <p className="font-semibold text-gray-900 mb-1">📌 Rekomendasi Penggunaan:</p>
                <ul className="ml-4 space-y-1 list-disc text-gray-700">
                  <li><strong>Gunakan AIML API blended pricing jika:</strong> Anda butuh simplified billing dan tidak peduli varian spesifik</li>
                  <li><strong>Gunakan Google Cloud official jika:</strong> Anda ingin optimize cost per variant (bisa lebih murah 4-8x untuk Veo 3 Fast)</li>
                  <li><strong>Lihat badge "Blended Pricing":</strong> Di PricingPage → AIML API tab → Video models untuk transparency</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-900">Apakah perlu API key untuk menggunakan aplikasi ini?</h3>
            <p className="mt-2 text-sm text-blue-800 leading-relaxed">
              Tidak! Aplikasi ini hanya untuk estimasi biaya. Anda tidak perlu API key dari provider manapun.
            </p>
          </div>
        </div>
      </Card>

      {/* Use Case Templates */}
      <Card>
        <h2 className="text-2xl font-semibold text-blue-900">📦 Use Case Templates (Simulator)</h2>
        <p className="mt-2 text-sm text-blue-700">Volume Simulator menyediakan 12 pre-configured templates:</p>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">📝 Text-Based (6 templates)</h3>
            <div className="mt-2 space-y-2 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>1. Simple Chatbot</span>
                <span className="text-xs">400 input / 250 output tokens</span>
              </div>
              <div className="flex justify-between">
                <span>2. Advanced Chatbot</span>
                <span className="text-xs">1500 input / 600 output tokens</span>
              </div>
              <div className="flex justify-between">
                <span>3. Content Writer</span>
                <span className="text-xs">300 input / 2000 output tokens</span>
              </div>
              <div className="flex justify-between">
                <span>4. Code Assistant</span>
                <span className="text-xs">1200 input / 1000 output tokens</span>
              </div>
              <div className="flex justify-between">
                <span>5. Data Analyst</span>
                <span className="text-xs">2500 input / 800 output tokens</span>
              </div>
              <div className="flex justify-between">
                <span>6. Document Summarizer</span>
                <span className="text-xs">3000 input / 400 output tokens</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border-2 border-pink-200 bg-pink-50 p-4">
              <h3 className="font-semibold text-pink-900">🎨 Image Generation (2)</h3>
              <div className="mt-2 space-y-1 text-sm text-pink-800">
                <div>• Standard Quality ($0.04/image)</div>
                <div>• HD Quality ($0.08/image)</div>
              </div>
            </div>

            <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
              <h3 className="font-semibold text-orange-900">🎙️ Text-to-Speech (2)</h3>
              <div className="mt-2 space-y-1 text-sm text-orange-800">
                <div>• Standard ($0.015/1K chars)</div>
                <div>• HD ($0.03/1K chars)</div>
              </div>
            </div>

            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
              <h3 className="font-semibold text-green-900">🎬 Video Generation (2)</h3>
              <div className="mt-2 space-y-1 text-sm text-green-800">
                <div>• Short (5 sec, $0.10/sec)</div>
                <div>• Medium (20 sec, $0.10/sec)</div>
              </div>
            </div>
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
              Gunakan Simulator untuk forecast monthly AI costs dengan berbagai use cases (chatbot, image gen, TTS, video).
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
        </div>
      </Card>
    </div>
  );
};

export default DocumentationPage;
