import type { Provider } from '@powering/shared';
import { getAiConfig } from './ai-config';
import type { ClassifyResult } from './types';
import { failSoft } from './types';
import type { ClassifierProvider } from './providers/types';
import { AnthropicProvider } from './providers/anthropic/anthropic-provider';
import { OpenAIProvider } from './providers/openai/openai-provider';

export type { ClassifyResult } from './types';

const providers: Record<Provider, ClassifierProvider> = {
  anthropic: new AnthropicProvider(),
  openai: new OpenAIProvider(),
};

/**
 * Classifica una richiesta cliente leggendo la config AI corrente da DB
 * e delegando al provider selezionato.
 */
export async function classify(testo: string): Promise<ClassifyResult> {
  const { provider, model } = await getAiConfig();
  const impl = providers[provider];
  if (!impl) {
    return failSoft(`Provider non supportato: ${provider}`);
  }
  console.log(`[classifier] uso provider=${provider} model=${model}`);
  return impl.classify(testo, model);
}
