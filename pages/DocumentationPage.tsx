import React, { useState } from 'react';
import Card from '../components/Card';

const DocumentationPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const sections = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'features', label: 'Features', icon: '✨' },
    { id: 'how-it-works', label: 'How It Works', icon: '⚙️' },
    { id: 'data-sources', label: 'Data Sources', icon: '🔌' },
    { id: 'faq', label: 'FAQ', icon: '❓' },
    { id: 'use-cases', label: 'Use Cases', icon: '💡' },
  ];

  const faqs = [
    {
      q: 'Apakah token counting 100% akurat?',
      a: 'OpenAI: 100% akurat (menggunakan tiktoken resmi). Provider lain: ~90-98% akurat menggunakan approximation.'
    },
    {
      q: 'Apakah data saya aman?',
      a: 'Ya! Semua perhitungan dilakukan di browser Anda (client-side). Text tidak dikirim ke server eksternal.'
    },
    {
      q: 'Berapa lama pricing data di-update?',
      a: 'Pricing API: Cache 1 jam. Exchange rate: 10-15 menit.'
    },
    {
      q: 'Apa perbedaan 4 pricing sources?',
      a: 'Artificial Analysis (~50 LLMs + benchmarks), OpenRouter (324+ multimodal, 0% markup), AIML API (350+ multimodal, +5% markup), Helicone (1000+ open-source).'
    },
    {
      q: 'Apakah perlu API key?',
      a: 'Tidak! Aplikasi ini hanya untuk estimasi biaya. Tidak perlu API key dari provider manapun.'
    },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-6">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Contents</h3>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-900 font-medium'
                      : 'text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6 min-w-0">
        {/* Header */}
        <Card>
          <h1 className="text-3xl font-bold text-blue-900">Documentation</h1>
          <p className="mt-2 text-blue-700">Complete guide to Tokenizer Studio</p>
        </Card>

        {/* Overview */}
        <section id="overview">
          <Card>
            <h2 className="text-2xl font-semibold text-blue-900 mb-3">📋 Overview</h2>
            <p className="text-blue-800 leading-relaxed">
              <strong>Tokenizer Studio</strong> adalah platform untuk menghitung dan menganalisis biaya AI model.
              Mendukung <strong>1000+ multimodal models</strong> dari 4 data sources dengan konversi IDR real-time.
            </p>
          </Card>
        </section>

        {/* Features */}
        <section id="features">
          <Card>
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">✨ Features</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Token Estimator</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Real-time token counting</li>
                  <li>• Multi-provider support</li>
                  <li>• Cost calculation (USD & IDR)</li>
                  <li>• Visual token breakdown</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2">Volume Simulator</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Budget-First / Volume-First modes</li>
                  <li>• Modality-First approach</li>
                  <li>• Growth rate projections</li>
                  <li>• Multi-month simulation</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <h3 className="font-semibold text-orange-900 mb-2">Pricing Page</h3>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• 4 data sources</li>
                  <li>• 1000+ models</li>
                  <li>• Real-time pricing</li>
                  <li>• Search & filter</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Dashboard</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Usage tracking</li>
                  <li>• Cost trend visualization</li>
                  <li>• Provider mix analysis</li>
                  <li>• Export capabilities</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* How It Works */}
        <section id="how-it-works">
          <Card>
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">⚙️ How It Works</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Token Counting</h3>
                <p className="text-sm text-blue-800 mb-2">
                  Menggunakan <strong>tiktoken</strong> library dengan encoding <code className="bg-blue-100 px-2 py-1 rounded">cl100k_base</code>
                </p>
                <div className="bg-gray-50 p-3 rounded-lg font-mono text-xs text-gray-700">
                  encoding = get_encoding('cl100k_base')<br/>
                  tokens = encoding.encode(text)<br/>
                  count = tokens.length
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Cost Calculation</h3>
                <div className="bg-blue-50 p-3 rounded-lg font-mono text-xs text-blue-900">
                  Input Cost = (input_tokens / 1,000,000) × input_price<br/>
                  Output Cost = (output_tokens / 1,000,000) × output_price<br/>
                  Total (IDR) = (Input + Output) × exchange_rate
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Data Sources */}
        <section id="data-sources">
          <Card>
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">🔌 Data Sources</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-1">📊 Artificial Analysis</h3>
                <p className="text-xs text-blue-800">~50 LLMs dengan performance benchmarks</p>
              </div>

              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-1">🌐 OpenRouter</h3>
                <p className="text-xs text-green-800">324+ multimodal models, 0% markup</p>
              </div>

              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <h3 className="font-semibold text-orange-900 mb-1">🎨 AIML API</h3>
                <p className="text-xs text-orange-800">350+ models, +5% markup</p>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-1">🗄️ Helicone</h3>
                <p className="text-xs text-purple-800">1000+ open-source database</p>
              </div>
            </div>
          </Card>
        </section>

        {/* FAQ */}
        <section id="faq">
          <Card>
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">❓ FAQ</h2>

            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-blue-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between bg-white hover:bg-blue-50 transition-colors"
                  >
                    <span className="font-medium text-blue-900 text-sm">{faq.q}</span>
                    <span className="text-blue-500 text-xl">
                      {openFAQ === index ? '−' : '+'}
                    </span>
                  </button>
                  {openFAQ === index && (
                    <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
                      <p className="text-sm text-blue-800">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Use Cases */}
        <section id="use-cases">
          <Card>
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">💡 Use Cases</h2>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-4 rounded-lg border border-blue-200 bg-white">
                <h3 className="font-semibold text-blue-900 mb-2">Developer Freelance</h3>
                <p className="text-sm text-blue-800">
                  Estimate biaya AI API sebelum membuat proposal ke client
                </p>
              </div>

              <div className="p-4 rounded-lg border border-green-200 bg-white">
                <h3 className="font-semibold text-green-900 mb-2">Startup Planning</h3>
                <p className="text-sm text-green-800">
                  Forecast monthly AI costs dengan growth projections
                </p>
              </div>

              <div className="p-4 rounded-lg border border-purple-200 bg-white">
                <h3 className="font-semibold text-purple-900 mb-2">Prompt Engineering</h3>
                <p className="text-sm text-purple-800">
                  Optimize prompts untuk reduce token usage
                </p>
              </div>

              <div className="p-4 rounded-lg border border-orange-200 bg-white">
                <h3 className="font-semibold text-orange-900 mb-2">Model Comparison</h3>
                <p className="text-sm text-orange-800">
                  Bandingkan harga 1000+ models dari 4 sources
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default DocumentationPage;
