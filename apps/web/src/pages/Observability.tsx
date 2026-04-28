import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import type { LlmCall, LlmCallStatus } from '@powering/shared';
import { api } from '../lib/api';

const STATUS_LABEL: Record<LlmCallStatus, string> = {
  ok: 'OK',
  parse_error: 'Parse error',
  api_error: 'API error',
};

const STATUS_SEVERITY: Record<
  LlmCallStatus,
  'success' | 'warning' | 'danger'
> = {
  ok: 'success',
  parse_error: 'warning',
  api_error: 'danger',
};

const PROVIDER_LABEL: Record<string, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function formatTokens(call: LlmCall): string {
  const inT = call.tokens_input ?? '—';
  const outT = call.tokens_output ?? '—';
  return `${inT} / ${outT}`;
}

export function Observability() {
  const [selected, setSelected] = useState<LlmCall | null>(null);
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['llm-calls'],
    queryFn: api.listLlmCalls,
  });

  if (isLoading) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <Message
        severity="error"
        text={error instanceof Error ? error.message : 'Errore di caricamento'}
      />
    );
  }

  const calls = data ?? [];

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span className="muted">
          Le ultime {calls.length} chiamate al modello AI, dalla più recente.
        </span>
        <Button
          icon="pi pi-refresh"
          label="Aggiorna"
          severity="secondary"
          outlined
          loading={isRefetching}
          onClick={() => refetch()}
        />
      </div>

      <div className="table-wrap">
        <DataTable
          value={calls}
          emptyMessage="Nessuna chiamata registrata."
          onRowClick={(e) => setSelected(e.data as LlmCall)}
          rowClassName={() => 'row-clickable'}
          paginator
          rows={15}
          rowHover
          stripedRows
        >
          <Column
            header="Data"
            body={(r: LlmCall) =>
              new Date(r.started_at).toLocaleString('it-IT')
            }
            style={{ width: '170px' }}
          />
          <Column
            header="Provider"
            body={(r: LlmCall) =>
              PROVIDER_LABEL[r.provider] ?? r.provider
            }
            style={{ width: '110px' }}
          />
          <Column field="model" header="Modello" />
          <Column
            header="Durata"
            body={(r: LlmCall) => formatDuration(r.duration_ms)}
            style={{ width: '110px' }}
          />
          <Column
            header="Token (in / out)"
            body={(r: LlmCall) => formatTokens(r)}
            style={{ width: '140px' }}
          />
          <Column
            header="Tentativo"
            body={(r: LlmCall) => `#${r.attempt}`}
            style={{ width: '100px' }}
          />
          <Column
            header="Stato"
            body={(r: LlmCall) => (
              <Tag
                value={STATUS_LABEL[r.status]}
                severity={STATUS_SEVERITY[r.status]}
              />
            )}
            style={{ width: '120px' }}
          />
        </DataTable>
      </div>

      <Dialog
        visible={!!selected}
        onHide={() => setSelected(null)}
        header={
          selected
            ? `Chiamata ${PROVIDER_LABEL[selected.provider] ?? selected.provider} • ${selected.model}`
            : ''
        }
        style={{ width: '70vw', maxWidth: '900px' }}
        modal
        dismissableMask
      >
        {selected && (
          <div>
            <div className="row" style={{ marginBottom: 16 }}>
              <div className="field">
                <label>Data</label>
                <div>{new Date(selected.started_at).toLocaleString('it-IT')}</div>
              </div>
              <div className="field">
                <label>Durata</label>
                <div>{formatDuration(selected.duration_ms)}</div>
              </div>
              <div className="field">
                <label>Token input / output</label>
                <div>{formatTokens(selected)}</div>
              </div>
              <div className="field">
                <label>Tentativo</label>
                <div>#{selected.attempt}</div>
              </div>
            </div>

            {selected.error && (
              <div style={{ marginBottom: 16 }}>
                <Message severity="error" text={selected.error} />
              </div>
            )}

            <div className="field">
              <label>Testo input</label>
              <pre className="code-block">{selected.testo_input}</pre>
            </div>

            {selected.classificazione && (
              <div className="field">
                <label>Classificazione</label>
                <pre className="code-block">
                  {JSON.stringify(selected.classificazione, null, 2)}
                </pre>
              </div>
            )}

            <div className="field">
              <label>Risposta grezza</label>
              <pre className="code-block">
                {selected.response_raw
                  ? JSON.stringify(selected.response_raw, null, 2)
                  : '— (chiamata fallita prima della risposta)'}
              </pre>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
