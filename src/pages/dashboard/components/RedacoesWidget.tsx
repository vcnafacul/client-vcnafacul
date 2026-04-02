import { useAuthStore } from '@/store/auth';
import { getMyStats, getCurrentTheme } from '@/services/essay';
import { EssayStats, EssayTheme } from '@/dtos/essay';
import { useWidgetData } from '../hooks/useWidgetData';
import { WidgetShell } from './WidgetShell';
import { WidgetIcon } from './WidgetIcon';
import { Link } from 'react-router-dom';
import { ESSAY_WRITE, ESSAY_HISTORY } from '@/routes/path';
import { PenTool } from 'lucide-react';

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
      widgetId="redacoes"
      icon={<WidgetIcon icon={PenTool} />}
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {data && (
        <div>
          <div className="flex justify-between py-0.5 text-[13px] text-gray-500">
            <span>Enviadas</span>
            <span className="font-semibold text-gray-900">{totalEssays}</span>
          </div>
          {totalEssays > 0 && (
            <div className="flex justify-between py-0.5 text-[13px] text-gray-500">
              <span>Nota média</span>
              <span className="font-semibold text-gray-900">{avgScore}</span>
            </div>
          )}
          {data.currentTheme && (
            <div className="mt-2 rounded-lg bg-marine/[0.03] p-3">
              <p className="text-[10px] uppercase tracking-wide text-gray-400">
                Tema da semana
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-gray-700 truncate">
                {data.currentTheme.title}
              </p>
              <Link
                to={ESSAY_WRITE}
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-marine hover:underline"
              >
                Escrever redação →
              </Link>
            </div>
          )}
          {totalEssays > 0 && (
            <Link
              to={ESSAY_HISTORY}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-marine hover:underline"
            >
              Ver histórico →
            </Link>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
