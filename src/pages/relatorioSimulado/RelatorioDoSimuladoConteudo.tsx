import {
  DashFilterBar,
  DashListFooter,
  DashTable,
  dashV2,
  intervaloDaPagina,
  sortRows,
  type SortState,
} from "@/components/dashV2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import type {
  LinhaDoRelatorio,
  QuestaoDoRelatorio,
  RelatorioDoSimulado,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { buscarQuestoes } from "@/services/relatorioSimulado/buscarQuestoes";
import { buscarRelatorio } from "@/services/relatorioSimulado/buscarRelatorio";
import { useEffect, useMemo, useState } from "react";
import { colunasDoRelatorio } from "./colunas";
import { filtrarLinhas, totalQueNaoEnviou } from "./filtrarLinhas";
import { DetalheDoEstudante } from "./DetalheDoEstudante";
import { indiceDeDificuldade } from "./dificuldadeDaQuestao";
import { SampleSizeBanner } from "@/components/organisms/classSimuladoAnalytics/SampleSizeBanner";
import {
  distribuicaoDaTurma,
  faixasDoHistograma,
  MINIMO_PARA_HISTOGRAMA,
} from "./distribuicao";
import { IdentificacaoDoRelatorio } from "./IdentificacaoDoRelatorio";
import { desviosPorMateria, materiasVisiveis } from "./materiasDoRelatorio";
import { BotaoExportar } from "./BotaoExportar";
import { nomeDoArquivo, planilhaDeEstudantes } from "./exportar";
import { ResumoDoRelatorio } from "./ResumoDoRelatorio";
import { TabelaDeQuestoes } from "./TabelaDeQuestoes";

type Estado = "idle" | "loading" | "error";

export const TEXTO_SEM_ESTUDANTES = "Nenhum estudante neste recorte";

/** Mesmo 25 do `DashListTemplate` e da aba de questões. */
export const ESTUDANTES_POR_PAGINA = 25;

/**
 * O vazio da tabela de estudantes.
 *
 * ⚠️ **Não é o `DashTableVazio`**, que não recebe prop nenhuma: ele traz o
 * texto genérico e a dica "tente limpar os filtros", e esta tela não tem
 * filtro — a única coisa que recorta é a URL. Mesma decisão, e pelo mesmo
 * motivo, do `VazioDeQuestoes` em `TabelaDeQuestoes.tsx`.
 */
function VazioDeEstudantes() {
  return (
    <div
      data-testid="estudantes-vazio"
      className="flex flex-col items-center gap-2 px-4 py-10 text-center"
    >
      <p className={cn("text-sm font-medium", dashV2.text.primary)}>
        {TEXTO_SEM_ESTUDANTES}
      </p>
      <p className={cn("text-xs", dashV2.text.secondary)}>
        Nenhum estudante com cartão-resposta enviado neste simulado.
      </p>
    </div>
  );
}

export const TEXTO_VAZIO_POR_FILTRO = "Nenhum estudante para este filtro";

/**
 * O vazio de quando o filtro escondeu tudo.
 *
 * ⚠️ Separado do `VazioDeEstudantes` de propósito: dizer "nenhum estudante
 * neste recorte" com a busca preenchida é afirmar algo falso sobre os dados, e
 * manda a pessoa investigar um problema que não existe.
 */
function VazioPorFiltro({ onLimpar }: { onLimpar: () => void }) {
  return (
    <div
      data-testid="estudantes-vazio-filtro"
      className="flex flex-col items-center gap-2 px-4 py-10 text-center"
    >
      <p className={cn("text-sm font-medium", dashV2.text.primary)}>
        {TEXTO_VAZIO_POR_FILTRO}
      </p>
      <button
        type="button"
        onClick={onLimpar}
        className={cn("text-xs underline", dashV2.text.secondary)}
      >
        Limpar filtros
      </button>
    </div>
  );
}

/**
 * O miolo do relatório de um simulado, sem nada de roteamento.
 *
 * ⚠️ **Existe para ser usado por DUAS telas** — a rota
 * `/dashboard/relatorio-simulado` e a aba "Simulados por cartão" da turma.
 * Duplicar as colunas e a lógica de filtro nas duas faria a mesma turma
 * mostrar números diferentes na primeira vez que uma delas mudasse.
 *
 * ⚠️ Quem decide o recorte é quem monta: a rota tira da URL, a aba fixa o
 * `turmaId` da turma aberta. Este componente não sabe de `useParams`.
 */
export function RelatorioDoSimuladoConteudo({
  simuladoId,
  turmaId,
  token,
  cabecalho,
  comPadding = true,
  comTitulo = false,
}: {
  simuladoId: string;
  /** Ausente = o cursinho inteiro. */
  turmaId?: string;
  token: string;
  /** O que vai acima do resumo — "voltar" na rota, nada na aba. */
  cabecalho?: React.ReactNode;
  /** A aba já vive dentro de um container com espaçamento próprio. */
  comPadding?: boolean;
  /**
   * `true` na rota, onde o `<h1>` passa a ser o nome do simulado (card 18).
   *
   * ⚠️ `false` na aba da turma: o seletor logo acima já mostra o nome, e a
   * turma é a tela inteira — repetir os dois seria ruído.
   */
  comTitulo?: boolean;
}) {
  const [relatorio, setRelatorio] = useState<RelatorioDoSimulado | null>(null);
  const [estado, setEstado] = useState<Estado>("loading");
  const [sort, setSort] = useState<SortState | undefined>({
    columnId: "estudante",
    direction: "asc",
  });

  /** A linha cujo detalhe está aberto. `null` = modal fechado. */
  const [aberto, setAberto] = useState<LinhaDoRelatorio | null>(null);

  const [aba, setAba] = useState("estudantes");
  /*
    ⚠️ Começa FALSO: o relatório é sobre os cartões que chegaram. Quem não
    enviou é informação de cobrança, não de leitura — útil, mas não é o que a
    pessoa veio ver, e antes disto dominava a tabela em turma grande.
  */
  const [mostrarQuemNaoEnviou, setMostrarQuemNaoEnviou] = useState(false);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [questoes, setQuestoes] = useState<QuestaoDoRelatorio[] | null>(null);
  const [estadoQuestoes, setEstadoQuestoes] = useState<Estado>("idle");

  const carregar = () => {
    if (!simuladoId) return;
    setEstado("loading");
    buscarRelatorio(token, simuladoId, turmaId)
      .then((r) => {
        setRelatorio(r);
        setEstado("idle");
      })
      .catch(() => setEstado("error"));
  };

  useEffect(carregar, [simuladoId, turmaId, token]);

  /**
   * ⚠️ As questões só são buscadas na PRIMEIRA abertura da aba, e nunca junto
   * com as linhas. São duas chamadas independentes e a maioria das visitas só
   * quer as linhas — buscar as duas sempre dobra o tempo até a primeira coisa
   * útil aparecer. O `questoes !== null` é o que impede rebuscar ao alternar.
   *
   * ⚠️ E a guarda **não atrapalha o "tentar de novo"**: o único jeito de chegar
   * a `estadoQuestoes === "error"` é pelo `catch`, que nunca chamou
   * `setQuestoes` — então numa tela em erro `questoes` ainda é `null` e a
   * guarda deixa passar. Não há caminho que ponha erro e lista ao mesmo tempo.
   */
  const carregarQuestoes = () => {
    if (!simuladoId) return;
    if (questoes !== null) return;
    setEstadoQuestoes("loading");
    buscarQuestoes(token, simuladoId, turmaId)
      .then((r) => {
        setQuestoes(r.questoes);
        setEstadoQuestoes("idle");
      })
      .catch(() => setEstadoQuestoes("error"));
  };

  /*
    ⚠️ **As matérias saem do RESUMO, não das linhas** (card 07). O resumo é do
    recorte inteiro; derivadas das linhas, as colunas apareceriam e sumiriam
    conforme a busca por nome — e ver uma coluna desaparecer ao digitar faz a
    pessoa desconfiar da tela toda.
  */
  /*
    ⚠️ Memoizado à parte porque **a tela e o CSV usam conjuntos diferentes**: a
    tabela respeita o teto de 4 (é problema de largura), o arquivo leva todas.
  */
  const todasAsMaterias = useMemo(
    () => relatorio?.resumo.aproveitamentoPorMateria,
    [relatorio?.resumo.aproveitamentoPorMateria],
  );

  const materias = useMemo(
    () => materiasVisiveis(todasAsMaterias),
    [todasAsMaterias],
  );

  /*
    ⚠️ Memoizado, e não `relatorio?.linhas ?? []` solto: o `??` devolve um
    ARRAY NOVO a cada render quando não há relatório, e isso entraria como
    dependência dos dois `useMemo` abaixo — que passariam a recalcular sempre,
    virando enfeite. O eslint aponta isto como `react-hooks/exhaustive-deps`.
  */
  const todasAsLinhas = useMemo(() => relatorio?.linhas ?? [], [relatorio]);

  /*
    ⚠️ **Sobre `todasAsLinhas`, e NÃO sobre a lista filtrada.** O desvio é a
    referência da TURMA, e turma não muda com filtro de tela: derivado da lista
    filtrada, a mesma célula ficaria marcada ou não conforme o que a pessoa
    digitou na busca — o realce mudaria de sentido a cada tecla.

    ⚠️ E tem de vir ANTES de `linhas`, que depende de `colunas`, que depende
    daqui. Declarado depois, é `Cannot access before initialization`.
  */
  const desvios = useMemo(() => desviosPorMateria(todasAsLinhas), [todasAsLinhas]);

  /*
    ⚠️ **Sobre `todasAsLinhas`**, pelo mesmo motivo do desvio por matéria e da
    média do card 08: a distribuição é do RECORTE, e filtro de busca não é
    escopo. Buscar um nome não pode mudar a mediana da turma.
  */
  const distribuicao = useMemo(
    () => distribuicaoDaTurma(todasAsLinhas),
    [todasAsLinhas],
  );

  const faixas = useMemo(
    () =>
      faixasDoHistograma(
        todasAsLinhas,
        relatorio?.resumo.totalDeQuestoes ?? 0,
      ),
    [todasAsLinhas, relatorio?.resumo.totalDeQuestoes],
  );

  const colunas = useMemo(
    () =>
      colunasDoRelatorio({
        comTurma: turmaId !== undefined,
        materias,
        desvios,
        // ⚠️ Do RESUMO, não somado das linhas: é propriedade do simulado.
        totalDeQuestoes: relatorio?.resumo.totalDeQuestoes ?? 0,
        /*
          ⚠️ A média do RECORTE INTEIRO, não das linhas filtradas — mesma razão
          do desvio por matéria: a referência é a turma, e turma não muda com
          filtro de tela. Buscar um nome não pode mudar "+14 p.p." para
          "0 p.p." porque o aluno virou a única linha visível.
        */
        mediaDoRecorte: relatorio?.resumo.aproveitamentoGeral ?? null,
      }),
    [
      turmaId,
      materias,
      desvios,
      relatorio?.resumo.totalDeQuestoes,
      relatorio?.resumo.aproveitamentoGeral,
    ],
  );

  /*
    ⚠️ Filtra ANTES de ordenar. O contrário ordena linhas que serão jogadas
    fora — trabalho à toa que cresce com o tamanho da turma.
  */
  const linhas = useMemo(
    () =>
      sortRows(
        filtrarLinhas(todasAsLinhas, { mostrarQuemNaoEnviou, busca }),
        colunas,
        sort,
      ),
    [todasAsLinhas, mostrarQuemNaoEnviou, busca, colunas, sort],
  );

  /*
    ⚠️ Sobre a lista INTEIRA, não sobre a filtrada: o número no rótulo do
    toggle responde "quem mais existe neste recorte". É ele que explica a
    diferença entre a tabela e o "Estudantes no recorte" do resumo, que conta
    todo mundo de propósito.
  */
  const quantosNaoEnviaram = useMemo(
    () => totalQueNaoEnviou(todasAsLinhas),
    [todasAsLinhas],
  );

  /*
    ⚠️ Volta para a página 1 quando o filtro muda. Sem isto, buscar um nome
    estando na página 3 mostra a tabela vazia — o resultado existe, mas está na
    página 1, e a tela não diz isso.
  */
  useEffect(() => {
    setPagina(1);
  }, [mostrarQuemNaoEnviou, busca]);

  const linhasDaPagina = useMemo(() => {
    const { inicio, fim } = intervaloDaPagina(
      pagina,
      ESTUDANTES_POR_PAGINA,
      linhas.length,
    );
    // ⚠️ `intervaloDaPagina` fala em posições para humano (1-based, fim
    // inclusivo) e o `slice` em índices (0-based, fim exclusivo). Reusar a
    // função do dashV2 é o que mantém o rodapé e a fatia em acordo.
    return linhas.slice(inicio - 1, fim);
  }, [linhas, pagina]);

  /*
    ⚠️ Deriva do MESMO `questoes` que alimenta a aba — uma fonte só. Calcular o
    percentual de novo aqui faria a mesma questão aparecer com dois números na
    mesma tela se um dos cálculos mudasse.
  */
  const dificuldade = useMemo(
    () => indiceDeDificuldade(questoes ?? []),
    [questoes],
  );

  /*
    ⚠️ Deriva de `linhas`, que já passou pelo filtro e pela ordenação — e NÃO
    de `todasAsLinhas`. O arquivo é o que está na tela, como a impressão: quem
    quer o recorte inteiro limpa o filtro antes.

    ⚠️ E não de `linhasDaPagina`: paginação é de leitura na tela, não de
    escopo. Exportar só 25 de 340 seria uma planilha incompleta sem aviso.
  */
  const planilhaEstudantes = useMemo(
    () => planilhaDeEstudantes(linhas, {
        comTurma: turmaId !== undefined,
        // ⚠️ TODAS as matérias do resumo, sem o teto de 4 da tela: o teto é
        // problema de largura, e planilha não tem largura.
        materias: todasAsMaterias,
        totalDeQuestoes: relatorio?.resumo.totalDeQuestoes,
      }),
    [linhas, turmaId, todasAsMaterias, relatorio?.resumo.totalDeQuestoes],
  );

  const filtrosAtivos = (mostrarQuemNaoEnviou ? 1 : 0) + (busca ? 1 : 0);

  const limparFiltros = () => {
    setMostrarQuemNaoEnviou(false);
    setBusca("");
  };

  return (
    <TooltipProvider>
      {/*
        ⚠️ **O recuo horizontal é de cada bloco, nunca deste container.**

        A `DashFilterBar`, a `DashTable` e os vazios já trazem `px-4` próprio.
        Um `px-4` aqui SOMARIA ao deles: o resumo ficaria a 16px da borda e a
        faixa de filtros a 32px, desalinhados entre si na mesma tela. Era o que
        acontecia na rota, e na aba da turma o resumo ficava colado na borda
        porque ali o padding do container estava desligado.

        `py` continua sendo do container: espaço vertical não se acumula com
        nada, e é o que separa o relatório do que vem acima dele.
      */}
      <div className={cn("flex flex-col gap-4", comPadding && "py-4")}>
        {cabecalho !== undefined && <div className="px-4">{cabecalho}</div>}

      {/*
        ⚠️ **Fica AQUI, e não no `cabecalho`** (card 18): o nome do simulado vem
        do resumo, que este componente carrega — a rota não o tem quando monta a
        prop. E é o mesmo motivo de os dois lados usarem o mesmo bloco em vez de
        cada tela escrever o seu.

        ⚠️ Fora do `estado === "idle"` de propósito: enquanto carrega não há
        resumo, e um cabeçalho que aparece depois da tabela pula a página.
      */}
      {relatorio && (
        <div className="px-4">
          <IdentificacaoDoRelatorio
            resumo={relatorio.resumo}
            comTitulo={comTitulo}
          />
        </div>
      )}

        {relatorio && (
          <div className="px-4">
            <>
                  <ResumoDoRelatorio
                    resumo={relatorio.resumo}
                    distribuicao={distribuicao}
                    faixas={faixas}
                  />
                  {/*
                    ⚠️ **O mesmo `SampleSizeBanner` do agregado mensal da
                    turma**, generalizado no card 09 para receber números em vez
                    do `ClassMonthAnalytics`. Escrever um segundo banner faria
                    as duas telas avisarem de jeitos diferentes sobre a mesma
                    situação.

                    ⚠️ Aparece só quando há alguém: com zero cartões lidos o
                    vazio da tabela já explica, e um aviso de amostra pequena em
                    cima disso seria ruído.
                  */}
                  {distribuicao.base > 0 && (
                    <div className="px-4">
                      <SampleSizeBanner
                        comDados={distribuicao.base}
                        minimo={MINIMO_PARA_HISTOGRAMA}
                        descricao="com cartão lido"
                      />
                    </div>
                  )}
                </>
          </div>
        )}

        <Tabs
          value={aba}
          onValueChange={(v) => {
            setAba(v);
            if (v === "questoes") carregarQuestoes();
          }}
        >
          <TabsList className="ml-4 print:hidden">
            <TabsTrigger value="estudantes">Estudantes</TabsTrigger>
            <TabsTrigger value="questoes">Questões</TabsTrigger>
          </TabsList>

          <TabsContent value="estudantes">
            {/*
              ⚠️ `print:hidden` como o resto dos controles desta tela: numa
              folha impressa um campo de busca e uma caixa de seleção não são
              interativos, só ruído acima da tabela.

              ⚠️ A impressão sai FILTRADA, e isso é deliberado: a folha tem de
              ser o que está na tela. Quem quer a lista inteira desliga o
              filtro antes de imprimir.
            */}
            <div className="print:hidden">
              <DashFilterBar
                search={{
                  value: busca,
                  onChange: setBusca,
                  placeholder: "Buscar por nome ou matrícula",
                }}
                activeCount={filtrosAtivos}
                onClear={limparFiltros}
              >
                <label
                  className={cn(
                    "flex cursor-pointer select-none items-center gap-2 text-sm",
                    dashV2.text.secondary,
                  )}
                >
                  <input
                    type="checkbox"
                    data-testid="toggle-nao-enviaram"
                    className="h-4 w-4 cursor-pointer"
                    checked={mostrarQuemNaoEnviou}
                    onChange={(e) => setMostrarQuemNaoEnviou(e.target.checked)}
                  />
                  {/*
                    ⚠️ O número faz parte do rótulo. Sem ele a tabela mostra
                    uma linha enquanto o resumo diz "2 estudantes no recorte",
                    e a diferença fica sem explicação na tela.
                  */}
                  Mostrar quem não enviou
                  {quantosNaoEnviaram > 0 && ` (${quantosNaoEnviaram})`}
                </label>
                {/*
                  ⚠️ Dentro da faixa de filtros, e não numa barra própria: o
                  que ele baixa depende do filtro ao lado, e pôr os dois juntos
                  é o que torna essa relação visível.
                */}
                <BotaoExportar
                  planilha={planilhaEstudantes}
                  nomeArquivo={nomeDoArquivo(
                    "estudantes",
                    simuladoId ?? "",
                    turmaId,
                  )}
                  rotulo="Exportar CSV"
                />
              </DashFilterBar>
            </div>
            {/*
              ⚠️ O erro mora AQUI, dentro da tabela que falhou, e não numa
              faixa própria acima: é o `DashTableErro` que a spec manda reusar,
              e duas mensagens de erro com dois "tentar de novo" na mesma tela
              não dizem mais do que uma — dizem menos, porque a pessoa passa a
              ter de escolher em qual clicar.
            */}
            <DashTable<LinhaDoRelatorio>
              rows={linhasDaPagina}
              columns={colunas}
              /*
                ⚠️ `usuario` sozinho NÃO é único. A api monta as linhas de uma
                query de estudantes filtrada só por cursinho, situação da
                matrícula e soft-delete — sem DISTINCT, e sem índice único em
                (user_id, partner_prep_course_id). Quem se matriculou por dois
                processos seletivos do mesmo cursinho vem duas vezes, com o
                mesmo `usuario`. Chave repetida numa tabela ordenável faz o
                React reconciliar linha na DOM errada depois de um sort. A
                `matricula` (`cod_enrolled`) é que carrega unicidade.
              */
              rowKey={(l) => `${l.usuario}:${l.matricula}`}
              /*
                ⚠️ Só abre para quem ENVIOU. Linha sem cartão não tem o que
                detalhar, e a rota devolveria 404 — um clique que só sabe dar
                erro é pior que um clique que não faz nada.
              */
              /*
                ⚠️ Abrir o detalhe também dispara a carga do agregado por
                questão, que alimenta a coluna "Acertos na turma".

                É a MESMA função da aba "Questões", e a guarda
                `questoes !== null` dela impede rebuscar — então visitar a aba
                antes, ou abrir vários modais, não gera chamada extra. Sem
                isto a coluna só teria número para quem tivesse passado pela
                aba, e apareceria ou não sem a pessoa entender por quê.
              */
              onRowClick={(l) => {
                if (!l.enviouCartao) return;
                carregarQuestoes();
                setAberto(l);
              }}
              sort={sort}
              onSortChange={setSort}
              state={estado}
              onRetry={carregar}
              stickyHeader
              /*
                ⚠️ Dois vazios diferentes. "Nenhum estudante neste recorte" é
                falso quando a lista tem gente e o filtro a escondeu — e manda
                a pessoa procurar defeito onde não há. Com filtro ativo, o
                vazio diz o que fazer.
              */
              emptyState={
                filtrosAtivos > 0 && todasAsLinhas.length > 0 ? (
                  <VazioPorFiltro onLimpar={limparFiltros} />
                ) : (
                  <VazioDeEstudantes />
                )
              }
            />
            {/*
              ⚠️ O mesmo rodapé das outras telas do dashV2, reusado como
              componente autônomo. O `DashListTemplate` o traz de graça, mas lê
              as linhas do `DashCardContext` do V1 (`entities`, `setEntities`,
              `getMoreCards`, `cardTransformation`) — esta tela nunca viveu
              nesse contexto, e montá-lo aqui seria inventar campos que a tela
              não tem.

              ⚠️ O total é o das linhas FILTRADAS, não o do recorte: é o que
              faz "Mostrando 1–25 de 12" não aparecer depois de uma busca. O
              número do recorte continua no resumo, lá em cima.
            */}
            <div className="print:hidden">
              <DashListFooter
                pagina={pagina}
                pageSize={ESTUDANTES_POR_PAGINA}
                total={linhas.length}
                onPageChange={setPagina}
              />
            </div>
          </TabsContent>

          <TabsContent value="questoes">
            <TabelaDeQuestoes
              questoes={questoes ?? []}
              estado={estadoQuestoes}
              onRetry={carregarQuestoes}
              nomeArquivo={nomeDoArquivo("questoes", simuladoId ?? "", turmaId)}
            />
          </TabsContent>
        </Tabs>

        {/*
          ⚠️ `print:hidden` não é necessário aqui — o modal fechado não existe
          no DOM (o `aberto &&` é o gate), e imprimir com ele aberto é escolha
          de quem imprime.
        */}
        {aberto && simuladoId && (
          <DetalheDoEstudante
            token={token}
            simuladoId={simuladoId}
            estudante={{
              usuario: aberto.usuario,
              nome: aberto.nome,
              matricula: aberto.matricula,
              // ⚠️ O detalhe é buscado por `usuario`, mas reprocessar é por
              // HISTÓRICO — é o histórico que guarda a foto e a falha. A linha
              // é o único lugar da tela que tem esse id.
              historicoId: aberto.historicoId,
              // ⚠️ A linha INTEIRA: é a fonte de todos os números do bloco de
              // resumo (card 10), e recalcular qualquer um deles no modal
              // produziria um segundo número para a mesma coisa.
              linha: aberto,
            }}
            dificuldade={dificuldade}
            /*
              ⚠️ É o MESMO `turmaId` que recorta o agregado de dificuldade — e
              é por isso que o rótulo da coluna pode dizer qual recorte é. Sem
              turma, o número é do cursinho inteiro e o rótulo antigo ("na
              turma") mentia no caminho mais comum, o do `dashProvas`.
            */
            recorte={turmaId === undefined ? "cursinho" : "turma"}
            totalDeQuestoes={relatorio?.resumo.totalDeQuestoes ?? 0}
            mediaDoRecorte={relatorio?.resumo.aproveitamentoGeral ?? null}
            materiasDaTurma={relatorio?.resumo.aproveitamentoPorMateria ?? []}
            isOpen
            onClose={() => setAberto(null)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
