import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import type { Provider } from '@powering/shared';
import { api } from '../lib/api';

export function Configurazione() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['ai-config'],
    queryFn: api.getAiConfig,
  });

  const [provider, setProvider] = useState<Provider | undefined>();
  const [model, setModel] = useState<string | undefined>();

  useEffect(() => {
    if (data) {
      setProvider(data.current.provider);
      setModel(data.current.model);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => api.setAiConfig({ provider: provider!, model: model! }),
    onSuccess: (saved) => {
      queryClient.setQueryData(['ai-config'], (old: typeof data) =>
        old ? { ...old, current: saved } : old,
      );
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
        text={error instanceof Error ? error.message : 'Errore di caricamento'}
      />
    );
  }

  const providerOptions = data.available.map((p) => ({
    label: p.label,
    value: p.id,
  }));

  const currentProvider = data.available.find((p) => p.id === provider);
  const modelOptions =
    currentProvider?.models.map((m) => ({ label: m.label, value: m.id })) ?? [];

  const dirty =
    provider !== data.current.provider || model !== data.current.model;
  const saveDisabled = !provider || !model || !dirty || mutation.isPending;

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Configurazione AI</h2>
      <p className="muted">
        Scegli il provider e il modello usato per classificare automaticamente
        le richieste cliente. La selezione è persistente e applicata a tutte
        le nuove richieste.
      </p>

      <div className="row" style={{ marginTop: 16 }}>
        <div className="field">
          <label>Provider</label>
          <Dropdown
            value={provider}
            options={providerOptions}
            onChange={(e) => {
              const next = e.value as Provider;
              setProvider(next);
              const firstModel = data.available.find((p) => p.id === next)
                ?.models[0]?.id;
              setModel(firstModel);
            }}
            placeholder="Seleziona provider"
          />
        </div>
        <div className="field">
          <label>Modello</label>
          <Dropdown
            value={model}
            options={modelOptions}
            onChange={(e) => setModel(e.value)}
            placeholder="Seleziona modello"
            disabled={!provider}
          />
        </div>
      </div>

      {mutation.isError && (
        <div style={{ marginTop: 12 }}>
          <Message
            severity="error"
            text={
              mutation.error instanceof Error
                ? mutation.error.message
                : 'Errore durante il salvataggio'
            }
          />
        </div>
      )}

      {mutation.isSuccess && !dirty && (
        <div style={{ marginTop: 12 }}>
          <Message severity="success" text="Configurazione salvata." />
        </div>
      )}

      <div className="actions">
        <Button
          label="Salva"
          icon="pi pi-check"
          loading={mutation.isPending}
          disabled={saveDisabled}
          onClick={() => mutation.mutate()}
        />
      </div>
    </div>
  );
}
