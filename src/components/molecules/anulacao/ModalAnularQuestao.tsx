import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  AnulacaoInput,
  JUSTIFICATIVA_MAX,
  JUSTIFICATIVA_MIN,
  justificativaValida,
  MotivoAnulacao,
  ROTULO_DO_MOTIVO,
} from "@/dtos/question/anulacao";
import { ReactNode, useState } from "react";
import { textoDoEfeito, TITULO_ANULAR } from "./textos";


/**
 * Motivo + justificativa obrigatória (tickets/042, D3). Usado para anular,
 * editar a justificativa e "adicionar como anulada" (card 08).
 *
 * ⚠️ Altura: o Dialog limita a altura, só o corpo rola e o rodapé fica fixo —
 * com o teclado aberto na justificativa, o botão continua na tela
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
    <Dialog open onOpenChange={(o) => !o && !ocupado && onCancelar()}>
      <DialogContent
        size="md"
        {...(provaNome ? {} : { "aria-describedby": undefined })}
        onInteractOutside={(e) => e.preventDefault()}
        banner={
          erro ? (
            <p
              role="alert"
              className="rounded-sm border border-destructive bg-destructive-muted p-2 text-body text-destructive"
            >
              {erro}
            </p>
          ) : undefined
        }
      >
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          {provaNome && (
            <DialogDescription>
              {provaNome}
              {numero != null && ` · questão ${numero}`}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {acima}
          <div className="flex flex-col gap-1">
            <label
              className="text-body font-semibold text-foreground"
              id="motivo-anulacao"
            >
              Motivo
            </label>
            <Select
              value={motivo}
              onValueChange={(v) => setMotivo(v as MotivoAnulacao)}
            >
              <SelectTrigger aria-labelledby="motivo-anulacao">
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
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
              className="text-body font-semibold text-foreground"
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
              className={`text-caption ${
                tamanho > 0 && tamanho < JUSTIFICATIVA_MIN
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {tamanho}/{JUSTIFICATIVA_MAX} (mínimo {JUSTIFICATIVA_MIN})
            </p>
          </div>
          <p className="rounded-sm border border-warning bg-warning-muted p-2 text-body text-foreground">
            {textoDoEfeito(numero)}
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onCancelar} disabled={ocupado}>
            Cancelar
          </Button>
          <Button
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
            {ocupado && <Spinner size="button" decorative />}
            {textoDoBotao}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
