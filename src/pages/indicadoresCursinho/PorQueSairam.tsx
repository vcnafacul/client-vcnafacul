import { BarList } from "@/pages/dashboard/components/BarList";
import { EmptyState, Panel } from "@/pages/dashboard/components/Panel";

const DESISTENCIA_INICIAL = "Desistência inicial";

/**
 * Os cancelamentos do período por motivo — o escolhido pelo cursinho ao
 * cancelar a matrícula (tickets/033, card 04).
 */
export function PorQueSairam({
  porMotivo,
}: {
  porMotivo: Record<string, number> | null;
}) {
  const itens = Object.entries(porMotivo ?? {})
    .filter(([, n]) => n > 0)
    .sort(([a, x], [b, y]) => y - x || a.localeCompare(b))
    .map(([motivo, n]) => ({
      id: motivo,
      label:
        motivo === DESISTENCIA_INICIAL
          ? `${motivo} · não conta na evasão`
          : motivo,
      value: n,
      tone: "orange" as const,
    }));

  return (
    <Panel title="Por que saíram" subtitle="Motivo escolhido ao cancelar">
      {itens.length === 0 ? (
        <EmptyState>Nenhuma matrícula cancelada neste período.</EmptyState>
      ) : (
        <BarList items={itens} />
      )}
    </Panel>
  );
}
