import { Anulacao, rotuloDoMotivo } from "@/dtos/question/anulacao";
import { XCircle } from "lucide-react";
import { resumoDasQuestoes } from "./resumoDasQuestoes";

type Slot = { numero: number | null; anulacao?: Anulacao };


/**
 * As anuladas da prova (tickets/042, card 07): número com X vermelho, motivo e
 * justificativa. A justificativa fica à vista — o `title` não aparece no toque.
 */
export function AnuladasDaProva({ questoes }: { questoes?: Slot[] }) {
  const anuladas = (questoes ?? [])
    .filter((q) => q.anulacao)
    .sort((a, b) => (a.numero ?? Infinity) - (b.numero ?? Infinity));
  if (!anuladas.length) return null;
  return (
    <div data-testid="anuladas-da-prova" className="mb-6">
      <h3 className="text-sm font-medium text-foreground mb-2">
        {resumoDasQuestoes(questoes!.length, anuladas.length)}
      </h3>
      <ul className="flex flex-col gap-2">
        {anuladas.map((q) => (
          <li
            key={q.numero ?? "sem-numero"}
            title={q.anulacao!.justificativa}
            className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive-muted p-2 text-sm"
          >
            <span className="flex items-center gap-1 font-semibold text-destructive shrink-0">
              <XCircle className="h-4 w-4" aria-hidden />
              <span aria-label={`Questão ${q.numero} anulada`}>{q.numero ?? "—"}</span>
            </span>
            <span className="min-w-0">
              <span className="font-medium text-destructive">{rotuloDoMotivo(q.anulacao!.motivo)}</span>
              <span className="block text-destructive break-words">{q.anulacao!.justificativa}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
