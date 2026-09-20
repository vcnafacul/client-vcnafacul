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
import {
  formatarPercentual,
  percentualDaAlternativa,
  percentualDeAcerto,
  percentualDeErro,
} from "./percentuais";

const ALTERNATIVAS = ["A", "B", "C", "D", "E"] as const;

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
  {
    id: "acertos",
    header: "Acertos",
    width: "7rem",
    align: "right",
    cell: (q) => q.acertos,
    sortValue: (q) => q.acertos,
  },
  {
    id: "erros",
    header: "Erros",
    width: "6.5rem",
    align: "right",
    cell: (q) => q.erros,
    sortValue: (q) => q.erros,
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
  /*
    ⚠️ **Uma coluna por alternativa**, e não uma só com as cinco dentro.

    Agrupadas, os percentuais viravam um bloco de texto que não dá para
    comparar entre linhas nem ordenar. Separadas, a coluna inteira é lida de
    cima a baixo — que é como se acha o distrator que pegou a turma — e cada
    uma ordena sozinha.

    ⚠️ **Estas cinco substituíram a coluna agrupada de contagem** (`A 12 B 3
    C 2...`), e a razão é largura, MEDIDA:

    | tela   | sidebar¹           | útil (−`p-4`) | 12 colunas (1448px) |
    |--------|--------------------|---------------|---------------------|
    | 1440px | fora do fluxo      | 1408px        | cabe                |
    | 1565px | entra, 16rem       | 1277px        | **estoura em 171px**|

    ¹ O `xl` deste projeto é **1565px** (customizado em `tailwind.config`), e a
    sidebar é `absolute xl:relative` — abaixo disso ela não ocupa largura. É
    justamente quando ela entra no fluxo que a tabela larga deixaria de caber.

    Sem a coluna agrupada são 1192px, que cabem nos dois casos.

    Encolher não era saída: o `<th>` trunca o título, e "Sem leitura" e
    "% de acerto" já estão no limite — era o defeito que este mesmo trabalho
    consertou. Pôr `overflow-x` num container também não: o próprio
    `DashTable` documenta que um ancestral com overflow vira o scrollport do
    `position: sticky` e faz o cabeçalho grudado sumir.

    Os números crus continuam em "Acertos", "Erros" e "Sem leitura".

    ⚠️ A soma das cinco NÃO fecha 100%: `semLeitura` (branco ou dupla
    marcação) não entra em `porAlternativa`. A diferença é justamente ela, e a
    coluna "Sem leitura" ao lado é quem a explica.
  */
  ...ALTERNATIVAS.map(
    (alt): DashColumn<QuestaoDoRelatorio> => ({
      id: `alternativa${alt}`,
      header: `${alt} (%)`,
      // ⚠️ 5.5rem: o `<th>` trunca o título e ainda põe o ícone de ordenação
      // ao lado. Com 5rem sobram ~38px para "A (%)", que ocupa ~35px — é o
      // aperto que cortou os títulos antes deste ajuste.
      width: "5.5rem",
      align: "right",
      cell: (q) => formatarPercentual(percentualDaAlternativa(q, alt)),
      // ⚠️ Ordena pelo número, não pelo texto: com a string formatada, "9%"
      // viria depois de "80%".
      sortValue: (q) => percentualDaAlternativa(q, alt),
    }),
  ),
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
    id: "erroPercentual",
    header: "% de erro",
    width: "8.5rem",
    align: "right",
    cell: (q) => formatarPercentual(percentualDeErro(q)),
    sortValue: (q) => percentualDeErro(q),
  },
];

export function TabelaDeQuestoes({
  questoes,
  estado,
  onRetry,
}: {
  questoes: QuestaoDoRelatorio[];
  estado: "idle" | "loading" | "error";
  onRetry?: () => void;
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

  return (
    <div className="flex flex-col">
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
