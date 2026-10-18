import { AnulacaoNaProva, rotuloDoMotivo } from "@/dtos/question/anulacao";
import { ChevronDown, ChevronUp, XCircle } from "lucide-react";
import { useState } from "react";

/**
 * "Anulada em" no modal da questão (tickets/042, cards 08 e 21): o ÚNICO aviso
 * de anulação da aba — o bloco repetido embaixo do campo Prova saiu no 21.
 *
 * - 1 prova: tudo à vista (prova, número, motivo, data, justificativa).
 * - 2 ou mais: uma linha por prova, e as justificativas atrás de "Ver
 *   justificativas" — com várias provas o texto empurrava o formulário para
 *   baixo.
 * - A prova em foco no seletor ganha a marca "nesta prova".
 */
export function AnuladaEm({
  anulacoes,
  nomeDaProva,
  provaEmFoco,
}: {
  anulacoes?: AnulacaoNaProva[];
  nomeDaProva: (provaId: string) => string | undefined;
  provaEmFoco?: string;
}) {
  const [aberto, setAberto] = useState(false);
  if (!anulacoes?.length) return null;
  const varias = anulacoes.length > 1;
  const mostrarJustificativa = !varias || aberto;
  return (
    <section data-testid="anulada-em" className="rounded-md border border-rose-200 bg-rose-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-1 text-sm font-semibold text-rose-800">
          <XCircle className="h-4 w-4" aria-hidden />
          {varias ? `Anulada em ${anulacoes.length} provas` : "Anulada em"}
        </h3>
        {varias && (
          <button
            type="button"
            aria-expanded={aberto}
            onClick={() => setAberto((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-rose-700 hover:text-rose-900 hover:underline"
          >
            {aberto ? "Ocultar justificativas" : "Ver justificativas"}
            {aberto ? <ChevronUp className="h-3 w-3" aria-hidden /> : <ChevronDown className="h-3 w-3" aria-hidden />}
          </button>
        )}
      </div>
      <ul className="mt-2 flex flex-col gap-2 text-sm">
        {anulacoes.map((a) => (
          <li key={a.provaId} className="text-rose-900">
            <p>
              <span className="font-semibold">{nomeDaProva(a.provaId) ?? "Prova"}</span>
              {a.numero != null && `, Q${a.numero}`} · {rotuloDoMotivo(a.motivo)} ·{" "}
              {new Date(a.em).toLocaleDateString("pt-BR")}
              {a.provaId === provaEmFoco && (
                <span className="ml-2 rounded bg-rose-200 px-1.5 py-0.5 text-[11px] font-semibold text-rose-800">
                  nesta prova
                </span>
              )}
            </p>
            {mostrarJustificativa && <p className="break-words">{a.justificativa}</p>}
          </li>
        ))}
      </ul>
      {!varias && (
        <p className="mt-1 text-xs text-rose-700">Fora da análise: não conta na nota nem nos relatórios.</p>
      )}
    </section>
  );
}
