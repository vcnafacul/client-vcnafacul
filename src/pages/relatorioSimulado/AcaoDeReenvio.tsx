import { dashV2 } from "@/components/dashV2";
import type { FalhaHistorico } from "@/dtos/cartaoResposta/resultados";
import { cn } from "@/lib/utils";
import { reprocessarCartao } from "@/services/cartaoResposta/reprocessarCartao";
import { useRef, useState } from "react";

export const TEXTO_REENVIAR = "Reenviar foto";
export const TEXTO_REPROCESSAR = "Tentar de novo";
export const TEXTO_ENVIANDO = "Enviando…";
export const TEXTO_ERRO_GENERICO = "Não foi possível reprocessar";

/**
 * As ações que ESTA versão da tela sabe oferecer.
 *
 * ⚠️ **Lista de permitidos, não lista de proibidos.** Mesma postura do
 * `STATUS_CONHECIDOS` do `DetalheDoEstudante`: o ms pode ganhar uma ação nova
 * antes do client, e um `!== "falar_com_suporte"` transformaria qualquer valor
 * desconhecido no botão de reprocessar — que é afirmar, para uma falha que
 * esta tela não entende, que tentar de novo resolve.
 */
const ACOES_CONHECIDAS = ["reprocessar", "reenviar_foto"] as const;

/**
 * O que oferecer depende do `acaoSugerida` que o ms manda pronto.
 *
 * ⚠️ **A tela não conhece código de erro nenhum** — é o ponto do mapa dos 13
 * códigos no ms: reclassificar um código, ou reescrever uma mensagem, não toca
 * em componente. O `codigo` só viaja junto; quem decide é a ação.
 *
 * ⚠️ E são DUAS ações, não uma. `reprocessar` cobre `motor_timeout`,
 * `armazenamento_indisponivel` e `omr_indisponivel`: falhou a infra, a foto
 * está boa. Oferecer "reenviar foto" nesses casos faria o cursinho
 * refotografar à toa.
 */
export function AcaoDeReenvio({
  token,
  historicoId,
  falha,
  onReenviado,
}: {
  token: string;
  historicoId: string;
  falha: FalhaHistorico;
  onReenviado: () => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const enviandoRef = useRef(false);

  const acao = ACOES_CONHECIDAS.find((a) => a === falha.acaoSugerida);
  if (!acao) return null;

  const pedeFoto = acao === "reenviar_foto";

  const enviar = async (file?: File) => {
    // ⚠️ `ref`, e não só o `enviando` do estado: dois `onChange`/`click` no
    // mesmo tick leem o mesmo `enviando` velho, e a segunda tentativa cai na
    // janela entre tentativas do ms e volta como recusa — com a primeira ainda
    // em voo.
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    setEnviando(true);
    setErro(null);
    try {
      await reprocessarCartao(token, historicoId, file);
      onReenviado();
    } catch (e) {
      // ⚠️ A mensagem do backend inteira: ela diz QUAL cartão divergiu, ou
      // quantos segundos faltam para a próxima tentativa. Um texto genérico
      // apaga justamente a parte acionável — e manda a pessoa clicar de novo
      // na hora, e de novo.
      setErro(e instanceof Error ? e.message : TEXTO_ERRO_GENERICO);
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      {pedeFoto && (
        <label
          className={cn(
            "flex flex-col items-start gap-1 text-sm font-medium",
            dashV2.text.primary,
          )}
        >
          {TEXTO_REENVIAR}
          <input
            type="file"
            accept="image/*"
            disabled={enviando}
            onChange={(e) => {
              const file = e.target.files?.[0];
              // ⚠️ Limpa o campo: sem isto, escolher O MESMO arquivo depois de
              // uma recusa não dispara `change` nenhum (o browser só emite
              // quando o valor muda) e o botão fica mudo justamente na
              // tentativa que a pessoa faria depois de esperar os 42s.
              e.target.value = "";
              if (file) void enviar(file);
            }}
            className={cn("text-sm font-normal", dashV2.text.secondary)}
          />
        </label>
      )}

      {!pedeFoto && (
        <button
          type="button"
          disabled={enviando}
          onClick={() => void enviar()}
          className={cn(
            "rounded-sm text-sm font-medium underline-offset-2 hover:underline disabled:no-underline disabled:opacity-60",
            dashV2.text.primary,
            dashV2.focus,
          )}
        >
          {enviando ? TEXTO_ENVIANDO : TEXTO_REPROCESSAR}
        </button>
      )}

      {pedeFoto && enviando && (
        <p className={cn("text-sm", dashV2.text.secondary)}>{TEXTO_ENVIANDO}</p>
      )}

      {erro && (
        <p className={cn("text-sm", dashV2.text.secondary)} role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

export default AcaoDeReenvio;
