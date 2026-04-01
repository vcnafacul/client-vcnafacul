import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface WidgetShellProps {
  title: string;
  isLoading: boolean;
  error: string | null;
  retry?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function WidgetShell({
  title,
  isLoading,
  error,
  retry,
  children,
  className = '',
}: WidgetShellProps) {
  return (
    <Card className={`h-64 flex flex-col ${className}`}>
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <p className="text-sm text-gray-500">
              Erro ao carregar dados
            </p>
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
      </CardContent>
    </Card>
  );
}
