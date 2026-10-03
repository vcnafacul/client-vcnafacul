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
import { contagem, type Indicadores } from "@/services/indicadores";
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
  dados: Indicadores;
}

/**
 * As áreas da tela: Alunos (02–05, 08), Turmas (06), Frequência (07) e
 * Desempenho (09). Cada card da série acrescenta a sua aqui.
 */
export function SecoesDosIndicadores({ dados }: Props) {
  const { cursinho, turmas } = dados;
  const alunos = contagem(cursinho, "alunos");
  const ativos = contagem(cursinho, "ativos");
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
  const emAndamento = dados.periodo.emAndamento;
  const sumindo = contagem(cursinho, "sumindo");
  const [listaAberta, setListaAberta] = useState(false);
  const desempenho = useDesempenho(dados.periodo.id);
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
    <div className="space-y-8">
      <Area titulo="Alunos">
        <div
          className={
            emAndamento
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5"
              : "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4"
          }
        >
          <CardDeMetrica
            icon={Users}
            rotulo="Alunos no período"
            valor={alunos}
            detalhe={
              turmas.length === 1 ? "em 1 turma" : `em ${turmas.length} turmas`
            }
            explicacao={explicacoes.alunos}
          />
          <CardDeMetrica
            icon={UserCheck}
            tom="green"
            rotulo={emAndamento ? "Ativos" : "Chegaram ao fim"}
            valor={ativos}
            detalhe={
              alunos !== null ? `de ${alunos} alunos do período` : undefined
            }
            explicacao={explicacoes.ativos}
          />
          <CardDeMetrica
            icon={UserMinus}
            tom="orange"
            rotulo="Cancelamentos"
            valor={cancelados}
            detalhe={
              porcentagem(taxa(cancelados, alunos))
                ? `${porcentagem(taxa(cancelados, alunos))} dos alunos do período`
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
            periodoId={dados.periodo.id}
            aberta={listaAberta}
            aoFechar={() => setListaAberta(false)}
          />
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <EvolucaoDoPeriodo serie={dados.serie} curvas={curvas} />
          </div>
          <PorQueSairam porMotivo={porMotivo} />
        </div>
      </Area>

      <Area titulo="Frequência">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <CardDeMetrica
            icon={CalendarCheck}
            rotulo="Frequência média"
            valor={
              aulas === 0 ? null : porcentagem(frequencia(cursinho))
            }
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

      <Area titulo="Turmas">
        <TabelaDeTurmas turmas={turmas} colunas={colunas} />
      </Area>

      <Area titulo="Desempenho">
        <AreaDesempenho {...desempenho} />
      </Area>
    </div>
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
