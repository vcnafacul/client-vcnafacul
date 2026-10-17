import { rotuloDoMotivo } from "@/dtos/question/anulacao";
import { XCircle } from "lucide-react";
import { TEXTO_FORA_DA_ANALISE } from "./textos";

/** Ao abrir a anulada no resultado: o motivo, a justificativa e "fora da análise". */
export function PorqueDaAnulada({
  anulacao,
}: {
  anulacao?: { motivo: string; justificativa: string };
}) {
  return (
    <div data-testid="porque-da-anulada" className="flex w-full max-w-xl items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
      <XCircle className="h-5 w-5 shrink-0 text-rose-600" aria-hidden />
      <div className="min-w-0">
        <p className="font-semibold">
          Questão anulada{anulacao ? `: ${rotuloDoMotivo(anulacao.motivo)}` : ""}
        </p>
        {anulacao?.justificativa && <p className="break-words">{anulacao.justificativa}</p>}
        <p className="mt-1 text-xs text-rose-700">{TEXTO_FORA_DA_ANALISE}</p>
      </div>
    </div>
  );
}
