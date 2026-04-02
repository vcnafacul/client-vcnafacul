import { Skeleton } from '@/components/ui/skeleton';

interface WidgetShellProps {
  title: string;
  icon?: React.ReactNode;
  isLoading: boolean;
  error: string | null;
  retry?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function WidgetShell({
  title,
  icon,
  isLoading,
  error,
  retry,
  children,
  className = '',
}: WidgetShellProps) {
  return (
    <div
      className={`rounded-xl border border-white/80 bg-white/60 backdrop-blur-sm p-4 transition-all hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(11,39,71,0.06)] ${className}`}
    >
      <div className="mb-2.5 flex items-center gap-2">
        {icon}
        <h3 className="text-[13px] font-semibold text-gray-700">{title}</h3>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <p className="text-sm text-gray-500">Erro ao carregar dados</p>
          {retry && (
            <button
              onClick={retry}
              className="text-sm font-medium text-marine hover:underline"
            >
              Tentar novamente
            </button>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
