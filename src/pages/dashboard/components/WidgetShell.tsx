import { useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, ChevronRight } from 'lucide-react';

const STORAGE_KEY = 'dashboard:widget-collapsed';

function getCollapsedMap(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function setCollapsed(widgetId: string, collapsed: boolean) {
  const map = getCollapsedMap();
  map[widgetId] = collapsed;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

interface WidgetShellProps {
  title: string;
  icon?: React.ReactNode;
  widgetId?: string;
  isLoading: boolean;
  error: string | null;
  retry?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function WidgetShell({
  title,
  icon,
  widgetId,
  isLoading,
  error,
  retry,
  children,
  className = '',
}: WidgetShellProps) {
  const [collapsed, setCollapsedState] = useState(() =>
    widgetId ? getCollapsedMap()[widgetId] ?? false : false,
  );

  const toggle = useCallback(() => {
    if (!widgetId) return;
    const next = !collapsed;
    setCollapsedState(next);
    setCollapsed(widgetId, next);
  }, [widgetId, collapsed]);

  const Chevron = collapsed ? ChevronRight : ChevronDown;

  return (
    <div
      className={`rounded-xl border border-white/80 bg-white/60 backdrop-blur-sm p-4 transition-all hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(11,39,71,0.06)] ${className}`}
    >
      <div
        className={`flex items-center gap-2 ${collapsed ? '' : 'mb-2.5'} ${widgetId ? 'cursor-pointer select-none' : ''}`}
        onClick={widgetId ? toggle : undefined}
      >
        {icon}
        <h3 className="flex-1 text-[13px] font-semibold text-gray-700">
          {title}
        </h3>
        {widgetId && (
          <Chevron className="h-4 w-4 text-gray-400 transition-transform" />
        )}
      </div>
      {!collapsed && (
        <>
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
        </>
      )}
    </div>
  );
}
