import { useMemo, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import { BannerDoTopo } from '@/components/pwa/BannerDoApp';
import { Greeting } from './components/Greeting';
import { clearDashCache } from './data';
import {
  availableViews,
  Span,
  widgetRegistry,
  visibleWidgets,
} from './registry';
import { useDashView } from './useDashView';

/**
 * Base de cada largura com o `gap-6` (1.5rem) descontado: n/12 da linha menos
 * a fração de vão que cabe a ela, para 8+4 e 4+4+4 fecharem 100% exatos.
 */
const SPAN_BASIS: Record<Span, string> = {
  4: 'md:basis-[calc(33.3333%-1rem)]',
  8: 'md:basis-[calc(66.6666%-0.5rem)]',
  12: 'md:basis-full',
};

/**
 * Dashboard (`/dashboard`), com layout inspirado no TailAdmin: saudação →
 * linha de KPIs → blocos em linhas de 12 colunas (ver `span`/`grow` no
 * registry). O desempenho vem do `/historico/performance`, que é por usuário — o
 * `/historico/summary` que a versão anterior usava é da plataforma inteira.
 *
 * Quem trabalha na plataforma vê a visão de atuação; se também for aluno
 * matriculado, alterna para a de estudo pelo seletor da saudação.
 */
export default function Dashboard() {
  // Cada visita busca dado novo; o cache só deduplica dentro da página.
  useState(clearDashCache);

  const { profiles, permissao } = useAuthStore((s) => s.data);
  const visible = useMemo(
    () => visibleWidgets(widgetRegistry, profiles, permissao),
    [profiles, permissao],
  );
  const views = useMemo(
    () => availableViews(visible, profiles),
    [visible, profiles],
  );
  const [view, setView] = useDashView(views);

  const bySlot = useMemo(() => {
    const ofView = visible.filter((w) => w.view === view);
    return {
      kpi: ofView.filter((w) => w.slot === 'kpi'),
      body: ofView.filter((w) => w.slot === 'body'),
    };
  }, [visible, view]);

  return (
    <div className="min-h-full bg-slate-50 lining-nums">
      <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 md:px-10 md:py-8">
        <Greeting view={view} views={views} onViewChange={setView} />

        {/* tickets/029: convite do app e, depois, o de notificações. */}
        <BannerDoTopo />

        {bySlot.kpi.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {bySlot.kpi.map(({ id, component: Widget }) => (
              <Widget key={id} />
            ))}
          </div>
        )}

        {/*
         * Linhas, não colunas: os blocos de uma linha ficam com a mesma
         * altura. `empty:hidden` tira da linha o widget que renderiza null
         * (Tema sem tema, Simulado sem evento), e o `grow` do vizinho fecha
         * o buraco.
         */}
        <div className="flex flex-col gap-6 md:flex-row md:flex-wrap">
          {bySlot.body.map(({ id, span = 12, grow, component: Widget }) => (
            <div
              key={id}
              className={cn(
                'flex min-w-0 flex-col empty:hidden [&>*]:flex-1',
                SPAN_BASIS[span],
                grow && 'md:grow',
              )}
            >
              <Widget />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
