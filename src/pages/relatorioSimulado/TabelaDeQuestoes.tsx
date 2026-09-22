import {
  DashListFooter,
  DashTable,
  dashV2,
  intervaloDaPagina,
  sortRows,
  type DashColumn,
  type SortState,
} from "@/components/dashV2";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { BarraDeDistribuicao } from "./BarraDeDistribuicao";
import { BotaoExportar } from "./BotaoExportar";
import { planilhaDeQuestoes } from "./exportar";
import { formatarPercentual, percentualDeAcerto } from "./percentuais";

export const TEXTO_SEM_QUESTOES = "Nenhuma questão com resposta ainda";

/** Mesmo padrão do `DashListTemplate`, que usa 25. */
export const QUESTOES_POR_PAGINA = 25;

/**
 * O vazio desta aba.
 *
 * ⚠️ **Não é o `DashTableVazio`**, que não recebe prop nenhuma: ele traz o
 * texto genérico e a dica "tente limpar os filtros", e esta tabela não tem
 * filtro. O próprio `DashTableEmpty.tsx` manda a tela passar um `emptyState`
 * próprio quando o vazio é "não existe registro ainda" — que é este caso.
 */
function VazioDeQuestoes() {
  return (
    <div
      data-testid="questoes-vazio"
      className="flex flex-col items-center gap-2 px-4 py-10 text-center"
    >
      <p className={cn("text-sm font-medium", dashV2.text.primary)}>
        {TEXTO_SEM_QUESTOES}
      </p>
      <p className={cn("text-xs", dashV2.text.secondary)}>
        As questões aparecem aqui conforme os cartões forem lidos.
      </p>
    </div>
  );
}

/**
 * ⚠️ **As larguras são o conserto do cabeçalho truncado**, não estética.
 *
 * O `<th>` do `DashTable` envolve o título num `<span class="truncate">` e põe
 * o ícone de ordenação ao lado. Com `6rem` sobram ~54px úteis depois do
 * `px-3` (24px), do ícone (14px) e do `gap` (4px) — e "Questão" ocupa ~58px em
 * `text-sm`. O título saía com reticências, que foi o defeito relatado.
 *
 * Medida aqui, na tela, e **não** mexendo no `DashTable`: o truncamento é
 * correto como comportamento geral (protege coluna estreita de quebrar o
 * layout); o que estava errado era a largura pedida por esta tabela.
 */
const colunas: DashColumn<QuestaoDoRelatorio>[] = [
  {
    id: "numero",
    header: "Questão",
    width: "7rem",
    primary: true,
    // ⚠️ Questão sem número não some: vai para o fim (o `sortRows` manda nulo
    // para o fim nas duas direções) e mostra travessão.
    cell: (q) => q.numero ?? "—",
    sortValue: (q) => q.numero,
  },
  /*
    ⚠️ **`Acertos`, `Erros` e `% de erro` SAÍRAM, e `Respondentes` entrou.**

    Não é troca de gosto. `% de acerto` **é** a coluna da alternativa correta —
    `acertos` conta `alternativaEstudante == alternativaCorreta`,
    `porAlternativa[X]` conta `alternativaEstudante == X`, e os dois percentuais
    dividem por `respondentes`. Era o mesmo número em duas colunas que não se
    identificavam como tal. E `erros` = `respondentes − acertos − semLeitura`,
    `% de erro` = `100 − %acerto − %semLeitura`: aritmética de primeiro grau.

    ⚠️ Isto **não** é crítica ao ms, que conta os três de forma independente de
    propósito (derivar tornaria vazio o teste da invariante). O que estava
    errado era exibir os três como se cada um trouxesse informação nova.

    ⚠️ E as colunas redundantes CUSTARAM uma coluna útil: a medição no docblock
    abaixo registra que 12 colunas estouravam a tela a 1565px, e a coluna
    agrupada de contagem teve de ser removida por isso.

    ⚠️ `Respondentes` entra na MESMA mudança que as remove, e a ordem importa:
    `acertos` é reconstruível de cabeça a partir de `% de acerto` ×
    `respondentes`, mas `respondentes` não é reconstruível de nada depois que
    `Acertos` e `Erros` saem. Ele era o único número que só existia no CSV.
  */
  {
    id: "respondentes",
    header: "Respondentes",
    width: "8.5rem",
    align: "right",
    cell: (q) => q.respondentes,
    sortValue: (q) => q.respondentes,
  },
  {
    id: "gabarito",
    header: "Gabarito",
    width: "6.5rem",
    align: "center",
    /*
      ⚠️ Existe para que o destaque nas colunas de alternativa seja
      REDUNDANTE, e não a única fonte de "qual é a correta".

      ⚠️ Travessão quando `null` (card 03: históricos que discordam do
      gabarito, ou nenhum histórico completo). Nunca a mais marcada por
      palpite — chutar inverteria a conclusão do professor.
    */
    cell: (q) => q.alternativaCorreta ?? "—",
    sortValue: (q) => q.alternativaCorreta,
  },
  {
    id: "acertoPercentual",
    header: "% de acerto",
    width: "9rem",
    align: "right",
    /*
      ⚠️ Sobre `respondentes`, não sobre `acertos + erros` — ver o docblock de
      `percentuais.ts`. Com este denominador, acerto% + erro% + semLeitura%
      fecha 100%, e quem não foi lido não some da conta.
    */
    cell: (q) => formatarPercentual(percentualDeAcerto(q)),
    // ⚠️ Ordena pelo número, não pelo texto: `sortValue` recebendo a string
    // formatada colocaria "9%" depois de "80%".
    sortValue: (q) => percentualDeAcerto(q),
  },
  {
    id: "distribuicao",
    header: "Distribuição",
    width: "13rem",
    /*
      ⚠️ **Substituiu as cinco colunas `A (%)`…`E (%)`** (card 19), e isto
      contradiz o que o docblock de largura abaixo defendia — de propósito. A
      razão está toda no `BarraDeDistribuicao`: forma compara melhor que
      dígito, e a coluna lida de cima a baixo mostra o distrator que pegou a
      turma mais rápido do que cinco percentuais — que era o objetivo
      declarado das cinco colunas.

      440px (5 × 5.5rem) viraram 208px. É essa largura que os cards 05 e 06
      precisavam, e é por isso que este card entra antes deles.
    */
    cell: (q) => <BarraDeDistribuicao questao={q} />,
    /*
      ⚠️ **Sem `sortValue`, de propósito.** Ordenar uma distribuição não é
      pergunta que alguém faça, e ordenar por "% que marcou D" deixou de ser
      possível — a perda que o card 19 registra e aceita. O que se ordena de
      verdade (`% de acerto`, `Respondentes`, `Sem leitura`) segue ordenável.
    */
  },
  {
    id: "semLeitura",
    // ⚠️ "Sem leitura", não "Em branco": o ms-omr descarta questão em branco e
    // dupla marcação do mesmo jeito. Chamar de branco afirma o que ninguém
    // verificou — e é o número que o professor usa para decidir o que revisar.
    header: "Sem leitura",
    width: "9rem",
    align: "right",
    cell: (q) => q.semLeitura,
    sortValue: (q) => q.semLeitura,
  },
];

export function TabelaDeQuestoes({
  questoes,
  estado,
  onRetry,
  nomeArquivo,
}: {
  questoes: QuestaoDoRelatorio[];
  estado: "idle" | "loading" | "error";
  onRetry?: () => void;
  /**
   * Nome do CSV, sem extensão. ⚠️ Opcional: sem ele o botão de exportar não
   * aparece, e é assim que os testes que só exercitam a tabela seguem valendo.
   */
  nomeArquivo?: string;
}) {
  const [sort, setSort] = useState<SortState | undefined>({
    columnId: "numero",
    direction: "asc",
  });
  const [pagina, setPagina] = useState(1);

  // ⚠️ O `DashTable` não ordena sozinho — ele só avisa. Quem ordena é o
  // `sortRows`, que já trata nulos no fim e ordenação estável.
  const ordenadas = useMemo(
    () => sortRows(questoes, colunas, sort),
    [questoes, sort],
  );

  /*
    ⚠️ Volta para a página 1 quando a lista encolhe abaixo da página atual.
    Sem isto, trocar de simulado com menos questões deixa a tabela numa página
    que não existe mais — vazia, sem dizer por quê.
  */
  useEffect(() => {
    const ultima = Math.max(1, Math.ceil(ordenadas.length / QUESTOES_POR_PAGINA));
    if (pagina > ultima) setPagina(1);
  }, [ordenadas.length, pagina]);

  const daPagina = useMemo(() => {
    const { inicio, fim } = intervaloDaPagina(
      pagina,
      QUESTOES_POR_PAGINA,
      ordenadas.length,
    );
    // ⚠️ `intervaloDaPagina` devolve posições para humano (1-based, fim
    // inclusivo); `slice` quer índice 0-based com fim exclusivo. Reusar a
    // função é o que mantém o rodapé e a fatia em acordo — duas contas
    // separadas divergiriam na primeira mudança de `pageSize`.
    return ordenadas.slice(inicio - 1, fim);
  }, [ordenadas, pagina]);

  /*
    ⚠️ Das questões INTEIRAS, não de `daPagina`: paginação é de leitura na
    tela, não de escopo. Exportar só a página aberta daria uma planilha
    incompleta sem aviso nenhum.

    ⚠️ E de `ordenadas`, para o arquivo sair na mesma ordem que a pessoa está
    vendo — é o que faz conferir tela contra planilha não virar quebra-cabeça.
  */
  const planilha = useMemo(() => planilhaDeQuestoes(ordenadas), [ordenadas]);

  return (
    <div className="flex flex-col">
      {nomeArquivo !== undefined && (
        <div
          className={cn(
            "flex justify-end border-b px-4 py-2 print:hidden",
            dashV2.surface,
            dashV2.border,
          )}
        >
          <BotaoExportar planilha={planilha} nomeArquivo={nomeArquivo} />
        </div>
      )}
      <DashTable<QuestaoDoRelatorio>
        rows={daPagina}
        columns={colunas}
        rowKey={(q) => q.questaoId}
        sort={sort}
        onSortChange={setSort}
        state={estado}
        onRetry={onRetry}
        stickyHeader
        emptyState={<VazioDeQuestoes />}
      />
      {/*
        ⚠️ O mesmo rodapé das outras telas do dashV2, reusado como componente
        autônomo. O `DashListTemplate` traz este rodapé de graça, mas lê as
        linhas do `DashCardContext` do V1 (`entities`, `setEntities`,
        `getMoreCards`, `cardTransformation`) — esta tela nunca viveu nesse
        contexto, e montá-lo aqui seria inventar campos que não existem.

        ⚠️ `print:hidden`: numa folha impressa a paginação não é acionável, e a
        pessoa está vendo a página que mandou imprimir.
      */}
      <div className="print:hidden">
        <DashListFooter
          pagina={pagina}
          pageSize={QUESTOES_POR_PAGINA}
          total={ordenadas.length}
          onPageChange={setPagina}
        />
      </div>
    </div>
  );
}
