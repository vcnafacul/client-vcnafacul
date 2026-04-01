import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth';
import { WidgetDef } from '../types';

interface WidgetGridProps {
  widgets: WidgetDef[];
}

function filterWidgets(
  widgets: WidgetDef[],
  profiles: string[],
  permissions: Record<string, boolean>,
): WidgetDef[] {
  return widgets.filter((w) => {
    const hasProfile = w.profiles.some((p) => profiles.includes(p));
    if (!hasProfile) return false;

    if (w.excludeProfiles?.some((p) => profiles.includes(p))) return false;

    if (w.permissions?.length) {
      const hasPermission = w.permissions.some((perm) => permissions[perm]);
      if (!hasPermission) return false;
    }

    return true;
  });
}

function spanClassName(span: number) {
  return span === 2 ? 'md:col-span-2' :
    span === 3 ? 'col-span-full' :
    '';
}

export function WidgetGrid({ widgets }: WidgetGridProps) {
  const { profiles, permissao } = useAuthStore((s) => s.data);

  const visible = useMemo(
    () => filterWidgets(widgets, profiles, permissao),
    [widgets, profiles, permissao],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {visible.map((w) => {
        const span = w.gridSpan?.desktop;
        const Component = w.component;

        if (span) {
          return (
            <div key={w.id} className={spanClassName(span)}>
              <Component />
            </div>
          );
        }

        return <Component key={w.id} />;
      })}
    </div>
  );
}
