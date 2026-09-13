import { dashV2 } from "@/components/dashV2";
import { cn } from "@/lib/utils";
import {
  faixasDoProgresso,
  TEXTO_SEM_QUESTOES,
  TITULO_SEM_QUESTOES,
  tituloDoProgresso,
  type ContagensDaProva,
} from "./progresso";

/**
 * A célula da coluna Progresso.
 *
 * ⚠️ **Só o desenho mora aqui.** O cálculo das faixas está em `progresso.ts`,
 * separado por dois motivos: ele é testável sem montar React, e um `.tsx` que
 * exporta componente **e** funções puras derruba o `react-refresh` do projeto
 * (que é warning, e o projeto não tolera warning).
 */
export function ProgressoCell({ prova }: { prova: ContagensDaProva }) {
  const faixas = faixasDoProgresso(prova);

  if (!faixas) {
    return (
      <span
        data-testid="progresso"
        data-sem-questoes="true"
        title={TITULO_SEM_QUESTOES}
        className={cn("block text-sm", dashV2.text.muted)}
      >
        {TEXTO_SEM_QUESTOES}
      </span>
    );
  }

  return (
    <div
      data-testid="progresso"
      title={tituloDoProgresso(prova)}
      className="flex items-center gap-2"
    >
      {/*
        ⚠️ `aria-hidden`: a barra é redundante com o texto ao lado, e um leitor
        de tela anunciando duas vezes a mesma proporção — uma como progressbar
        sem rótulo — atrapalha mais do que informa. O número é o conteúdo.
      */}
      <div
        aria-hidden="true"
        className={cn(
          "flex h-1.5 min-w-0 flex-1 overflow-hidden rounded-full",
          dashV2.progress.track,
        )}
      >
        <div
          data-faixa="validadas"
          style={{ width: `${faixas.pctValidadas}%` }}
          className={dashV2.progress.done}
        />
        <div
          data-faixa="pendentes"
          style={{ width: `${faixas.pctPendentes}%` }}
          className={dashV2.progress.pending}
        />
      </div>
      <span
        className={cn("shrink-0 whitespace-nowrap text-xs tabular-nums", dashV2.text.secondary)}
      >
        {prova.totalQuestaoValidadas ?? 0}/{prova.totalQuestao ?? 0}
      </span>
    </div>
  );
}

export default ProgressoCell;
