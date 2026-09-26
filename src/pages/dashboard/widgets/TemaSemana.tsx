import { Link } from 'react-router-dom';
import { PenTool } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DASH, ESSAY_WRITE } from '@/routes/path';
import { useDashData } from '../data';
import { formatDate } from '../format';

/**
 * Único bloco com fundo escuro: é a ação da semana, e tem de se destacar dos
 * painéis de leitura em volta.
 */
export function TemaSemana() {
  const { data, isLoading, error } = useDashData('essays');
  const theme = data?.currentTheme;

  if (error || (!isLoading && !theme)) return null;

  return (
    <section className="rounded-2xl bg-marine p-5 text-white sm:p-6">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-green">
        <PenTool className="h-4 w-4" aria-hidden />
        Tema da semana
      </div>
      {isLoading || !theme ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-5 w-full bg-white/10" />
          <Skeleton className="h-5 w-2/3 bg-white/10" />
        </div>
      ) : (
        <>
          <h2 className="mt-3 text-lg font-semibold leading-snug">
            {theme.title}
          </h2>
          <p className="mt-1 text-xs text-white/60">
            Até {formatDate(theme.weekEnd)}
          </p>
          <Link
            to={`${DASH}/${ESSAY_WRITE}`}
            className="mt-5 inline-flex items-center rounded-lg bg-green px-4 py-2 text-sm font-semibold text-marine transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Escrever redação
          </Link>
        </>
      )}
    </section>
  );
}
