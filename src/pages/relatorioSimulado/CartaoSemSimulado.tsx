import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { AcaoDeReenvio } from "./AcaoDeReenvio";
import { BaixarFotoDoCartao } from "./BaixarFotoDoCartao";
import { ExcluirEnvioDoCartao } from "./ExcluirEnvioDoCartao";

export const TEXTO_AGUARDANDO_IDIOMA =
  "O cartão foi enviado e aguarda a leitura. O simulado (Inglês ou Espanhol) sai do idioma marcado no cartão.";
export const TEXTO_FALHOU_ANTES_DO_IDIOMA =
  "A leitura falhou antes de o idioma ser lido. Reenvie a foto do cartão.";

/**
 * tickets/038 (card 14) — o cartão DA PROVA que ainda não tem simulado: aguardando a leitura
 * do idioma, ou com falha antes dela.
 *
 * ⚠️ Um modal próprio, e não o `DetalheDoEstudante`: o detalhe é buscado por SIMULADO, e este
 * cartão ainda não tem um. As ações são as do detalhe — reenviar, baixar a foto e excluir —
 * todas por histórico, e o ms acha o cartão pela linha "aguardando simulado" (card 13).
 */
export function CartaoSemSimulado({
  token,
  linha,
  onClose,
  onMudou,
}: {
  token: string;
  linha: LinhaDoRelatorio & { historicoId: string };
  onClose: () => void;
  /** Reenviado ou excluído: a tela recarrega. */
  onMudou: () => void;
}) {
  const falhou = linha.status === "failed";
  return (
    <Dialog open onOpenChange={(aberto) => !aberto && onClose()}>
      {/* tickets/059 D21: era max-w-lg (512px), então `md`. Sem formulário: clicar fora fecha. */}
      <DialogContent size="md" aria-describedby={undefined}>
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-10">
            <div className="min-w-0">
              <DialogTitle
                className={cn(
                  "truncate pr-0 text-h3 font-semibold",
                  "text-foreground",
                )}
              >
                {linha.nome}
              </DialogTitle>
              <p className={cn("text-caption", "text-muted-foreground")}>
                {linha.matricula}
              </p>
            </div>
            <BaixarFotoDoCartao
              token={token}
              historicoId={linha.historicoId}
              matricula={linha.matricula}
            />
            <ExcluirEnvioDoCartao
              token={token}
              historicoId={linha.historicoId}
              nome={linha.nome}
              matricula={linha.matricula}
              onExcluido={onMudou}
            />
          </div>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
        <p
          className={cn("text-body", "text-muted-foreground")}
          data-testid="cartao-sem-simulado"
        >
          {falhou
            ? (linha.falha?.descricao ?? TEXTO_FALHOU_ANTES_DO_IDIOMA)
            : TEXTO_AGUARDANDO_IDIOMA}
        </p>

        {falhou && linha.falha && (
          <AcaoDeReenvio
            token={token}
            historicoId={linha.historicoId}
            falha={linha.falha}
            onReenviado={onMudou}
          />
        )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
