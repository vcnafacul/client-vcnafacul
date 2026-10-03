import { UserCheck, UserMinus, Users } from "lucide-react";
import { CardDeMetrica } from "@/components/indicadores/CardDeMetrica";
import { contagem, type Indicadores } from "@/services/indicadores";
import { CurvaDoPeriodo, EvolucaoDoPeriodo } from "./EvolucaoDoPeriodo";
import { explicacoes } from "./explicacoes";
import { porcentagem, taxa } from "./formato";
import { PorQueSairam } from "./PorQueSairam";

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
  const porMotivo =
    (cursinho.canceladosPorMotivo as Record<string, number> | undefined) ??
    null;
  const emAndamento = dados.periodo.emAndamento;

  const curvas: CurvaDoPeriodo[] = [
    {
      chave: "ativos",
      rotulo: "Ativos",
      legenda: "alunos ativos",
      valor: (m) => contagem(m, "ativos"),
    },
  ];

  return (
    <div className="space-y-8">
      <Area titulo="Alunos">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
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
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <EvolucaoDoPeriodo serie={dados.serie} curvas={curvas} />
          </div>
          <PorQueSairam porMotivo={porMotivo} />
        </div>
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
