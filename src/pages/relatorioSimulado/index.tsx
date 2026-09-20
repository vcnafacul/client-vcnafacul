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
import { DASH, PARTNER_PROVAS } from "@/routes/path";
import { buscarQuestoes } from "@/services/relatorioSimulado/buscarQuestoes";
import { buscarRelatorio } from "@/services/relatorioSimulado/buscarRelatorio";
import { useAuthStore } from "@/store/auth";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { colunasDoRelatorio } from "./colunas";
import { filtrarLinhas, totalQueNaoEnviou } from "./filtrarLinhas";
import { DetalheDoEstudante } from "./DetalheDoEstudante";
import { indiceDeDificuldade } from "./dificuldadeDaQuestao";
import { BotaoExportar } from "./BotaoExportar";
import { nomeDoArquivo, planilhaDeEstudantes } from "./exportar";
import { ResumoDoRelatorio } from "./ResumoDoRelatorio";
import { TabelaDeQuestoes } from "./TabelaDeQuestoes";
import type { LocationStateDoRelatorio } from "./voltar";

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
 * O relatório de um simulado — uma linha por estudante do recorte.
 *
 * ⚠️ **O recorte vem da URL**, não de estado interno: `:simuladoId` no caminho
 * e `?turma=` opcional. É o que deixa o link ser colado, favoritado e
 * recarregado sem perder onde a pessoa estava.
 */
function RelatorioSimulado() {
  const { simuladoId } = useParams<{ simuladoId: string }>();
  const [searchParams] = useSearchParams();
  /**
   * ⚠️ `||`, **não `??`**: `?turma=` (valor vazio) é um resultado rotineiro de
   * link mastigado, e `??` deixaria a string vazia passar. Aí os dois lados
   * discordam — o serviço testa `turmaId ? …` e pediria o cursinho INTEIRO,
   * enquanto esta tela testa `!== undefined` e esconderia a coluna Turma: o
   * recorte mais largo possível, numa página que não diz de quem ele é.
   */
  const turmaId = searchParams.get("turma") || undefined;
  const { data } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const de = (location.state as LocationStateDoRelatorio | null)?.de;

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
    buscarRelatorio(data.token, simuladoId, turmaId)
      .then((r) => {
        setRelatorio(r);
        setEstado("idle");
      })
      .catch(() => setEstado("error"));
  };

  useEffect(carregar, [simuladoId, turmaId, data.token]);

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
    buscarQuestoes(data.token, simuladoId, turmaId)
      .then((r) => {
        setQuestoes(r.questoes);
        setEstadoQuestoes("idle");
      })
      .catch(() => setEstadoQuestoes("error"));
  };

  const colunas = useMemo(
    () => colunasDoRelatorio({ comTurma: turmaId !== undefined }),
    [turmaId],
  );

  /*
    ⚠️ Memoizado, e não `relatorio?.linhas ?? []` solto: o `??` devolve um
    ARRAY NOVO a cada render quando não há relatório, e isso entraria como
    dependência dos dois `useMemo` abaixo — que passariam a recalcular sempre,
    virando enfeite. O eslint aponta isto como `react-hooks/exhaustive-deps`.
  */
  const todasAsLinhas = useMemo(() => relatorio?.linhas ?? [], [relatorio]);

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
    () => planilhaDeEstudantes(linhas, { comTurma: turmaId !== undefined }),
    [linhas, turmaId],
  );

  const filtrosAtivos = (mostrarQuemNaoEnviou ? 1 : 0) + (busca ? 1 : 0);

  const limparFiltros = () => {
    setMostrarQuemNaoEnviou(false);
    setBusca("");
  };

  const voltar = () => {
    // ⚠️ `replace`: sem isto o histórico vira [listagem, relatório, listagem]
    // e o "voltar" do navegador devolve a pessoa PARA o relatório.
    if (de) {
      navigate(de.caminho, { replace: true, state: { de } });
      return;
    }
    // ⚠️ E não `navigate(-1)`: num link compartilhado aberto em aba nova não
    // há histórico, e o botão fica inerte — justamente no caso que fez esta
    // tela ser rota e não modal.
    navigate(`${DASH}/${PARTNER_PROVAS}`);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 p-4">
        {/* ⚠️ `print:hidden`: numa folha impressa não há "voltar". */}
        <button
          type="button"
          onClick={voltar}
          className={cn(
            "inline-flex w-fit items-center gap-2 text-sm print:hidden",
            dashV2.text.secondary,
            dashV2.focus,
          )}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar
        </button>

        <h1 className={cn("text-xl font-semibold", dashV2.text.primary)}>
          Relatório do simulado
        </h1>

        {relatorio && <ResumoDoRelatorio resumo={relatorio.resumo} />}

        <Tabs
          value={aba}
          onValueChange={(v) => {
            setAba(v);
            if (v === "questoes") carregarQuestoes();
          }}
        >
          <TabsList className="print:hidden">
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
            token={data.token}
            simuladoId={simuladoId}
            estudante={{
              usuario: aberto.usuario,
              nome: aberto.nome,
              matricula: aberto.matricula,
              // ⚠️ O detalhe é buscado por `usuario`, mas reprocessar é por
              // HISTÓRICO — é o histórico que guarda a foto e a falha. A linha
              // é o único lugar da tela que tem esse id.
              historicoId: aberto.historicoId,
            }}
            dificuldade={dificuldade}
            isOpen
            onClose={() => setAberto(null)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

export default RelatorioSimulado;
