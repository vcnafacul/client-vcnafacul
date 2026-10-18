import { XCircle } from "lucide-react";

/** Mesmo travessão das outras colunas vazias da lista. */
const VAZIO = "—";

/** "✕ 2" em vermelho quando há anulada; "—" quando não há (ou o ms não mandou). */
export function AnuladasCell({ total }: { total?: number }) {
  if (!total) return <span title="Nenhuma questão anulada">{VAZIO}</span>;
  return (
    <span
      data-testid="anuladas-da-prova-na-lista"
      title={`${total} ${total === 1 ? "questão anulada" : "questões anuladas"} nesta prova`}
      className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700"
    >
      <XCircle className="h-3.5 w-3.5" aria-hidden />
      {total}
    </span>
  );
}
