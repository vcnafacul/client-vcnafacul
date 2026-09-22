import { dashV2 } from "@/components/dashV2";
import { cn } from "@/lib/utils";
import {
  FILTROS,
  ROTULO_DO_FILTRO,
  type FiltroDoDetalhe,
} from "./filtroDoDetalhe";

/**
 * Os três chips de filtro do modal.
 *
 * O modal abre em 90 linhas, e a pergunta de quem abriu é **"o que ele errou"**
 * — respondida hoje rolando a lista procurando badges. Com o bloco de resumo do
 * card 10 no topo, a tabela ficou ainda mais longe.
 *
 * ⚠️ **O contador faz parte do rótulo**, como o toggle "Mostrar quem não
 * enviou" da tela já faz: sem ele, uma tabela de 19 linhas num simulado de 90
 * fica sem explicação — e é o número que diz se vale acionar o filtro.
 *
 * ⚠️ **Chip com zero fica DESABILITADO, não escondido.** "Sem leitura (0)" é
 * informação boa: diz que o cartão foi lido inteiro. Sumir faria o conjunto de
 * chips mudar de tamanho entre alunos, e o olho persegue o movimento.
 *
 * ⚠️ `print:hidden`: é controle, e a folha sai com o que está filtrado.
 */
export function ChipsDoDetalhe({
  contagens,
  ativo,
  aoTrocar,
}: {
  contagens: Record<FiltroDoDetalhe, number>;
  ativo: FiltroDoDetalhe;
  aoTrocar: (f: FiltroDoDetalhe) => void;
}) {
  return (
    <div
      data-testid="chips-do-detalhe"
      role="group"
      aria-label="Filtrar respostas"
      className="flex flex-wrap gap-2 print:hidden"
    >
      {FILTROS.map((f) => {
        const n = contagens[f];
        /*
          ⚠️ O "Tudo" nunca desabilita, mesmo com zero: ele é o estado neutro, e
          desabilitar o único chip ativo deixaria a pessoa presa num filtro.
        */
        const desabilitado = f !== "tudo" && n === 0;
        const selecionado = ativo === f;

        return (
          <button
            key={f}
            type="button"
            data-chip={f}
            aria-pressed={selecionado}
            disabled={desabilitado}
            onClick={() => aoTrocar(f)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              "disabled:cursor-not-allowed disabled:opacity-40",
              dashV2.border,
              dashV2.focus,
              selecionado
                ? cn(dashV2.action.primary, "border-transparent")
                : cn(dashV2.surface, dashV2.text.secondary),
            )}
          >
            {ROTULO_DO_FILTRO[f]} ({n})
          </button>
        );
      })}
    </div>
  );
}
