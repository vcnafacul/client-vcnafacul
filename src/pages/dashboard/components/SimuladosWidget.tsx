import { useAuthStore } from '@/store/auth';
import { getSimuladoSummary, SimuladoSummary } from '@/services/dashboard';
import { useWidgetData } from '../hooks/useWidgetData';
import { WidgetShell } from './WidgetShell';
import { Link } from 'react-router-dom';
import { SIMULADO_HISTORIES } from '@/routes/path';
// SIMULADO_HISTORIES = "simulado/historico/" (relative path inside /dashboard)

export function SimuladosWidget() {
  const token = useAuthStore((s) => s.data.token);
  const { data, isLoading, error, retry } = useWidgetData<SimuladoSummary>(
    () => getSimuladoSummary(token),
  );

  const aproveitamento =
    data && data.historicCompleted > 0
      ? Math.round((data.historicCompleted / data.historicTotal) * 100)
      : 0;

  return (
    <WidgetShell title="Simulados" isLoading={isLoading} error={error} retry={retry}>
      {data && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Realizados</span>
            <span className="font-medium">{data.historicTotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Concluídos</span>
            <span className="font-medium">{data.historicCompleted}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Aproveitamento</span>
            <span className="font-medium">{aproveitamento}%</span>
          </div>
          <Link
            to={SIMULADO_HISTORIES}
            className="mt-2 block text-sm font-medium text-marine hover:underline"
          >
            Ver histórico completo
          </Link>
        </div>
      )}
    </WidgetShell>
  );
}
