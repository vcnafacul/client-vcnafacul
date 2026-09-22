import {
  DashFilterBar,
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
import { flagsDaQuestao, quantasComSinal } from "./flagsDaQuestao";
import { SinaisDaQuestao } from "./SinaisDaQuestao";
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
 *
 * ---
 *
 * ⚠️ **A soma das larguras, medida a cada card.** O pior caso é sempre 1565px
 * com a sidebar no fluxo — o `xl` deste projeto é 1565px (customizado em
 * `tailwind.config`) e a sidebar é `absolute xl:relative`, então é justamente
 * ao entrar no fluxo que ela tira 16rem e o útil cai para 1277px.
 *
 * | versão | colunas | soma | folga |
 * |---|---|---|---|
 * | original | 11 | 1192px | 85px |
 * | card 04 (−`Acertos`/`Erros`/`% erro`, +`Respondentes`/`Gabarito`) | 10 | 1080px | 197px |
 * | card 19 (5 colunas A–E → 1 barra) | 6 | 848px | 429px |
 * | **card 06** (+`Sinais`) | **7** | **1072px** | **205px** |
 *
 * | coluna | largura |
 * |---|---|
 * | Questão | 7rem |
 * | Respondentes | 8.5rem |
 * | Gabarito | 6.5rem |
 * | % de acerto | 9rem |
 * | Distribuição | 13rem |
 * | Sinais | 14rem |
 * | Sem leitura | 9rem |
 *
 * Os 429px que o card 19 liberou eram o que o 06 precisava — e é por isso que
 * o 19 entrou antes dele, embora tenha número maior. `Sinais` consumiu 224px e
 * sobraram 205px.
 *
 * ⚠️ **A discriminação NÃO ganhou coluna própria**, e é o que mantém a folga:
 * um `r` entre −1 e +1 custaria mais largura para dizer menos do que o badge
 * diz. O número vive no `title` do badge e no CSV (decisão do card 19).
 *
 * ⚠️ **Encolher largura continua proibido**, e por medição: o `<th>` trunca o
 * título, e foi esse aperto que produziu o cabeçalho cortado consertado no card
 * 04. Quem precisar de espaço tira coluna ou reagrupa conteúdo — nunca aperta.
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
    id: "sinais",
    header: "Sinais",
    width: "14rem",
    /*
      ⚠️ **A triagem é o que transforma os cards 03 e 05 em produto.** Sem ela,
      o gabarito e a discriminação viram mais duas colunas de número — e um
      simulado tem de 45 a 180 questões, com dez números de peso visual igual e
      nenhuma indicação de por onde começar.

      Ordenar ajuda, mas ordenar por UMA coluna de cada vez não cruza
      dificuldade com discriminação, que é onde os casos interessantes moram.

      ⚠️ **Sem `sortValue`**: ordenar por um array não tem ordem natural. Quem
      faz o recorte é o filtro "só questões com sinal" na barra acima.

      ⚠️ **O card 19 decidiu que esta é a ÚNICA apresentação da discriminação na
      tabela** — sem coluna própria para o `r`. Um número entre −1 e +1 numa
      tela de coordenador é precisão que não ajuda a decidir nada e custa
      largura; o valor fica no tooltip e no CSV.
    */
    cell: (q) => <SinaisDaQuestao questao={q} />,
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
  const [soComSinal, setSoComSinal] = useState(false);

  /*
    ⚠️ **O contador conta a lista INTEIRA, não a filtrada.** Com o filtro
    ligado, `filtradas` são só as com sinal — e o rótulo diria "(7) de 7", o que
    não informa nada. Mesma razão do `quantosNaoEnviaram` na aba de Estudantes.
  */
  const comSinal = useMemo(() => quantasComSinal(questoes), [questoes]);

  const filtradas = useMemo(
    () => (soComSinal ? questoes.filter((q) => flagsDaQuestao(q).length > 0) : questoes),
    [questoes, soComSinal],
  );

  /*
    ⚠️ Volta para a página 1 quando o filtro liga: 180 questões com 7 sinais
    cabem numa página, e quem estava na página 4 veria uma tabela vazia sem
    dizer por quê. O `useEffect` de clamp abaixo pega o caso geral, mas depender
    dele aqui deixaria um render intermediário vazio.
  */
  useEffect(() => {
    setPagina(1);
  }, [soComSinal]);

  // ⚠️ O `DashTable` não ordena sozinho — ele só avisa. Quem ordena é o
  // `sortRows`, que já trata nulos no fim e ordenação estável.
  const ordenadas = useMemo(
    () => sortRows(filtradas, colunas, sort),
    [filtradas, sort],
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
    ⚠️ De `ordenadas`, e a distinção é fina mas importa: **a paginação NÃO
    recorta o arquivo, o filtro recorta.**

    Paginação é de leitura na tela — exportar só a página aberta daria uma
    planilha incompleta sem aviso nenhum. Filtro é escopo: quem ligou "só
    questões com sinal" e clicou em exportar quer as com sinal, e é por isso
    que o botão mora DENTRO da barra de filtros, ao lado do toggle.

    ⚠️ E na ordem que a pessoa está vendo — é o que faz conferir tela contra
    planilha não virar quebra-cabeça.
  */
  const planilha = useMemo(() => planilhaDeQuestoes(ordenadas), [ordenadas]);

  return (
    <div className="flex flex-col">
      {/*
        ⚠️ **A barra de filtros entrou no card 06**, e o `BotaoExportar` migrou
        para dentro dela — como já acontece na aba de Estudantes. O que o botão
        baixa passa a depender do filtro ao lado, e pôr os dois juntos é o que
        torna essa relação visível; separados, a pessoa exporta 180 linhas
        achando que exportou as 7 que está vendo.

        ⚠️ Sem `search`: não há o que buscar numa lista de números de questão
        que já está ordenada por número.
      */}
      <div className="print:hidden">
        <DashFilterBar
          activeCount={soComSinal ? 1 : 0}
          onClear={() => setSoComSinal(false)}
        >
          <label
            className={cn(
              "flex cursor-pointer select-none items-center gap-2 text-sm",
              dashV2.text.secondary,
            )}
          >
            <input
              type="checkbox"
              data-testid="toggle-so-com-sinal"
              className="h-4 w-4 cursor-pointer"
              checked={soComSinal}
              onChange={(e) => setSoComSinal(e.target.checked)}
            />
            {/*
              ⚠️ O número faz parte do rótulo — é ele que diz se vale acionar o
              filtro. "Só questões com sinal" sozinho não informa se são 3 de
              180 ou 140 de 180, e as duas situações pedem reações opostas.
            */}
            Só questões com sinal
            {comSinal > 0 && ` (${comSinal})`}
          </label>
          {nomeArquivo !== undefined && (
            <span className="ml-auto">
              <BotaoExportar planilha={planilha} nomeArquivo={nomeArquivo} />
            </span>
          )}
        </DashFilterBar>
      </div>
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
