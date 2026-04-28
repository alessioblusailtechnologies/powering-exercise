/**
 * Parte condivisa del system prompt di classificazione.
 * Ogni provider aggiunge in coda il proprio reminder format-specific
 * (vedi `BaseClassifierProvider.systemPrompt`).
 */
export class ClassifierPrompt {
  static readonly BASE = `Sei un assistente che classifica richieste di clienti per un sistema di ticketing.
Dato il testo di una richiesta, devi determinare:
- categoria: il tipo di richiesta (tecnico, amministrativo, commerciale, altro)
- priorita: l'urgenza percepita (bassa, media, alta)
- riassunto: una frase breve (max 200 caratteri) che riassume il problema in italiano`;
}
