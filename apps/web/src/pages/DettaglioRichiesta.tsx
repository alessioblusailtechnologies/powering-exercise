import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
  CATEGORIE_OPZIONI,
  PRIORITA_OPZIONI,
  type Categoria,
  type Priorita,
} from '@powering/shared';
import { api } from '../lib/api';

export function DettaglioRichiesta() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();

  const initialErrore = (location.state as { classificazioneErrore?: string | null } | null)
    ?.classificazioneErrore ?? null;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['richiesta', id],
    queryFn: () => api.get(id!),
    enabled: Boolean(id),
  });

  const [categoria, setCategoria] = useState<Categoria | undefined>();
  const [priorita, setPriorita] = useState<Priorita | undefined>();
  const [riassunto, setRiassunto] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (data) {
      setCategoria(data.categoria);
      setPriorita(data.priorita);
      setRiassunto(data.riassunto ?? '');
      if (data.classificazione_errore) {
        setEditing(true);
      }
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () =>
      api.update(id!, {
        categoria,
        priorita,
        riassunto: riassunto.trim() || undefined,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['richiesta', id], updated);
      queryClient.invalidateQueries({ queryKey: ['richieste'] });
      setEditing(false);
    },
  });

  if (isLoading) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Message
        severity="error"
        text={error instanceof Error ? error.message : 'Richiesta non trovata'}
      />
    );
  }

  const dirty =
    categoria !== data.categoria ||
    priorita !== data.priorita ||
    (riassunto || null) !== (data.riassunto ?? '');

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Dettaglio richiesta</h2>
        <Button
          label="Indietro"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          onClick={() => navigate('/')}
        />
      </div>

      {(initialErrore || data.classificazione_errore) && (
        <div style={{ marginTop: 16 }}>
          <Message
            severity="warn"
            text={
              initialErrore
                ? `Classificazione AI fallita: ${initialErrore}. Compila i campi manualmente.`
                : 'Classificazione AI non riuscita. Verifica e correggi i campi.'
            }
          />
        </div>
      )}

      <div className="field" style={{ marginTop: 24 }}>
        <label>Testo della richiesta</label>
        <div className="card-readonly">{data.testo}</div>
      </div>

      <div className="row">
        <div className="field">
          <label>Categoria</label>
          <Dropdown
            value={categoria}
            options={CATEGORIE_OPZIONI}
            onChange={(e) => {
              setCategoria(e.value);
              setEditing(true);
            }}
            placeholder="Seleziona categoria"
          />
        </div>
        <div className="field">
          <label>Priorità</label>
          <Dropdown
            value={priorita}
            options={PRIORITA_OPZIONI}
            onChange={(e) => {
              setPriorita(e.value);
              setEditing(true);
            }}
            placeholder="Seleziona priorità"
          />
        </div>
      </div>

      <div className="field">
        <label>Riassunto</label>
        <InputTextarea
          value={riassunto}
          onChange={(e) => {
            setRiassunto(e.target.value);
            setEditing(true);
          }}
          rows={3}
          autoResize
        />
      </div>

      <div className="field">
        <span className="muted">
          Creata il {new Date(data.data_creazione).toLocaleString('it-IT')}
        </span>
      </div>

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
          label="Salva modifiche"
          icon="pi pi-check"
          disabled={!editing || !dirty || mutation.isPending}
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        />
      </div>
    </div>
  );
}
