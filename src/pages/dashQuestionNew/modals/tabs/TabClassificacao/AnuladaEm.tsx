import { AnulacaoNaProva, rotuloDoMotivo } from "@/dtos/question/anulacao";
import { XCircle } from "lucide-react";

/**
 * "Anulada em" no modal da questão (tickets/042, card 08): todas as provas em
 * que ela está anulada, com número, motivo, justificativa e data.
 */
export function AnuladaEm({
  anulacoes,
  nomeDaProva,
}: {
  anulacoes?: AnulacaoNaProva[];
  nomeDaProva: (provaId: string) => string | undefined;
}) {
  if (!anulacoes?.length) return null;
  return (
    <section data-testid="anulada-em" className="rounded-md border border-rose-200 bg-rose-50 p-3">
      <h3 className="flex items-center gap-1 text-sm font-semibold text-rose-800">
        <XCircle className="h-4 w-4" aria-hidden /> Anulada em
      </h3>
      <ul className="mt-2 flex flex-col gap-2 text-sm">
        {anulacoes.map((a) => (
          <li key={a.provaId} className="text-rose-900">
            <p>
              <span className="font-semibold">{nomeDaProva(a.provaId) ?? "Prova"}</span>
              {a.numero != null && `, Q${a.numero}`} · {rotuloDoMotivo(a.motivo)} ·{" "}
              {new Date(a.em).toLocaleDateString("pt-BR")}
            </p>
            <p className="break-words">{a.justificativa}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
