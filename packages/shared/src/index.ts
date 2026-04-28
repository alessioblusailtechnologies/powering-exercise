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
