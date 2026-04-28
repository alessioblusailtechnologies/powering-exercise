import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import type { Richiesta } from '@powering/shared';
import { api } from '../lib/api';
import { CategoriaBadge, PrioritaBadge } from '../components/Badges';

export function ListaRichieste() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['richieste'],
    queryFn: api.list,
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

  const richieste = data ?? [];

  return (
    <div className="table-wrap">
      <DataTable
        value={richieste}
        emptyMessage="Nessuna richiesta. Creane una con il pulsante in alto."
        onRowClick={(e) => navigate(`/richieste/${(e.data as Richiesta).id}`)}
        rowClassName={() => 'row-clickable'}
        paginator
        rows={10}
        rowHover
        stripedRows
      >
        <Column
          header="Data"
          body={(r: Richiesta) =>
            new Date(r.data_creazione).toLocaleString('it-IT')
          }
          style={{ width: '160px' }}
        />
        <Column
          field="riassunto"
          header="Riassunto"
          body={(r: Richiesta) => r.riassunto ?? <em>—</em>}
        />
        <Column
          header="Categoria"
          body={(r: Richiesta) => <CategoriaBadge value={r.categoria} />}
          style={{ width: '160px' }}
        />
        <Column
          header="Priorità"
          body={(r: Richiesta) => <PrioritaBadge value={r.priorita} />}
          style={{ width: '120px' }}
        />
        <Column
          header=""
          body={(r: Richiesta) =>
            r.classificazione_errore ? (
              <i
                className="pi pi-exclamation-triangle"
                style={{ color: '#f59e0b' }}
                title="Classificazione AI fallita: rivedere manualmente"
              />
            ) : null
          }
          style={{ width: '40px' }}
        />
      </DataTable>
    </div>
  );
}
