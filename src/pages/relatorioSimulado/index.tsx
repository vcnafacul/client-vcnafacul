import { DashTable, dashV2, sortRows, type SortState } from "@/components/dashV2";
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
import { DetalheDoEstudante } from "./DetalheDoEstudante";
import { ResumoDoRelatorio } from "./ResumoDoRelatorio";
import { TabelaDeQuestoes } from "./TabelaDeQuestoes";
import type { LocationStateDoRelatorio } from "./voltar";

type Estado = "idle" | "loading" | "error";

export const TEXTO_SEM_ESTUDANTES = "Nenhum estudante neste recorte";

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

  const linhas = useMemo(
    () => sortRows(relatorio?.linhas ?? [], colunas, sort),
    [relatorio, colunas, sort],
  );

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
              ⚠️ O erro mora AQUI, dentro da tabela que falhou, e não numa
              faixa própria acima: é o `DashTableErro` que a spec manda reusar,
              e duas mensagens de erro com dois "tentar de novo" na mesma tela
              não dizem mais do que uma — dizem menos, porque a pessoa passa a
              ter de escolher em qual clicar.
            */}
            <DashTable<LinhaDoRelatorio>
              rows={linhas}
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
              onRowClick={(l) => l.enviouCartao && setAberto(l)}
              sort={sort}
              onSortChange={setSort}
              state={estado}
              onRetry={carregar}
              stickyHeader
              emptyState={<VazioDeEstudantes />}
            />
          </TabsContent>

          <TabsContent value="questoes">
            <TabelaDeQuestoes
              questoes={questoes ?? []}
              estado={estadoQuestoes}
              onRetry={carregarQuestoes}
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
            }}
            isOpen
            onClose={() => setAberto(null)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

export default RelatorioSimulado;
