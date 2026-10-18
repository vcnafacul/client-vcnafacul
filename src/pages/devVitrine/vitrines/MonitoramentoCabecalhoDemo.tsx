import { Period } from "@/enums/analytics/period";
import { CabecalhoDoMonitoramento } from "@/pages/analytics/CabecalhoDoMonitoramento";
import { useState } from "react";

/** Estado local para a vitrine do cabeçalho do Monitoramento (tickets/044). */
export function MonitoramentoCabecalhoDemo({
  cursinhos,
  inicial,
}: {
  cursinhos: { id: string; name: string }[];
  inicial: string | null;
}) {
  const [period, setPeriod] = useState(Period.month);
  const [id, setId] = useState<string | null>(inicial);
  return (
    <CabecalhoDoMonitoramento
      period={period}
      onPeriod={setPeriod}
      cursinhos={cursinhos}
      cursinho={cursinhos.find((c) => c.id === id) ?? null}
      onCursinho={setId}
    />
  );
}
