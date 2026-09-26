import { useState } from 'react';
import { Panel, EmptyState } from '../components/Panel';
import { BarList } from '../components/BarList';
import { Segmented } from '../components/Segmented';
import { useDashData } from '../data';
import { toPercent } from '../format';

const orders = [
  { value: 'worst', label: 'A melhorar' },
  { value: 'best', label: 'Melhores' },
] as const;

type Order = (typeof orders)[number]['value'];

export function MateriasPanel() {
  const { data, isLoading, error, retry } = useDashData('performance');
  const [order, setOrder] = useState<Order>('worst');

  const materias = (data?.performanceMateriaFrente.materias ?? [])
    .filter((m) => Number.isFinite(m.aproveitamento))
    .map((m) => ({ id: m.id, label: m.nome, value: toPercent(m.aproveitamento) }))
    .sort((a, b) => (order === 'worst' ? a.value - b.value : b.value - a.value))
    .slice(0, 6)
    .map((m) => ({
      ...m,
      display: `${m.value}%`,
      tone:
        m.value >= 70
          ? ('green' as const)
          : m.value >= 40
            ? ('marine' as const)
            : ('orange' as const),
    }));

  return (
    <Panel
      title="Por matéria"
      subtitle="Aproveitamento médio nos simulados"
      isLoading={isLoading}
      error={error}
      retry={retry}
      action={
        materias.length > 0 && (
          <Segmented
            label="Ordenação das matérias"
            options={orders}
            value={order}
            onChange={setOrder}
          />
        )
      }
    >
      {materias.length ? (
        <BarList items={materias} max={100} />
      ) : (
        <EmptyState>
          Seu aproveitamento por matéria aparece depois do primeiro simulado.
        </EmptyState>
      )}
    </Panel>
  );
}
