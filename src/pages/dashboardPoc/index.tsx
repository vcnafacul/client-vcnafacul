import { useMemo, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import { Greeting } from './components/Greeting';
import { clearDashCache } from './data';
import {
  availableViews,
  pocRegistry,
  Slot,
  visibleWidgets,
} from './registry';
import { useDashView } from './useDashView';

/**
 * POC da nova dashboard (`/dashboard/poc`), inspirada no layout do TailAdmin:
 * saudação → linha de KPIs → coluna larga (gráficos/tabela) + coluna estreita
 * (contexto e ação). Tudo com dado real dos serviços que a dashboard atual já
 * usa, exceto o desempenho, que agora vem do `/historico/performance` (por
 * usuário) em vez do `/historico/summary` (da plataforma inteira).
 *
 * Quem trabalha na plataforma vê a visão de atuação; se também for aluno
 * matriculado, alterna para a de estudo pelo seletor da saudação.
 */
export default function DashboardPoc() {
  // Cada visita busca dado novo; o cache só deduplica dentro da página.
  useState(clearDashCache);

  const { profiles, permissao } = useAuthStore((s) => s.data);
  const visible = useMemo(
    () => visibleWidgets(pocRegistry, profiles, permissao),
    [profiles, permissao],
  );
  const views = useMemo(
    () => availableViews(visible, profiles),
    [visible, profiles],
  );
  const [view, setView] = useDashView(views);

  const bySlot = useMemo(() => {
    const pick = (slot: Slot) =>
      visible.filter((w) => w.view === view && w.slot === slot);
    return { kpi: pick('kpi'), main: pick('main'), aside: pick('aside') };
  }, [visible, view]);

  const hasMain = bySlot.main.length > 0;
  const hasAside = bySlot.aside.length > 0;

  return (
    <div className="min-h-full bg-slate-50 lining-nums">
      <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 md:px-10 md:py-8">
        <Greeting view={view} views={views} onViewChange={setView} />

        {bySlot.kpi.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {bySlot.kpi.map(({ id, component: Widget }) => (
              <Widget key={id} />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {hasMain && (
            <div
              className={cn(
                'flex min-w-0 flex-col gap-6',
                hasAside ? 'md:col-span-8' : 'md:col-span-12',
              )}
            >
              {bySlot.main.map(({ id, component: Widget }) => (
                <Widget key={id} />
              ))}
            </div>
          )}
          {hasAside && (
            <div
              className={cn(
                'flex min-w-0 flex-col gap-6',
                hasMain
                  ? 'md:col-span-4'
                  : 'md:col-span-12 md:grid md:grid-cols-2',
              )}
            >
              {bySlot.aside.map(({ id, component: Widget }) => (
                <Widget key={id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
