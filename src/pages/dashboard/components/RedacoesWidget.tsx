import { useAuthStore } from '@/store/auth';
import { getMyStats, getCurrentTheme } from '@/services/essay';
import { EssayStats, EssayTheme } from '@/dtos/essay';
import { useWidgetData } from '../hooks/useWidgetData';
import { WidgetShell } from './WidgetShell';
import { Link } from 'react-router-dom';
import { ESSAY_WRITE, ESSAY_HISTORY } from '@/routes/path';

interface RedacoesData {
  stats: EssayStats;
  currentTheme: EssayTheme | null;
}

export function RedacoesWidget() {
  const token = useAuthStore((s) => s.data.token);
  const { data, isLoading, error, retry } = useWidgetData<RedacoesData>(
    async () => {
      const [stats, currentTheme] = await Promise.all([
        getMyStats(token),
        getCurrentTheme(token),
      ]);
      return { stats, currentTheme };
    },
  );

  const totalEssays = data?.stats.timeline.length ?? 0;
  const avgScore =
    totalEssays > 0
      ? Math.round(
          data!.stats.timeline.reduce((sum, e) => {
            const score =
              e.humanReview?.totalScore ?? e.aiReview?.totalScore ?? 0;
            return sum + score;
          }, 0) / totalEssays,
        )
      : 0;

  return (
    <WidgetShell
      title="Redações"
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {data && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Enviadas</span>
            <span className="font-medium">{totalEssays}</span>
          </div>
          {totalEssays > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Nota média</span>
              <span className="font-medium">{avgScore}</span>
            </div>
          )}
          {data.currentTheme && (
            <div className="rounded-md border p-3 mt-2">
              <p className="text-xs text-gray-400 mb-1">Tema da semana</p>
              <p className="text-sm font-medium truncate">
                {data.currentTheme.title}
              </p>
              <Link
                to={ESSAY_WRITE}
                className="mt-2 inline-block text-xs font-medium text-marine hover:underline"
              >
                Escrever redação
              </Link>
            </div>
          )}
          {totalEssays > 0 && (
            <Link
              to={ESSAY_HISTORY}
              className="block text-sm font-medium text-marine hover:underline"
            >
              Ver histórico
            </Link>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
