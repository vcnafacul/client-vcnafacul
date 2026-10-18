import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { textoDoCaderno, TITULO_CADERNO_ANULADAS } from "./textos";

/**
 * Gerar caderno de prova com anulada (tickets/042, D8). Ela sai com o selo
 * "QUESTÃO ANULADA: não responda" — o modal diz isso antes, e como evitar.
 */
export function ModalCadernoComAnuladas({
  numeros,
  onConfirmar,
  onCancelar,
}: {
  numeros: number[];
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={TITULO_CADERNO_ANULADAS}
      className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/40 p-4 h-dvh"
    >
      <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] rounded-lg bg-white shadow-xl flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
          <div className="flex flex-col gap-2 text-sm text-gray-800">
            <h2 className="text-lg font-semibold">{TITULO_CADERNO_ANULADAS}</h2>
            {textoDoCaderno(numeros).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <div className="shrink-0 flex flex-wrap justify-end gap-2 border-t px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button size="sm" onClick={onConfirmar}>
            Gerar mesmo assim
          </Button>
        </div>
      </div>
    </div>
  );
}
