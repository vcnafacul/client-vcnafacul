import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AnulacaoInput,
  JUSTIFICATIVA_MAX,
  JUSTIFICATIVA_MIN,
  justificativaValida,
  MotivoAnulacao,
  ROTULO_DO_MOTIVO,
} from "@/dtos/question/anulacao";
import { Loader2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { textoDoEfeito, TITULO_ANULAR } from "./textos";


/**
 * Motivo + justificativa obrigatória (tickets/042, D3). Usado para anular,
 * editar a justificativa e "adicionar como anulada" (card 08).
 *
 * ⚠️ Altura: `max-h-[calc(100dvh-2rem)]`, só o meio rola e o rodapé é
 * `shrink-0` — com o teclado aberto na justificativa, o botão continua na tela
 * (regra do vcnafacul-3/CLAUDE.md, client #919).
 */
export function ModalAnularQuestao({
  numero,
  provaNome,
  inicial,
  titulo = TITULO_ANULAR,
  textoDoBotao = "Anular",
  acima,
  ocupado = false,
  erro,
  onConfirmar,
  onCancelar,
}: {
  numero: number | null;
  provaNome?: string | null;
  inicial?: Partial<AnulacaoInput>;
  titulo?: string;
  textoDoBotao?: string;
  /** Conteúdo extra antes do formulário (ex.: o seletor de anulação do card 08). */
  acima?: ReactNode;
  ocupado?: boolean;
  erro?: string | null;
  onConfirmar: (dto: AnulacaoInput) => void;
  onCancelar: () => void;
}) {
  const [motivo, setMotivo] = useState<MotivoAnulacao | "">(
    inicial?.motivo ?? "",
  );
  const [justificativa, setJustificativa] = useState(
    inicial?.justificativa ?? "",
  );
  const tamanho = justificativa.trim().length;
  const ok = !!motivo && justificativaValida(justificativa);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 h-dvh"
    >
      <div className="w-full max-w-lg max-h-[calc(100dvh-2rem)] rounded-lg bg-white shadow-xl flex flex-col">
        <div className="shrink-0 px-4 pt-4">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          {provaNome && (
            <p className="text-sm text-gray-600">
              {provaNome}
              {numero != null && ` · questão ${numero}`}
            </p>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          {acima}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700" id="motivo-anulacao">
              Motivo
            </label>
            <Select
              value={motivo}
              onValueChange={(v) => setMotivo(v as MotivoAnulacao)}
            >
              <SelectTrigger aria-labelledby="motivo-anulacao">
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent className="z-[60]">
                {Object.values(MotivoAnulacao).map((m) => (
                  <SelectItem key={m} value={m}>
                    {ROTULO_DO_MOTIVO[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-semibold text-gray-700"
              htmlFor="justificativa-anulacao"
            >
              Justificativa
            </label>
            <Textarea
              id="justificativa-anulacao"
              value={justificativa}
              maxLength={JUSTIFICATIVA_MAX}
              rows={4}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Ex.: a alternativa C, dada como gabarito, está errada; nenhuma alternativa responde."
            />
            <p
              className={`text-xs ${
                tamanho > 0 && tamanho < JUSTIFICATIVA_MIN
                  ? "text-rose-600"
                  : "text-gray-500"
              }`}
            >
              {tamanho}/{JUSTIFICATIVA_MAX} (mínimo {JUSTIFICATIVA_MIN})
            </p>
          </div>
          <p className="text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded p-2">
            {textoDoEfeito(numero)}
          </p>
          {erro && (
            <p role="alert" className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded p-2">
              {erro}
            </p>
          )}
        </div>

        <div className="shrink-0 flex flex-wrap justify-end gap-2 border-t px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onCancelar} disabled={ocupado}>
            Cancelar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={!ok || ocupado}
            onClick={() =>
              ok &&
              onConfirmar({
                motivo: motivo as MotivoAnulacao,
                justificativa: justificativa.trim(),
              })
            }
          >
            {ocupado && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {textoDoBotao}
          </Button>
        </div>
      </div>
    </div>
  );
}
