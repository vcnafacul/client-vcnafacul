import { Link } from 'react-router-dom';
import { LucideIcon, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type KpiTone = 'marine' | 'green' | 'orange' | 'red';

const toneClass: Record<KpiTone, string> = {
  marine: 'bg-marine/[0.07] text-marine',
  green: 'bg-green/[0.15] text-[#0d7a63]',
  orange: 'bg-orange/[0.12] text-[#b35300]',
  red: 'bg-red/[0.10] text-red',
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
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            Não foi possível carregar.{' '}
            {retry && (
              <button
                onClick={retry}
                className="font-medium text-marine underline-offset-2 hover:underline"
              >
                Tentar novamente
              </button>
            )}
          </p>
        </div>
      ) : (
        <div className="mt-3 sm:mt-4">
          <p className="text-2xl font-bold sm:text-[28px] leading-none tabular-nums lining-nums text-marine">
            {value}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-600">{label}</p>
          {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
        </div>
      )}
    </>
  );

  const className =
    'block rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(11,39,71,0.04)]';

  return to && !isLoading && !error ? (
    <Link
      to={to}
      className={cn(
        className,
        'transition-colors hover:border-marine/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marine/40',
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
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums lining-nums',
        up ? 'bg-green/[0.15] text-[#0d7a63]' : 'bg-red/[0.10] text-red',
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
