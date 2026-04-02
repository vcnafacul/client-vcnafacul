import { useAuthStore } from '@/store/auth';
import {
  getQuestoesPendentes,
  QuestoesPendentesResponse,
} from '@/services/dashboard';
import { useWidgetData } from '../hooks/useWidgetData';
import { WidgetShell } from './WidgetShell';
import { WidgetIcon } from './WidgetIcon';
import { Link } from 'react-router-dom';
import { DASH_QUESTION } from '@/routes/path';
import { HelpCircle } from 'lucide-react';

export function QuestoesPendentesWidget() {
  const token = useAuthStore((s) => s.data.token);
  const { data, isLoading, error, retry } =
    useWidgetData<QuestoesPendentesResponse>(() =>
      getQuestoesPendentes(token),
    );

  return (
    <WidgetShell
      title="Questões Pendentes"
      widgetId="questoes-pendentes"
      icon={<WidgetIcon icon={HelpCircle} />}
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {data && (
        <div>
          <div className="mb-1 flex items-baseline gap-1.5">
            <span className="text-[26px] font-bold leading-none text-marine">
              {data.total}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-gray-400">
              para validar
            </span>
          </div>

          {data.byMateria.length > 0 && (
            <>
              <div className="my-2 h-px bg-black/[0.06]" />
              <ul className="space-y-1">
                {data.byMateria.map((item) => (
                  <li
                    key={item.materiaId}
                    className="flex items-center justify-between text-[13px]"
                  >
                    <span className="text-gray-500 truncate mr-2">
                      {item.materiaName}
                    </span>
                    <span className="font-semibold text-gray-900 shrink-0">
                      {item.count}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <Link
            to={DASH_QUESTION}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-marine hover:underline"
          >
            Ir para validação →
          </Link>
        </div>
      )}
    </WidgetShell>
  );
}
