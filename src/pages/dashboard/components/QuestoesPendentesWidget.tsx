import { useAuthStore } from '@/store/auth';
import {
  getQuestoesPendentes,
  QuestoesPendentesResponse,
} from '@/services/dashboard';
import { useWidgetData } from '../hooks/useWidgetData';
import { WidgetShell } from './WidgetShell';
import { Link } from 'react-router-dom';
import { DASH_QUESTION } from '@/routes/path';

export function QuestoesPendentesWidget() {
  const token = useAuthStore((s) => s.data.token);
  const { data, isLoading, error, retry } =
    useWidgetData<QuestoesPendentesResponse>(() =>
      getQuestoesPendentes(token),
    );

  return (
    <WidgetShell
      title="Questões Pendentes"
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {data && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Total pendente</span>
            <span className="text-2xl font-bold text-marine">
              {data.total}
            </span>
          </div>

          {data.byMateria.length > 0 && (
            <ul className="space-y-1">
              {data.byMateria.map((item) => (
                <li
                  key={item.materiaId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700 truncate mr-2">
                    {item.materiaName}
                  </span>
                  <span className="font-medium text-gray-900 shrink-0">
                    {item.count}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <Link
            to={DASH_QUESTION}
            className="block text-sm font-medium text-marine hover:underline"
          >
            Ir para questões
          </Link>
        </div>
      )}
    </WidgetShell>
  );
}
