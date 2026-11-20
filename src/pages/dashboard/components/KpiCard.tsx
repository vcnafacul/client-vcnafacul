import { Link } from 'react-router-dom';
import { LucideIcon, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type KpiTone = 'marine' | 'green' | 'orange' | 'red';

const toneClass: Record<KpiTone, string> = {
  marine: 'bg-primary/[0.07] text-foreground',
  green: 'bg-success-muted text-success',
  orange: 'bg-warning-muted text-warning',
  red: 'bg-destructive/[0.10] text-destructive',
};

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value?: string | number;
  /** Linha de contexto abaixo do rótulo (ex.: "12 presenças · 3 faltas"). */
  hint?: string;
  /** Variação contra o período anterior, em pontos (positivo = melhora). */
  delta?: { value: number; suffix: string } | null;
  tone?: KpiTone;
  to?: string;
  /**
   * O (i) da métrica (tickets/033). Com `to`, o card vira "link esticado": um
   * botão dentro de um `<a>` não funciona, então o link fica por baixo e o (i)
   * por cima.
   */
  info?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  retry?: () => void;
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  delta,
  tone = 'marine',
  to,
  info,
  isLoading,
  error,
  retry,
}: KpiCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between">
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10',
            toneClass[tone],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        {delta && delta.value !== 0 && <Delta {...delta} />}
      </div>
      {isLoading ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>
      ) : error ? (
        <div className="mt-4">
          <p className="text-body font-medium text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-caption text-muted-foreground">
            Não foi possível carregar.{' '}
            {retry && (
              <button
                onClick={retry}
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                Tentar novamente
              </button>
            )}
          </p>
        </div>
      ) : (
        <div className="mt-3 sm:mt-4">
          <p className="text-h1 font-bold tabular-nums lining-nums text-foreground">
            {value}
          </p>
          {info ? (
            <p className="mt-2 text-body font-medium text-muted-foreground">
              {label}{' '}
              <span className="relative z-raised inline-flex align-middle">
                {info}
              </span>
            </p>
          ) : (
            <p className="mt-2 text-body font-medium text-muted-foreground">{label}</p>
          )}
          {hint && <p className="mt-0.5 text-caption text-muted-foreground">{hint}</p>}
        </div>
      )}
    </>
  );

  const className =
    'block rounded-xl border border-border bg-white p-4 sm:p-5';

  if (to && info && !isLoading && !error)
    return (
      <div
        className={cn(
          className,
          'relative transition-colors hover:border-primary/30 focus-within:ring-2 focus-within:ring-ring',
        )}
      >
        <Link
          to={to}
          aria-label={label}
          className="absolute inset-0 rounded-xl focus-visible:outline-none"
        />
        {body}
      </div>
    );

  return to && !isLoading && !error ? (
    <Link
      to={to}
      className={cn(
        className,
        'transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
    >
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

function Delta({ value, suffix }: { value: number; suffix: string }) {
  const up = value > 0;
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-caption font-semibold tabular-nums lining-nums',
        up ? 'bg-success-muted text-success' : 'bg-destructive/[0.10] text-destructive',
      )}
      title="Comparado ao simulado anterior"
    >
      <Arrow className="h-3.5 w-3.5" aria-hidden />
      {up ? '+' : ''}
      {value}
      {suffix}
    </span>
  );
}
