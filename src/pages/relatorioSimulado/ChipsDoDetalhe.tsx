import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  FILTROS,
  ROTULO_DO_FILTRO,
  type FiltroDoDetalhe,
} from "./filtroDoDetalhe";

/**
 * Os três filtros do modal, no SegmentedControl do design system (o mesmo das abas
 * de listagem).
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
  /*
    ⚠️ O "Tudo" nunca desabilita, mesmo com zero: ele é o estado neutro, e
    desabilitar o único chip ativo deixaria a pessoa presa num filtro.
  */
  return (
    <div data-testid="chips-do-detalhe" className="print:hidden">
      <SegmentedControl
        size="sm"
        aria-label="Filtrar respostas"
        value={ativo}
        onValueChange={(v) => aoTrocar(v as FiltroDoDetalhe)}
        options={FILTROS.map((f) => ({
          value: f,
          label: `${ROTULO_DO_FILTRO[f]} (${contagens[f]})`,
          disabled: f !== "tudo" && contagens[f] === 0,
        }))}
      />
    </div>
  );
}
