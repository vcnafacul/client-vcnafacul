import { useAuthStore } from '@/store/auth';
import { getEssayCountForReview, EssayCountResponse } from '@/services/dashboard';
import { useWidgetData } from '../hooks/useWidgetData';
import { WidgetShell } from './WidgetShell';
import { Link } from 'react-router-dom';
import { ESSAY_REVIEW_CURSINHO } from '@/routes/path';

export function RedacoesRevisarWidget() {
  const token = useAuthStore((s) => s.data.token);
  const { data, isLoading, error, retry } =
    useWidgetData<EssayCountResponse>(() => getEssayCountForReview(token));

  return (
    <WidgetShell
      title="Redações para Revisar"
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {data && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Aguardando revisão</span>
            <span className="text-2xl font-bold text-marine">{data.count}</span>
          </div>
          <Link
            to={ESSAY_REVIEW_CURSINHO}
            className="block text-sm font-medium text-marine hover:underline"
          >
            Ir para revisão
          </Link>
        </div>
      )}
    </WidgetShell>
  );
}
