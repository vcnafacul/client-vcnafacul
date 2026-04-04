import { useAuthStore } from '@/store/auth';
import {
  getEssayCountForReview,
  getEssayCountForReviewAll,
  EssayCountResponse,
} from '@/services/dashboard';
import { useWidgetData } from '../hooks/useWidgetData';
import { WidgetShell } from './WidgetShell';
import { WidgetIcon } from './WidgetIcon';
import { Link } from 'react-router-dom';
import { ESSAY_REVIEW_LIST, ESSAY_REVIEW_CURSINHO } from '@/routes/path';
import { Roles } from '@/enums/roles/roles';
import { FileEdit } from 'lucide-react';

export function RedacoesRevisarWidget() {
  const token = useAuthStore((s) => s.data.token);
  const permissao = useAuthStore((s) => s.data.permissao);

  const isAdmin = !!permissao[Roles.revisarTodasRedacoes];

  const fetcher = isAdmin
    ? () => getEssayCountForReviewAll(token)
    : () => getEssayCountForReview(token);

  const reviewPath = isAdmin ? ESSAY_REVIEW_LIST : ESSAY_REVIEW_CURSINHO;

  const { data, isLoading, error, retry } =
    useWidgetData<EssayCountResponse>(fetcher);

  return (
    <WidgetShell
      title="Redações para Revisar"
      widgetId="redacoes-revisar"
      icon={<WidgetIcon icon={FileEdit} />}
      isLoading={isLoading}
      error={error}
      retry={retry}
    >
      {data && (
        <div>
          <div className="mb-1 flex items-baseline gap-1.5">
            <span className="text-[26px] font-bold leading-none text-marine">
              {data.count}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-gray-400">
              aguardando
            </span>
          </div>
          <Link
            to={reviewPath}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-marine hover:underline"
          >
            Ir para revisão →
          </Link>
        </div>
      )}
    </WidgetShell>
  );
}
