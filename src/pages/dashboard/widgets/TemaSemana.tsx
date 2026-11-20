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
    <section className="flex flex-col rounded-xl bg-primary p-5 text-primary-foreground sm:p-6">
      <div className="flex items-center gap-2 text-caption font-medium uppercase tracking-wide text-primary-foreground/80">
        <PenTool className="h-4 w-4" aria-hidden />
        Tema da semana
      </div>
      {isLoading || !theme ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-5 w-full bg-primary-foreground/10" />
          <Skeleton className="h-5 w-2/3 bg-primary-foreground/10" />
        </div>
      ) : (
        <>
          <h2 className="mt-3 text-h3 font-semibold">
            {theme.title}
          </h2>
          <p className="mb-5 mt-1 text-caption text-primary-foreground/80">
            Até {formatDate(theme.weekEnd)}
          </p>
          <Link
            to={`${DASH}/${ESSAY_WRITE}`}
            className="mt-auto inline-flex items-center self-start rounded-lg bg-cta px-4 py-2 text-body font-semibold text-cta-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Escrever redação
          </Link>
        </>
      )}
    </section>
  );
}
