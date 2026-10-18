import { Button } from "@/components/ui/button";
import { AnulacaoDaQuestao, AnulacaoInput, rotuloDoMotivo } from "@/dtos/question/anulacao";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { ModalAnularQuestao } from "./ModalAnularQuestao";
import { TITULO_AVISO_ANULADA, tituloDoAviso } from "./textos";

export type EntradaDaAnulada =
  | { modo: "normal" }
  | { modo: "anulada"; anulacao: AnulacaoInput };

/**
 * A questão que vai entrar na prova já foi anulada em outra (tickets/042, D4).
 * Três saídas: Cancelar · Adicionar normal · Adicionar como anulada (motivo e
 * justificativa de uma das anulações, editáveis).
 *
 * ⚠️ A lista rola e os botões ficam fixos: com 4 anulações e justificativas
 * longas, o rodapé não pode sair da tela em 360 px.
 */
export function ModalAvisoAnulada({
  anulacoes,
  numero,
  provaNome,
  ocupado = false,
  onEscolher,
  onCancelar,
}: {
  anulacoes: AnulacaoDaQuestao[];
  /** O número que a questão vai ocupar na prova nova. */
  numero: number | null;
  provaNome?: string | null;
  ocupado?: boolean;
  onEscolher: (e: EntradaDaAnulada) => void;
  onCancelar: () => void;
}) {
  const [comoAnulada, setComoAnulada] = useState(false);
  const [base, setBase] = useState(0);

  if (comoAnulada) {
    const escolhida = anulacoes[base];
    return (
      <ModalAnularQuestao
        // `key`: trocar a anulação de base recarrega motivo e justificativa.
        key={base}
        numero={numero}
        provaNome={provaNome}
        titulo="Adicionar como anulada"
        textoDoBotao="Adicionar como anulada"
        inicial={{ motivo: escolhida?.motivo, justificativa: escolhida?.justificativa }}
        ocupado={ocupado}
        acima={
          anulacoes.length > 1 ? (
            <div className="flex flex-col gap-1">
              <label htmlFor="anulacao-base" className="text-sm font-semibold text-gray-700">
                Usar a justificativa de
              </label>
              <select
                id="anulacao-base"
                className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
                value={base}
                onChange={(e) => setBase(Number(e.target.value))}
              >
                {anulacoes.map((a, i) => (
                  <option key={`${a.provaId}-${i}`} value={i}>
                    {a.provaNome ?? "Prova"}
                    {a.numero != null ? `, Q${a.numero}` : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : null
        }
        onConfirmar={(anulacao) => onEscolher({ modo: "anulada", anulacao })}
        onCancelar={() => setComoAnulada(false)}
      />
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={TITULO_AVISO_ANULADA}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 h-dvh"
    >
      <div className="w-full max-w-lg max-h-[calc(100dvh-2rem)] rounded-lg bg-white shadow-xl flex flex-col">
        <div className="shrink-0 px-4 pt-4 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
          <h2 className="text-lg font-semibold">{tituloDoAviso(anulacoes.length)}</h2>
        </div>
        <ul
          data-testid="anulacoes-do-aviso"
          className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-2"
        >
          {anulacoes.map((a, i) => (
            <li key={`${a.provaId}-${i}`} className="rounded-md border border-gray-200 bg-gray-50 p-2 text-sm">
              <p>
                <span className="font-semibold">{a.provaNome ?? "Prova"}</span>
                {a.numero != null && `, Q${a.numero}`}:{" "}
                <span className="font-semibold">{rotuloDoMotivo(a.motivo)}</span>
              </p>
              <p className="text-gray-700 break-words">“{a.justificativa}”</p>
            </li>
          ))}
          <li className="text-sm text-gray-700">Ela pode ter o mesmo problema na sua prova.</li>
        </ul>
        <div className="shrink-0 flex flex-wrap justify-end gap-2 border-t px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onCancelar} disabled={ocupado}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={ocupado}
            onClick={() => onEscolher({ modo: "normal" })}
          >
            Adicionar normal
          </Button>
          <Button size="sm" variant="destructive" disabled={ocupado} onClick={() => setComoAnulada(true)}>
            Adicionar como anulada
          </Button>
        </div>
      </div>
    </div>
  );
}
