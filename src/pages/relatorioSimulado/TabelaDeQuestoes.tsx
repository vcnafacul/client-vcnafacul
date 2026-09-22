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
import { BotaoExportar } from "./BotaoExportar";
import { planilhaDeQuestoes } from "./exportar";
import {
  formatarPercentual,
  percentualDaAlternativa,
  percentualDeAcerto,
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

    Sem a coluna agrupada eram 1192px, que cabiam nos dois casos.

    ⚠️ **Medição refeita no card 04**, que removeu `Acertos`, `Erros` e
    `% de erro` e acrescentou `Respondentes` e `Gabarito` — 11 colunas viraram
    10, e a soma das larguras caiu de 1192px para **1080px**:

    | coluna         | largura |
    |----------------|---------|
    | Questão        | 7rem    |
    | Respondentes   | 8.5rem  |
    | Gabarito       | 6.5rem  |
    | % de acerto    | 9rem    |
    | A–E (%)        | 5×5.5rem|
    | Sem leitura    | 9rem    |

    No pior caso (1565px, sidebar no fluxo) sobram **197px**. É essa folga que
    paga as colunas que os cards 05 e 06 vão pedir — o espaço que as colunas
    derivadas ocupavam.

    ⚠️ **Encolher largura continua proibido**, e por medição, não por gosto: o
    `<th>` trunca o título, e foi esse aperto que produziu o cabeçalho cortado
    consertado antes deste card. Quem precisar de mais espaço tira coluna ou
    reagrupa conteúdo (é o que o card 19 faz), nunca aperta.

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
      /*
        ⚠️ **O destaque é por CÉLULA, e o card 04 pedia no cabeçalho.**

        Um `<th>` marcado (`C ✓ (%)`) afirmaria que C é a correta da tabela
        inteira — e o gabarito é POR QUESTÃO. Já erraria na segunda linha da
        lista. O destaque tem de viver onde o dado vive.

        ⚠️ **Marcador TEXTUAL, não só cor.** Mesma regra do
        `rotuloDoResultado`: o `green3` do `tokens.ts` mede 3.77:1 e não passa
        para texto pequeno, e "qual é a correta" é a informação que torna estas
        cinco colunas legíveis — não pode depender de enxergar verde. O peso de
        fonte é reforço; a coluna `Gabarito` é a terceira via.

        ⚠️ O `<span>` leva a classe, e não a célula: pôr um `cellClassName` no
        `DashColumn` mudaria o componente compartilhado por uma necessidade de
        uma tela só.
      */
      cell: (q) => {
        const texto = formatarPercentual(percentualDaAlternativa(q, alt));
        if (q.alternativaCorreta !== alt) return texto;
        return (
          <span className="font-semibold">
            {texto}{" "}
            <span aria-label="gabarito" title="Alternativa correta">
              ✓
            </span>
          </span>
        );
      },
      // ⚠️ Ordena pelo número, não pelo texto: com a string formatada, "9%"
      // viria depois de "80%".
      sortValue: (q) => percentualDaAlternativa(q, alt),
    }),
  ),
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
