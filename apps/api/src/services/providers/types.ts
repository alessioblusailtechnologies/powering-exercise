import type { Provider } from '@powering/shared';
import type { ClassifyResult } from '../types';

export interface ClassifierProvider {
  readonly id: Provider;
  classify(testo: string, model: string): Promise<ClassifyResult>;
}
