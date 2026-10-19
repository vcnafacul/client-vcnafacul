import { useState } from "react";
import {
  CalendarCheck,
  CircleAlert,
  TrendingDown,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";
import { CardDeMetrica } from "@/components/indicadores/CardDeMetrica";
import {
  contagem,
  ehVisaoDeTodos,
  type Indicadores,
  type IndicadoresDeTodos,
} from "@/services/indicadores";
import { ComparativoEntrePeriodos } from "./ComparativoEntrePeriodos";
import { TodosOsPeriodos } from "./cursinhoDosIndicadores";
import { CurvaDoPeriodo, EvolucaoDoPeriodo } from "./EvolucaoDoPeriodo";
import { explicacoes } from "./explicacoes";
import { evasao, frequencia, porcentagem, taxa } from "./formato";
import { ListaDeSumindo } from "./ListaDeSumindo";
import { PorQueSairam } from "./PorQueSairam";
import { AreaDesempenho } from "./AreaDesempenho";
import { colunasBase } from "./colunasDaTurma";
import { TabelaDeTurmas } from "./TabelaDeTurmas";
import { useDesempenho } from "./useDesempenho";

interface Props {
  /** Um período, ou todos (tickets/046). */
  dados: Indicadores | IndicadoresDeTodos;
}

/**
 * As áreas da tela: Alunos (02–05, 08), Turmas (06), Frequência (07) e
 * Desempenho (09). Cada card da série acrescenta a sua aqui.
 */
export function SecoesDosIndicadores({ dados }: Props) {
  const { cursinho, turmas } = dados;
  const todos = ehVisaoDeTodos(dados);
  const alunos = contagem(cursinho, "alunos");
  // Todos (D2): ativos e sumindo só dos períodos em andamento.
  const abertos = todos ? dados.emAndamento : cursinho;
  const ativos = abertos ? contagem(abertos, "ativos") : null;
  const cancelados = contagem(cursinho, "cancelados");
  const desistencia = contagem(cursinho, "desistenciaInicial") ?? 0;
  const taxaDeEvasao = evasao(cursinho);
  const aulas = contagem(cursinho, "aulasRegistradas");
  const justificadas = taxa(
    contagem(cursinho, "faltasJustificadas"),
    contagem(cursinho, "chamadasAluno"),
  );
  const porMotivo =
    (cursinho.canceladosPorMotivo as Record<string, number> | undefined) ??
    null;
  const emAndamento = todos ? !!dados.emAndamento : dados.periodo.emAndamento;
  const periodoId = todos ? null : dados.periodo.id;
  const sumindo = abertos ? contagem(abertos, "sumindo") : null;
  const [listaAberta, setListaAberta] = useState(false);
  const desempenho = useDesempenho(periodoId);
  const doPeriodo = todos ? "das matrículas" : "dos alunos do período";
  const ultimaDaTurma = new Map(
    (desempenho.dados?.porTurma ?? []).map((t) => [
      t.turmaId,
      t.ultimaAplicacao,
    ]),
  );
  const colunas = [
    ...colunasBase,
    {
      titulo: "Último simulado",
      valor: (t: { id: string }) =>
        porcentagem(ultimaDaTurma.get(t.id)?.media ?? null) ?? "—",
    },
  ];

  const curvas: CurvaDoPeriodo[] = [
    {
      chave: "ativos",
      rotulo: "Ativos",
      legenda: "alunos ativos",
      valor: (m) => contagem(m, "ativos"),
    },
    {
      chave: "evasao",
      rotulo: "Evasão",
      legenda: "de evasão acumulada",
      porcentagem: true,
      valor: (m) => evasao(m),
    },
    {
      chave: "frequencia",
      rotulo: "Frequência",
      legenda: "de frequência na semana",
      porcentagem: true,
      valor: (m) => frequencia(m),
      // a frequência da semana, e não a acumulada desde o início
      daSemana: (atual, anterior) =>
        taxa(
          (contagem(atual, "presencas") ?? 0) -
            (contagem(anterior, "presencas") ?? 0),
          (contagem(atual, "chamadasAluno") ?? 0) -
            (contagem(anterior, "chamadasAluno") ?? 0),
        ),
    },
  ];

  return (
    <TodosOsPeriodos.Provider value={todos}>
      <div className="space-y-8">
        <Area titulo="Alunos">
          <div
            className={
              emAndamento
                ? "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5"
                : "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4"
            }
          >
            <CardDeMetrica
              icon={Users}
              rotulo={todos ? "Matrículas nos períodos" : "Alunos no período"}
              valor={alunos}
              detalhe={
                todos
                  ? `em ${dados.comparativo.length} ${dados.comparativo.length === 1 ? "período" : "períodos"} · ${turmas.length} ${turmas.length === 1 ? "turma" : "turmas"}`
                  : turmas.length === 1
                    ? "em 1 turma"
                    : `em ${turmas.length} turmas`
              }
              explicacao={todos ? explicacoes.matriculas : explicacoes.alunos}
            />
            <CardDeMetrica
              icon={UserCheck}
              tom="green"
              rotulo={todos || emAndamento ? "Ativos" : "Chegaram ao fim"}
              valor={ativos}
              semDado={todos ? "Nenhum período em andamento" : undefined}
              detalhe={
                todos
                  ? "nos períodos em andamento"
                  : alunos !== null
                    ? `de ${alunos} alunos do período`
                    : undefined
              }
              explicacao={
                todos ? explicacoes.ativosEmAndamento : explicacoes.ativos
              }
            />
            <CardDeMetrica
              icon={UserMinus}
              tom="orange"
              rotulo="Cancelamentos"
              valor={cancelados}
              detalhe={
                porcentagem(taxa(cancelados, alunos))
                  ? `${porcentagem(taxa(cancelados, alunos))} ${doPeriodo}`
                  : undefined
              }
              explicacao={explicacoes.cancelados}
            />
            <CardDeMetrica
              icon={TrendingDown}
              tom="red"
              rotulo="Evasão"
              valor={porcentagem(taxaDeEvasao)}
              detalhe={
                cancelados !== null && alunos !== null
                  ? `${cancelados - desistencia} de ${alunos - desistencia} alunos` +
                    (desistencia > 0
                      ? ` · ${desistencia} ${desistencia === 1 ? "desistência inicial" : "desistências iniciais"} à parte`
                      : "")
                  : undefined
              }
              explicacao={explicacoes.evasao}
            />
            {emAndamento && (
              <CardDeMetrica
                // no celular, 5 cards em 2 colunas: o último ocupa a linha toda
                className="col-span-2 sm:col-span-1"
                icon={CircleAlert}
                tom="orange"
                rotulo="Sumindo"
                valor={sumindo}
                detalhe="faltaram às 3 últimas aulas"
                explicacao={explicacoes.sumindo}
                onClick={sumindo ? () => setListaAberta(true) : undefined}
              />
            )}
          </div>
          {emAndamento && (
            <ListaDeSumindo
              periodoId={periodoId}
              aberta={listaAberta}
              aoFechar={() => setListaAberta(false)}
            />
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              {todos ? (
                <ComparativoEntrePeriodos comparativo={dados.comparativo} />
              ) : (
                <EvolucaoDoPeriodo serie={dados.serie} curvas={curvas} />
              )}
            </div>
            <PorQueSairam porMotivo={porMotivo} />
          </div>
        </Area>

        <Area titulo="Frequência">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <CardDeMetrica
              icon={CalendarCheck}
              rotulo="Frequência média"
              valor={aulas === 0 ? null : porcentagem(frequencia(cursinho))}
              detalhe={
                aulas
                  ? `em ${aulas} ${aulas === 1 ? "aula registrada" : "aulas registradas"}` +
                    (justificadas
                      ? ` · ${porcentagem(justificadas)} de faltas justificadas`
                      : "")
                  : undefined
              }
              explicacao={explicacoes.frequencia}
            />
          </div>
        </Area>

        {/* o painel já se chama "Turmas": sem o título da área repetido */}
        <TabelaDeTurmas turmas={turmas} colunas={colunas} />

        <Area titulo="Desempenho">
          <AreaDesempenho {...desempenho} />
        </Area>
      </div>
    </TodosOsPeriodos.Provider>
  );
}

/** Título de uma área da tela, com os cards em grade abaixo. */
export function Area({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-marine">{titulo}</h2>
      {children}
    </section>
  );
}
