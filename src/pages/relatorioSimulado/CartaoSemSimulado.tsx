import ModalTemplate from "@/components/templates/modalTemplate";
import { dashV2 } from "@/components/dashV2";
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
    <ModalTemplate
      isOpen
      handleClose={onClose}
      className="w-full max-w-lg rounded-lg bg-white p-4 shadow-xl"
    >
      <div className="flex flex-col gap-4">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              className={cn(
                "truncate text-lg font-semibold",
                dashV2.text.primary,
              )}
            >
              {linha.nome}
            </h2>
            <p className={cn("text-xs", dashV2.text.muted)}>
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
        </header>

        <p
          className={cn("text-sm", dashV2.text.secondary)}
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
      </div>
    </ModalTemplate>
  );
}
