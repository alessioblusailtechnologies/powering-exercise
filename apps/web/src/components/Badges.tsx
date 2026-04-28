import type { Categoria, Priorita } from '@powering/shared';

const CAT_LABEL: Record<Categoria, string> = {
  tecnico: 'Tecnico',
  amministrativo: 'Amministrativo',
  commerciale: 'Commerciale',
  altro: 'Altro',
};

const PRIO_LABEL: Record<Priorita, string> = {
  bassa: 'Bassa',
  media: 'Media',
  alta: 'Alta',
};

const PRIO_ICON: Record<Priorita, string> = {
  bassa: 'pi pi-arrow-down',
  media: 'pi pi-minus',
  alta: 'pi pi-arrow-up',
};

export function CategoriaBadge({ value }: { value: Categoria }) {
  return (
    <span className={`badge badge-cat badge-cat-${value}`}>
      <span className="badge-dot" />
      {CAT_LABEL[value]}
    </span>
  );
}

export function PrioritaBadge({ value }: { value: Priorita }) {
  return (
    <span className={`badge badge-prio badge-prio-${value}`}>
      <i className={PRIO_ICON[value]} />
      {PRIO_LABEL[value]}
    </span>
  );
}
