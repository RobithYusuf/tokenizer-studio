import { Provider } from '../types';
import { encoding_for_model, get_encoding } from 'tiktoken';

/**
 * Accurate token counting for OpenAI models using tiktoken
 */
const countOpenAITokens = (text: string): number => {
  try {
    // Use cl100k_base encoding (used by gpt-4, gpt-3.5-turbo, text-embedding-ada-002)
    const encoding = get_encoding('cl100k_base');
    const tokens = encoding.encode(text);
    const count = tokens.length;
    encoding.free(); // Important: free the encoding to avoid memory leaks
    return count;
  } catch (error) {
    console.error('Error counting OpenAI tokens:', error);
    // Fallback to simple estimation
    return Math.ceil(text.length / 4);
  }
};

/**
 * Token counting for Anthropic models
 * Anthropic uses similar tokenizer to OpenAI (cl100k_base)
 */
const countAnthropicTokens = async (text: string): Promise<number> => {
  try {
    // Anthropic uses a similar tokenizer to OpenAI
    const encoding = get_encoding('cl100k_base');
    const tokens = encoding.encode(text);
    const count = tokens.length;
    encoding.free();
    return count;
  } catch (error) {
    console.error('Error counting Anthropic tokens:', error);
    return Math.ceil(text.length / 3.8);
  }
};

/**
 * Token counting for Google Gemini models
 * Gemini uses a different tokenizer, but cl100k_base is a good approximation
 */
const countGeminiTokens = async (text: string): Promise<number> => {
  try {
    const encoding = get_encoding('cl100k_base');
    const tokens = encoding.encode(text);
    const count = tokens.length;
    encoding.free();
    return count;
  } catch (error) {
    console.error('Error counting Gemini tokens:', error);
    return Math.ceil(text.length / 3.9);
  }
};

/**
 * Token counting for Mistral models
 * Mistral uses a similar tokenizer architecture
 */
const countMistralTokens = async (text: string): Promise<number> => {
  try {
    const encoding = get_encoding('cl100k_base');
    const tokens = encoding.encode(text);
    const count = tokens.length;
    encoding.free();
    return count;
  } catch (error) {
    console.error('Error counting Mistral tokens:', error);
    return Math.ceil(text.length / 4.1);
  }
};

/**
 * Token counting for Grok (xAI) models
 * Grok uses similar tokenizer to OpenAI
 */
const countGrokTokens = async (text: string): Promise<number> => {
  try {
    const encoding = get_encoding('cl100k_base');
    const tokens = encoding.encode(text);
    const count = tokens.length;
    encoding.free();
    return count;
  } catch (error) {
    console.error('Error counting Grok tokens:', error);
    return Math.ceil(text.length / 4);
  }
};

/**
 * Token counting for DeepSeek models
 * DeepSeek uses similar tokenizer architecture
 */
const countDeepSeekTokens = async (text: string): Promise<number> => {
  try {
    const encoding = get_encoding('cl100k_base');
    const tokens = encoding.encode(text);
    const count = tokens.length;
    encoding.free();
    return count;
  } catch (error) {
    console.error('Error counting DeepSeek tokens:', error);
    return Math.ceil(text.length / 3.8);
  }
};

/**
 * Token counting for Qwen (Alibaba) models
 * Qwen uses its own tokenizer, cl100k_base is approximation
 */
const countQwenTokens = async (text: string): Promise<number> => {
  try {
    const encoding = get_encoding('cl100k_base');
    const tokens = encoding.encode(text);
    const count = tokens.length;
    encoding.free();
    return count;
  } catch (error) {
    console.error('Error counting Qwen tokens:', error);
    return Math.ceil(text.length / 3.7);
  }
};

export const countTokens = async (provider: Provider, text: string): Promise<number> => {
  switch (provider) {
    case Provider.OpenAI:
      return countOpenAITokens(text);
    case Provider.Anthropic:
      return await countAnthropicTokens(text);
    case Provider.Google:
      return await countGeminiTokens(text);
    case Provider.Mistral:
      return await countMistralTokens(text);
    case Provider.Grok:
      return await countGrokTokens(text);
    case Provider.DeepSeek:
      return await countDeepSeekTokens(text);
    case Provider.Qwen:
      return await countQwenTokens(text);
    default:
      return 0;
  }
};