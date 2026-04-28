import { z } from 'zod';

export const CategoriaSchema = z.enum([
  'tecnico',
  'amministrativo',
  'commerciale',
  'altro',
]);
export type Categoria = z.infer<typeof CategoriaSchema>;

export const PrioritaSchema = z.enum(['bassa', 'media', 'alta']);
export type Priorita = z.infer<typeof PrioritaSchema>;

export const CLASSIFICAZIONE_FALLBACK = {
  categoria: 'altro' as const,
  priorita: 'media' as const,
  riassunto: null,
};

export const ClassificazioneSchema = z.object({
  categoria: CategoriaSchema,
  priorita: PrioritaSchema,
  riassunto: z.string().min(1).max(500),
});
export type Classificazione = z.infer<typeof ClassificazioneSchema>;

export const RichiestaSchema = z.object({
  id: z.string().uuid(),
  testo: z.string().min(1),
  categoria: CategoriaSchema,
  priorita: PrioritaSchema,
  riassunto: z.string().nullable(),
  data_creazione: z.string(),
  classificazione_errore: z.boolean(),
});
export type Richiesta = z.infer<typeof RichiestaSchema>;

export const TESTO_MAX_LEN = 2000;

export const CreaRichiestaSchema = z.object({
  testo: z
    .string()
    .min(1, 'Il testo non può essere vuoto')
    .max(
      TESTO_MAX_LEN,
      `Il testo non può superare ${TESTO_MAX_LEN} caratteri`,
    ),
});
export type CreaRichiesta = z.infer<typeof CreaRichiestaSchema>;

export const AggiornaRichiestaSchema = z
  .object({
    categoria: CategoriaSchema.optional(),
    priorita: PrioritaSchema.optional(),
    riassunto: z.string().min(1).max(500).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: 'Almeno un campo da aggiornare è richiesto',
  });
export type AggiornaRichiesta = z.infer<typeof AggiornaRichiestaSchema>;

export const CATEGORIE_OPZIONI: { label: string; value: Categoria }[] = [
  { label: 'Tecnico', value: 'tecnico' },
  { label: 'Amministrativo', value: 'amministrativo' },
  { label: 'Commerciale', value: 'commerciale' },
  { label: 'Altro', value: 'altro' },
];

export const PRIORITA_OPZIONI: { label: string; value: Priorita }[] = [
  { label: 'Bassa', value: 'bassa' },
  { label: 'Media', value: 'media' },
  { label: 'Alta', value: 'alta' },
];

// ─── Configurazione modello AI ─────────────────────────────────────────────

export const ProviderSchema = z.enum(['anthropic', 'openai']);
export type Provider = z.infer<typeof ProviderSchema>;

export const AiConfigSchema = z.object({
  provider: ProviderSchema,
  model: z.string().min(1),
});
export type AiConfig = z.infer<typeof AiConfigSchema>;

export type ModelOption = { id: string; label: string };
export type ProviderOption = {
  id: Provider;
  label: string;
  models: ModelOption[];
};

export const AVAILABLE_AI_OPTIONS: ProviderOption[] = [
  {
    id: 'anthropic',
    label: 'Anthropic',
    models: [
      { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
      { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
    ],
  },
  {
    id: 'openai',
    label: 'OpenAI',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
      { id: 'gpt-4o', label: 'GPT-4o' },
    ],
  },
];

export const DEFAULT_AI_CONFIG: AiConfig = {
  provider: 'anthropic',
  model: 'claude-haiku-4-5',
};

/** Verifica che un model sia ammesso per il provider indicato. */
export function isValidAiConfig(cfg: AiConfig): boolean {
  const provider = AVAILABLE_AI_OPTIONS.find((p) => p.id === cfg.provider);
  if (!provider) return false;
  return provider.models.some((m) => m.id === cfg.model);
}

// ─── Observability — log delle chiamate LLM ────────────────────────────────

export const LlmCallStatusSchema = z.enum([
  'ok',
  'parse_error',
  'api_error',
]);
export type LlmCallStatus = z.infer<typeof LlmCallStatusSchema>;

export const LlmCallSchema = z.object({
  id: z.string().uuid(),
  provider: ProviderSchema,
  model: z.string(),
  started_at: z.string(),
  duration_ms: z.number().int(),
  tokens_input: z.number().int().nullable(),
  tokens_output: z.number().int().nullable(),
  status: LlmCallStatusSchema,
  attempt: z.number().int(),
  error: z.string().nullable(),
  testo_input: z.string(),
  response_raw: z.unknown().nullable(),
  classificazione: ClassificazioneSchema.nullable(),
});
export type LlmCall = z.infer<typeof LlmCallSchema>;
