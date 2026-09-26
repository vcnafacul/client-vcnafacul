import { Link } from 'react-router-dom';
import { DASH, DASH_QUESTION } from '@/routes/path';
import { Panel, EmptyState } from '../components/Panel';
import { BarList } from '../components/BarList';
import { useDashData } from '../data';

export function QuestoesPanel() {
  const { data, isLoading, error, retry } = useDashData('questoesPendentes');

  const items = [...(data?.byMateria ?? [])]
    .sort((a, b) => b.count - a.count)
    .map((m) => ({ id: m.materiaId, label: m.materiaName, value: m.count }));

  return (
    <Panel
      title="Fila de validação"
      subtitle="Questões pendentes por matéria"
      isLoading={isLoading}
      error={error}
      retry={retry}
      action={
        <Link
          to={`${DASH}/${DASH_QUESTION}`}
          className="text-sm font-medium text-marine underline-offset-2 hover:underline"
        >
          Validar →
        </Link>
      }
    >
      {items.length ? (
        <BarList items={items} />
      ) : (
        <EmptyState>Nenhuma questão aguardando validação.</EmptyState>
      )}
    </Panel>
  );
}
