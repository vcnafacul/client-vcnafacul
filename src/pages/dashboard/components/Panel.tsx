import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PanelProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  retry?: () => void;
  className?: string;
  children: React.ReactNode;
}

/** Moldura dos blocos grandes (gráficos, tabelas, cards laterais). */
export function Panel({
  title,
  subtitle,
  action,
  isLoading,
  error,
  retry,
  className,
  children,
}: PanelProps) {
  return (
    <section
      className={cn(
        'flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(11,39,71,0.04)] sm:p-6',
        className,
      )}
    >
      <header className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-marine">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <PanelError retry={retry} />
      ) : (
        <div className="flex-1">{children}</div>
      )}
    </section>
  );
}

export function PanelError({ retry }: { retry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <p className="text-sm text-slate-500">Não foi possível carregar.</p>
      {retry && (
        <button
          onClick={retry}
          className="text-sm font-medium text-marine underline-offset-2 hover:underline"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 py-6 text-center">
      <p className="max-w-xs text-sm text-slate-500">{children}</p>
      {action}
    </div>
  );
}
