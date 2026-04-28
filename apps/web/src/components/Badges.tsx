import { Tag } from 'primereact/tag';
import type { Categoria, Priorita } from '@powering/shared';

const CAT_SEVERITY: Record<Categoria, 'info' | 'warning' | 'success' | undefined> = {
  tecnico: 'info',
  amministrativo: 'warning',
  commerciale: 'success',
  altro: undefined,
};

const PRIO_SEVERITY: Record<
  Priorita,
  'info' | 'warning' | 'danger'
> = {
  bassa: 'info',
  media: 'warning',
  alta: 'danger',
};

export function CategoriaBadge({ value }: { value: Categoria }) {
  return <Tag value={value} severity={CAT_SEVERITY[value]} />;
}

export function PrioritaBadge({ value }: { value: Priorita }) {
  return <Tag value={value} severity={PRIO_SEVERITY[value]} />;
}
