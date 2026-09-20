import { dashV2 } from "@/components/dashV2";
import { cn } from "@/lib/utils";
import { exportAnalyticsCsv } from "@/utils/exportAnalyticsCsv";
import type { Planilha } from "./exportar";

export const TEXTO_EXPORTAR = "Exportar CSV";
export const TEXTO_SEM_DADOS = "Nada para exportar";

/**
 * Baixa uma {@link Planilha} como CSV.
 *
 * ⚠️ **Recebe a planilha PRONTA, e não os dados crus.** Montar as colunas aqui
 * faria cada aba repetir a regra de quais campos exportar, e a divergência com
 * a tabela apareceria só quando alguém abrisse o arquivo.
 *
 * ⚠️ Desabilitado sem linha nenhuma, em vez de escondido: um botão que some
 * deixa a pessoa procurando onde ele foi parar. Desabilitado com o rótulo
 * trocado diz que a exportação existe e por que não dá agora.
 */
export function BotaoExportar({
  planilha,
  nomeArquivo,
  rotulo = TEXTO_EXPORTAR,
}: {
  planilha: Planilha;
  nomeArquivo: string;
  /** Diferencia os dois botões da tela para quem usa leitor de tela. */
  rotulo?: string;
}) {
  const vazio = planilha.linhas.length === 0;

  return (
    <button
      type="button"
      data-testid="exportar-csv"
      disabled={vazio}
      onClick={() =>
        exportAnalyticsCsv(planilha.cabecalho, planilha.linhas, nomeArquivo)
      }
      className={cn(
        "h-9 rounded-md px-3 text-sm font-medium",
        "disabled:cursor-not-allowed disabled:opacity-60",
        dashV2.action.secondary,
        dashV2.focus,
      )}
    >
      {vazio ? TEXTO_SEM_DADOS : rotulo}
    </button>
  );
}
