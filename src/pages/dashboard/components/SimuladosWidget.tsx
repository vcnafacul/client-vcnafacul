import { useAuthStore } from '@/store/auth';
import { getSimuladoSummary, SimuladoSummary } from '@/services/dashboard';
import { useWidgetData } from '../hooks/useWidgetData';
import { WidgetShell } from './WidgetShell';
import { WidgetIcon } from './WidgetIcon';
import { Link } from 'react-router-dom';
import { SIMULADO_HISTORIES } from '@/routes/path';
import { ClipboardList } from 'lucide-react';

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
    <WidgetShell
      title="Simulados"
      icon={<WidgetIcon icon={ClipboardList} />}
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {data && (
        <div>
          <div className="mb-1 flex items-baseline gap-1.5">
            <span className="text-[26px] font-bold leading-none text-marine">
              {data.historicTotal}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-gray-400">
              realizados
            </span>
          </div>
          <div className="my-2 h-px bg-black/[0.06]" />
          <div className="flex justify-between py-0.5 text-[13px] text-gray-500">
            <span>Concluídos</span>
            <span className="font-semibold text-gray-900">
              {data.historicCompleted}
            </span>
          </div>
          <div className="flex justify-between py-0.5 text-[13px] text-gray-500">
            <span>Aproveitamento</span>
            <span className="font-semibold text-gray-900">
              {aproveitamento}%
            </span>
          </div>
          <Link
            to={SIMULADO_HISTORIES}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-marine hover:underline"
          >
            Ver histórico →
          </Link>
        </div>
      )}
    </WidgetShell>
  );
}
