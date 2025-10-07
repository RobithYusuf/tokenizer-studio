import { Provider } from './types';

export const PROVIDERS = [
  { id: Provider.OpenAI, name: 'ChatGPT (OpenAI)' },
  { id: Provider.Anthropic, name: 'Claude (Anthropic)' },
  { id: Provider.Google, name: 'Gemini (Google)' },
  { id: Provider.Grok, name: 'Grok (xAI)' },
  { id: Provider.ZAI, name: 'GLM (Z AI)' },
  { id: Provider.DeepSeek, name: 'DeepSeek AI' },
  { id: Provider.Qwen, name: 'Qwen (Alibaba Cloud)' },
  { id: Provider.Mistral, name: 'Mistral AI' },
];

export const DEFAULT_INPUT_TEXT = `Anda adalah arsitek & lead engineer. Bangun MVP “Token Counter & Realtime Pricing to IDR” dengan spesifikasi berikut.

== Tujuan Produk ==
- Menghitung token input untuk OpenAI, Anthropic, dan Google Gemini.
- Mengestimasikan biaya USD berbasis harga model resmi + mengonversi otomatis ke IDR dengan kurs live.
- Menyediakan API & UI dasbor untuk memantau biaya per proyek/model/user.

== Stack ==
- Next.js 15 (App Router), React, TypeScript. Tailwind + shadcn/ui (tema minimalis).
- Node.js 22, Route Handlers (Edge-friendly).
- Postgres (Neon) + Prisma, Redis (Upstash) untuk cache.

Rancang UI dan API endpoints yang diperlukan.`;