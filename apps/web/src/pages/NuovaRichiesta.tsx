import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { CreaRichiestaSchema, TESTO_MAX_LEN } from '@powering/shared';
import { api } from '../lib/api';

export function NuovaRichiesta() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [testo, setTesto] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: api.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['richieste'] });
      navigate(`/richieste/${response.richiesta.id}`, {
        state: { classificazioneErrore: response.classificazione_errore },
      });
    },
  });

  const len = testo.length;
  const tooLong = len > TESTO_MAX_LEN;
  const tooShort = len === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = CreaRichiestaSchema.safeParse({ testo });
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Input non valido');
      return;
    }
    setValidationError(null);
    mutation.mutate(parsed.data);
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2 style={{ marginTop: 0 }}>Nuova richiesta</h2>
      <p className="muted">
        Inserisci il testo della richiesta. La categoria, la priorità e il
        riassunto verranno generati automaticamente dall'AI e potrai
        modificarli nella schermata successiva.
      </p>

      <div className="field">
        <label htmlFor="testo">Testo della richiesta</label>
        <InputTextarea
          id="testo"
          value={testo}
          onChange={(e) => setTesto(e.target.value.slice(0, TESTO_MAX_LEN))}
          rows={8}
          autoResize
          maxLength={TESTO_MAX_LEN}
          placeholder="Es. Il cliente segnala che il dispositivo non si connette più alla rete mobile dopo l'ultimo aggiornamento."
          disabled={mutation.isPending}
          className={tooLong ? 'p-invalid' : undefined}
        />
        <div
          className="muted"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            color: tooLong ? '#991b1b' : undefined,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {len} / {TESTO_MAX_LEN}
        </div>
      </div>

      {validationError && (
        <Message severity="warn" text={validationError} />
      )}

      {mutation.isError && (
        <Message
          severity="error"
          text={
            mutation.error instanceof Error
              ? mutation.error.message
              : 'Errore durante il salvataggio'
          }
        />
      )}

      <div className="actions">
        <Button
          type="button"
          label="Annulla"
          severity="secondary"
          outlined
          onClick={() => navigate('/')}
          disabled={mutation.isPending}
        />
        <Button
          type="submit"
          label={mutation.isPending ? 'Classifico…' : 'Classifica e salva'}
          icon={mutation.isPending ? 'pi pi-spin pi-spinner' : 'pi pi-sparkles'}
          loading={mutation.isPending}
          disabled={tooShort || tooLong || mutation.isPending}
        />
      </div>
    </form>
  );
}
