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

export function WidgetGrid({ widgets }: WidgetGridProps) {
  const { profiles, permissao } = useAuthStore((s) => s.data);

  const visible = useMemo(
    () => filterWidgets(widgets, profiles, permissao),
    [widgets, profiles, permissao],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {visible.map((w) => {
        const span = w.gridSpan?.desktop ?? 1;
        const Component = w.component;
        return (
          <div
            key={w.id}
            className={`${
              span === 2 ? 'md:col-span-2' :
              span === 3 ? 'col-span-full' :
              ''
            } [&>*]:h-full`}
          >
            <Component />
          </div>
        );
      })}
    </div>
  );
}
