import { useMemo } from 'react';
import { AIModality } from '../constants/modalities';

type Model = {
  id: string;
  name: string;
  provider: string;
  source: string;
  category: string;
  modalities: { input: string[]; output: string[] };
  pricing: {
    inputPerMToken: number;
    outputPerMToken: number;
    perImage: number;
    perRequest: number;
    perSecond?: number;
    perCharacter?: number;
  };
  isFree?: boolean;
  description: string;
};

const POPULAR_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'x-ai',
  'deepseek',
  'z-ai',
  'qwen',
  'meta-llama',
  'perplexity',
  'cohere',
];

export function useModalityFilters(models: Model[], selectedModality: AIModality) {
  return useMemo(() => {
    if (models.length === 0) return [];

    let filtered: Model[] = [];

    switch (selectedModality) {
      case 'text-to-text':
        filtered = models.filter(m => {
          const hasTextInput = m.modalities.input.includes('text');
          const hasTextOutput = m.modalities.output.includes('text');
          const isTextOrMultimodal = m.category === 'text' || m.category === 'multimodal';
          return isTextOrMultimodal && hasTextInput && hasTextOutput;
        });
        break;

      case 'text-to-image':
        filtered = models.filter(m => {
          const hasImageOutput = m.modalities.output.includes('image');
          const hasTextInput = m.modalities.input.includes('text');
          const isImageCategory = m.category === 'image';

          if (m.category === 'video' || m.category === 'audio') return false;

          const nameOrId = `${m.name} ${m.id}`.toLowerCase();
          const imageGenKeywords = [
            'dall-e', 'dalle', 'dall·e', 'midjourney', 'stable-diffusion', 'sdxl', 'sd-',
            'flux', 'imagen', 'ideogram', 'playground', 'recraft', 'image-gen', 'image gen',
            'gemini-2.5-flash-image',
          ];
          const hasImageKeyword = imageGenKeywords.some(keyword => nameOrId.includes(keyword));
          const hasImagePricing = m.pricing.perImage > 0;

          return (isImageCategory && hasImagePricing) ||
                 (hasImageOutput && hasTextInput && (hasImagePricing || hasImageKeyword));
        });
        break;

      case 'image-to-text':
        filtered = models.filter(m => {
          const hasImageInput = m.modalities.input.includes('image');
          const hasTextOutput = m.modalities.output.includes('text');
          const isMultimodal = m.category === 'multimodal';

          const nameOrId = `${m.name} ${m.id}`.toLowerCase();
          const visionKeywords = ['vision', 'visual', 'ocr', 'gpt-4o', 'gpt-4-turbo', 'claude', 'gemini'];
          const hasVisionKeyword = visionKeywords.some(keyword => nameOrId.includes(keyword));

          return (hasImageInput && hasTextOutput) || (isMultimodal && hasVisionKeyword);
        });
        break;

      case 'text-to-audio':
        filtered = models.filter(m => {
          const hasTextInput = m.modalities.input.includes('text');
          const hasAudioOutput = m.modalities.output.includes('audio');
          const isAudioCategory = m.category === 'audio';

          if (m.category === 'image' || m.category === 'video') return false;

          const nameOrId = `${m.name} ${m.id}`.toLowerCase();
          const ttsKeywords = ['tts', 'text-to-speech', 'speech', 'voice', 'audio-gen', 'eleven', 'deepgram', 'aura'];
          const hasTTSKeyword = ttsKeywords.some(keyword => nameOrId.includes(keyword));
          const hasTTSPricing = (m.pricing.perCharacter && m.pricing.perCharacter > 0);

          return (isAudioCategory && hasTTSPricing) ||
                 (hasTextInput && hasAudioOutput && (hasTTSPricing || hasTTSKeyword));
        });
        break;

      case 'audio-to-text':
        filtered = models.filter(m => {
          const hasAudioInput = m.modalities.input.includes('audio');
          const hasTextOutput = m.modalities.output.includes('text');
          const hasVideoOutput = m.modalities.output.includes('video');

          if (hasVideoOutput || m.category === 'video') return false;

          const nameOrId = `${m.name} ${m.id}`.toLowerCase();
          const sttKeywords = ['whisper', 'stt', 'speech-to-text', 'transcribe', 'transcription', 'deepgram', 'nova', 'aura'];
          const hasSTTKeyword = sttKeywords.some(keyword => nameOrId.includes(keyword));
          const hasSTTPricing = (m.pricing.perSecond && m.pricing.perSecond > 0);
          const isMultimodal = m.category === 'multimodal';

          return (hasAudioInput && hasTextOutput) || hasSTTKeyword || hasSTTPricing || isMultimodal;
        });
        break;

      case 'text-to-video':
        filtered = models.filter(m => {
          const hasVideoOutput = m.modalities.output.includes('video');
          const isVideoCategory = m.category === 'video';

          if (m.category === 'image' || m.category === 'audio') return false;

          const nameOrId = `${m.name} ${m.id}`.toLowerCase();
          const videoKeywords = ['runway', 'pika', 'video-gen', 'video gen', 'sora', 'gen-3', 'kling', 'minimax', 'hailuo', 'veo', 'pixverse'];
          const hasVideoKeyword = videoKeywords.some(keyword => nameOrId.includes(keyword));
          const hasVideoPricing = (m.pricing.perSecond && m.pricing.perSecond > 0);

          return (isVideoCategory && hasVideoPricing) ||
                 (hasVideoOutput && hasVideoPricing) ||
                 (hasVideoKeyword && hasVideoPricing);
        });
        break;

      default:
        filtered = [];
    }

    // Sort by popularity
    const sorted = filtered.sort((a, b) => {
      const aProvider = a.provider.toLowerCase();
      const bProvider = b.provider.toLowerCase();

      const aIndex = POPULAR_PROVIDERS.findIndex(p => aProvider.includes(p));
      const bIndex = POPULAR_PROVIDERS.findIndex(p => bProvider.includes(p));

      const aIsPopular = aIndex !== -1;
      const bIsPopular = bIndex !== -1;

      if (aIsPopular && !bIsPopular) return -1;
      if (!aIsPopular && bIsPopular) return 1;

      if (aIsPopular && bIsPopular) {
        if (aIndex !== bIndex) return aIndex - bIndex;
      }

      const avgA = (a.pricing.inputPerMToken + a.pricing.outputPerMToken) / 2 || a.pricing.perImage || a.pricing.perRequest;
      const avgB = (b.pricing.inputPerMToken + b.pricing.outputPerMToken) / 2 || b.pricing.perImage || b.pricing.perRequest;
      return avgA - avgB;
    });

    return sorted;
  }, [models, selectedModality]);
}
