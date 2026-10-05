import { AlertDialogUI } from "@/components/atoms/alertDialogUI";
import { dashV2 } from "@/components/dashV2";
import { cn } from "@/lib/utils";
import { excluirEnvioDoCartao } from "@/services/cartaoResposta/excluirEnvioDoCartao";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import { toast } from "react-toastify";

export const TEXTO_EXCLUIR_ENVIO = "Excluir envio";
export const TEXTO_ENVIO_EXCLUIDO =
  "Envio excluído. Agora é possível enviar o cartão para o aluno certo.";

/**
 * Card 36 — desfaz um cartão enviado para o aluno errado.
 *
 * ⚠️ A confirmação diz o que some (nota, relatório, foto) e que o aluno volta
 * a "Não enviou": é a ação que não se desfaz, e a pessoa precisa saber que não
 * está "trocando de aluno" — o cartão certo é um envio novo.
 *
 * ⚠️ Quem monta só renderiza com `historicoId`, como o `BaixarFotoDoCartao`.
 */
export function ExcluirEnvioDoCartao({
  token,
  historicoId,
  nome,
  matricula,
  onExcluido,
}: {
  token: string;
  historicoId: string;
  nome: string;
  matricula: string | null;
  onExcluido: () => void;
}) {
  const [excluindo, setExcluindo] = useState(false);

  const excluir = async () => {
    setExcluindo(true);
    try {
      await excluirEnvioDoCartao(token, historicoId);
      toast.success(TEXTO_ENVIO_EXCLUIDO);
      onExcluido();
    } catch (erro) {
      toast.error((erro as Error).message);
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <AlertDialogUI
      title="Excluir este envio?"
      description={`O cartão de ${nome}${matricula ? ` (${matricula})` : ""} sai do relatório, com a nota e a foto, e o aluno volta a "Não enviou". Não dá para desfazer.`}
      onConfirm={excluir}
    >
      <AlertDialogTrigger asChild>
        <button
          type="button"
          data-testid="excluir-envio-do-cartao"
          disabled={excluindo}
          className={cn(
            "shrink-0 rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 disabled:opacity-50",
            dashV2.focus,
          )}
        >
          {excluindo ? "Excluindo…" : TEXTO_EXCLUIR_ENVIO}
        </button>
      </AlertDialogTrigger>
    </AlertDialogUI>
  );
}
