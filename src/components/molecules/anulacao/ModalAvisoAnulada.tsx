import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnulacaoDaQuestao, AnulacaoInput, rotuloDoMotivo } from "@/dtos/question/anulacao";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { ModalAnularQuestao } from "./ModalAnularQuestao";
import { tituloDoAviso } from "./textos";

export type EntradaDaAnulada =
  | { modo: "normal" }
  | { modo: "anulada"; anulacao: AnulacaoInput };

/**
 * A questão que vai entrar na prova já foi anulada em outra (tickets/042, D4).
 * Três saídas: Cancelar · Adicionar normal · Adicionar como anulada (motivo e
 * justificativa de uma das anulações, editáveis).
 *
 * ⚠️ A lista rola (corpo do Dialog) e os botões ficam fixos: com 4 anulações e justificativas
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
              <label htmlFor="anulacao-base" className="text-body font-semibold text-foreground">
                Usar a justificativa de
              </label>
              <select
                id="anulacao-base"
                className="h-9 rounded-md border border-input bg-transparent px-2 text-body"
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
    <Dialog open onOpenChange={(o) => !o && !ocupado && onCancelar()}>
      <DialogContent size="md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-start gap-2">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-warning"
              aria-hidden
            />
            {tituloDoAviso(anulacoes.length)}
          </DialogTitle>
        </DialogHeader>
        <ul data-testid="anulacoes-do-aviso" className="flex flex-col gap-2">
          {anulacoes.map((a, i) => (
            <li
              key={`${a.provaId}-${i}`}
              className="rounded-md border border-border bg-page p-2 text-body"
            >
              <p>
                <span className="font-semibold">{a.provaNome ?? "Prova"}</span>
                {a.numero != null && `, Q${a.numero}`}:{" "}
                <span className="font-semibold">{rotuloDoMotivo(a.motivo)}</span>
              </p>
              <p className="break-words text-foreground">“{a.justificativa}”</p>
            </li>
          ))}
          <li className="text-body text-foreground">
            Ela pode ter o mesmo problema na sua prova.
          </li>
        </ul>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancelar} disabled={ocupado}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            disabled={ocupado}
            onClick={() => onEscolher({ modo: "normal" })}
          >
            Adicionar normal
          </Button>
          <Button
            variant="destructive"
            disabled={ocupado}
            onClick={() => setComoAnulada(true)}
          >
            Adicionar como anulada
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
