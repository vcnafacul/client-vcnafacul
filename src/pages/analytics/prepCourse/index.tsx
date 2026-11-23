import LineChartMui, {
  LineChartMuiProps,
} from "@/components/atoms/lineChartMui";
import StatCard from "@/components/atoms/statCard";
import AnalyticsSection from "@/components/molecules/analyticsSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Period } from "@/enums/analytics/period";

import { aggregateStudentCourseByPeriod } from "@/services/analytics/prepCourse/aggregateStudentCourseByPeriod";
import { getSummaryInscriptionCourse } from "@/services/analytics/prepCourse/getSummaryInscriptionCourse";
import { getSummaryStudentCourse } from "@/services/analytics/prepCourse/getSummaryStudentCourse";
import { SummaryInscriptionCourse } from "@/services/analytics/prepCourse/dtos/summary-inscription-course";
import { SummaryStudentCourse } from "@/services/analytics/prepCourse/dtos/summary-student-course";
import {
  inscricoesPorPeriodoDoCursinho,
  resumoDoCursinho,
  UltimoProcesso,
  ultimosProcessos,
} from "@/services/analytics/monitoramento";
import { useAuthStore } from "@/store/auth";
import { nomeDoArquivo } from "../nomeDoArquivo";
import { periodoDoProcesso } from "../periodoDoProcesso";
import { UltimosProcessos } from "../UltimosProcessos";
import { exportAnalyticsCsv } from "@/utils/exportAnalyticsCsv";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";

/** Os quatro números do card, da plataforma ou do cursinho (tickets/044). */
type NumerosDosCursinhos = {
  processosNaoTeste: number;
  processosTotal: number;
  inscricoesNaoTeste: number;
  matriculasNaoTeste: number;
};

const daPlataforma = (
  inscricoes: SummaryInscriptionCourse,
  estudantes: SummaryStudentCourse,
): NumerosDosCursinhos => ({
  processosNaoTeste: inscricoes.inscriptionTotalNonTest,
  processosTotal: inscricoes.inscriptionTotal,
  inscricoesNaoTeste: estudantes.totalStudentsNonTest,
  matriculasNaoTeste: estudantes.studentEnrolledNonTest,
});

function AnalyticsPrepCourse({
  period,
  cursinhoId,
  cursinhoNome,
}: {
  period: Period;
  /** tickets/044 — com cursinho, os números só dele. */
  cursinhoId?: string;
  cursinhoNome?: string;
}) {
  const {
    data: { token },
  } = useAuthStore();

  const [loading, setLoading] = useState(true);

  const [dataNumberInscriptionsByPeriod, setDataNumberInscriptionsByPeriod] =
    useState<LineChartMuiProps>({ xAxis: [], series: [] });

  const [numeros, setNumeros] = useState<NumerosDosCursinhos | null>(null);
  const [processos, setProcessos] = useState<UltimoProcesso[]>([]);
  const [carregandoProcessos, setCarregandoProcessos] = useState(true);

  // tickets/044, card 08 — com ou sem cursinho (sem: a plataforma inteira).
  useEffect(() => {
    setCarregandoProcessos(true);
    ultimosProcessos(token, cursinhoId)
      .then(setProcessos)
      .catch((err) => {
        setProcessos([]);
        toast.error(err.message);
      })
      .finally(() => setCarregandoProcessos(false));
  }, [token, cursinhoId]);

  useEffect(() => {
    setLoading(true);

    const resumo: Promise<NumerosDosCursinhos> = cursinhoId
      ? resumoDoCursinho(cursinhoId, token)
      : Promise.all([
          getSummaryInscriptionCourse(token),
          getSummaryStudentCourse(token),
        ]).then(([inscricoes, estudantes]) =>
          daPlataforma(inscricoes, estudantes),
        );
    const porPeriodo = cursinhoId
      ? inscricoesPorPeriodoDoCursinho(cursinhoId, period, token)
      : aggregateStudentCourseByPeriod(period, token);

    Promise.all([resumo, porPeriodo])
      .then(([numeros, aggregateStudentCourseByPeriod]) => {
        setNumeros(numeros);
        setDataNumberInscriptionsByPeriod({
          xAxis: aggregateStudentCourseByPeriod.map((r) => r.period),
          series: [
            {
              label: "Número de inscrições",
              data: aggregateStudentCourseByPeriod.map(
                (r) => r.totalInscriptions,
              ),
            },
          ],
        });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [period, token, cursinhoId]);

  const handleExportCsv = () => {
    if (!numeros) return;

    const periods = dataNumberInscriptionsByPeriod.xAxis;
    const total = dataNumberInscriptionsByPeriod.series[0]?.data || [];

    const rows = [
      ...periods.map((period, index) => [period, total[index] ?? 0]),
      [],
      ["Métrica", "Valor"],
      [
        "Total de processos seletivos realizados (sem testes)",
        numeros.processosNaoTeste,
      ],
      [
        "Total de processos seletivos realizados (incluindo testes)",
        numeros.processosTotal,
      ],
      [
        "Total de inscrições realizadas (sem testes)",
        numeros.inscricoesNaoTeste,
      ],
      [
        "Total de matrículas realizadas (sem testes)",
        numeros.matriculasNaoTeste,
      ],
      [],
      [
        "Últimos processos seletivos (sem testes)",
        "Cursinho",
        "Período",
        "Situação",
        "Inscrições",
        "Matrículas",
      ],
      ...processos.map((p) => [
        p.nome,
        p.cursinho.nome,
        periodoDoProcesso(p),
        p.situacao,
        p.inscricoes,
        p.matriculas,
      ]),
    ];
    exportAnalyticsCsv(
      ["Período", "Inscrições no período (incluindo testes)"],
      rows,
      nomeDoArquivo("analytics_cursinhos", cursinhoNome),
    );
  };

  return (
    <AnalyticsSection
      title={cursinhoId ? "Processos seletivos do cursinho" : "Cursinhos"}
      actions={
        <Button size="sm" variant="outline" onClick={handleExportCsv}>
          Exportar CSV
        </Button>
      }
    >
      <div className="min-w-0 md:w-7/12">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6 sm:col-span-4 min-w-0">
            <StatCard
              label="Total de processos seletivos realizados"
              value={numeros?.processosNaoTeste ?? 0}
              secondaryValue={numeros?.processosTotal ?? 0}
              color="marine"
              loading={loading}
            />
          </div>
          <div className="col-span-6 sm:col-span-4 min-w-0">
            <StatCard
              label="Total de inscrições realizadas"
              value={numeros?.inscricoesNaoTeste ?? 0}
              color="green"
              loading={loading}
            />
          </div>
          <div className="col-span-6 sm:col-span-4 min-w-0">
            <StatCard
              label="Total de matrículas realizadas"
              value={numeros?.matriculasNaoTeste ?? 0}
              color="red"
              loading={loading}
            />
          </div>
        </div>
        <p className="text-caption text-muted-foreground mt-2">
          Totais sem processos seletivos de teste. Entre parênteses, o total
          incluindo testes.
        </p>
      </div>
      <div className="min-w-0 md:w-1/2">
        <div className="shadow-md bg-white p-2 rounded-sm">
          {loading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <LineChartMui
              {...dataNumberInscriptionsByPeriod}
              title="Quantidade de inscrições por período"
              height={320}
            />
          )}
        </div>
      </div>
      <div className="mt-4">
        <UltimosProcessos
          processos={processos}
          carregando={carregandoProcessos}
          mostrarCursinho={!cursinhoId}
        />
      </div>
    </AnalyticsSection>
  );
}

export default AnalyticsPrepCourse;
