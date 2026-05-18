import { useCallback, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import type {
  ClassEssayMonthAnalytics,
  ClassEssayMonthsList,
} from "@/types/classAnalytics/classEssayAnalytics";
import { listClassEssayMonths } from "@/services/prepCourse/class/listClassEssayMonths";
import { getClassEssayByMonth } from "@/services/prepCourse/class/getClassEssayByMonth";
import { refreshClassEssayAnalytics } from "@/services/prepCourse/class/refreshClassEssayAnalytics";
import { useRefreshEssayPolling } from "@/hooks/useRefreshEssayPolling";
import { KpiHeader } from "./KpiHeader";
import { EmptyState } from "./EmptyState";
import { EssayEvolutionChart } from "@/components/molecules/essayEvolutionChart";
import { CompetenciaRadar } from "@/components/molecules/competenciaRadar";

interface Props {
  classId: string;
  token: string;
  selectedMonth: string | null;
  onSelectMonth: (month: string) => void;
}

export function ClassEssayAnalytics({
  classId,
  token,
  selectedMonth,
  onSelectMonth,
}: Props) {
  const [list, setList] = useState<ClassEssayMonthsList | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthData, setMonthData] = useState<ClassEssayMonthAnalytics | null>(null);
  const [monthLoading, setMonthLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [baselineGeneratedAt, setBaselineGeneratedAt] = useState<string | null>(null);

  // 1) Load months list once
  useEffect(() => {
    setLoading(true);
    listClassEssayMonths(classId, token)
      .then((data) => {
        setList(data);
        // 3) Auto-select latest month when list loads & no selection yet
        if (data.months.length > 0 && !selectedMonth) {
          const sorted = [...data.months].sort((a, b) => a.month.localeCompare(b.month));
          onSelectMonth(sorted[sorted.length - 1].month);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, token]);

  // 2) Load selected month data when selection changes
  useEffect(() => {
    if (!selectedMonth) {
      setMonthData(null);
      return;
    }
    setMonthLoading(true);
    setMonthData(null);
    getClassEssayByMonth(classId, selectedMonth, token)
      .then(setMonthData)
      .catch(console.error)
      .finally(() => setMonthLoading(false));
  }, [classId, selectedMonth, token]);

  // 4) Polling after refresh
  const { latest, timedOut } = useRefreshEssayPolling(
    classId,
    selectedMonth ?? "",
    baselineGeneratedAt,
    token,
    refreshing && !!selectedMonth
  );

  useEffect(() => {
    if (latest) {
      setMonthData(latest);
      setRefreshing(false);
      toast.success("Dados de redação atualizados!");
      // Refresh the list too so the new month appears
      listClassEssayMonths(classId, token).then(setList).catch(console.error);
    }
  }, [latest, classId, token]);

  useEffect(() => {
    if (timedOut) {
      setRefreshing(false);
      toast.info(
        "Ainda processando em segundo plano. Recarregue a página em alguns minutos para ver os dados atualizados.",
      );
    }
  }, [timedOut]);

  const handleRefresh = useCallback(async () => {
    if (requesting || refreshing) return;
    setRequesting(true);
    try {
      await refreshClassEssayAnalytics(classId, "current", token);
      setBaselineGeneratedAt(monthData?.generatedAt ?? null);
      setRefreshing(true);
      toast.info(
        "Atualização enfileirada. O processamento acontece em segundo plano — pode levar alguns minutos.",
      );
    } catch (e) {
      console.error(e);
      toast.error("Falha ao solicitar atualização. Tente novamente.");
    } finally {
      setRequesting(false);
    }
  }, [classId, monthData, refreshing, requesting, token]);

  const handleGenerate = useCallback(async () => {
    if (requesting || refreshing) return;
    setRequesting(true);
    try {
      await refreshClassEssayAnalytics(classId, "all", token);
      setRefreshing(true);
      toast.info(
        "Geração enfileirada. O processamento acontece em segundo plano — pode levar alguns minutos.",
      );
    } catch (e) {
      console.error(e);
      toast.error("Falha ao solicitar geração. Tente novamente.");
    } finally {
      setRequesting(false);
    }
  }, [classId, refreshing, requesting, token]);

  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        Carregando dados de redação da turma...
      </p>
    );
  }

  if (!list) {
    return (
      <p className="py-8 text-center text-sm text-red-400">
        Erro ao carregar dados de redação.
      </p>
    );
  }

  if (list.months.length === 0) {
    return (
      <section aria-labelledby="bloco-redacao">
        <h2 id="bloco-redacao" className="text-xl font-semibold mt-8 mb-4">
          Redação
        </h2>
        <EmptyState
          variant="no-months"
          onGenerate={list.coursePeriod.isActive ? handleGenerate : undefined}
          loading={refreshing || requesting}
        />
      </section>
    );
  }

  const sampleThreshold = Math.max(3, Math.floor(list.totalStudents * 0.1));
  const showSampleBanner =
    monthData !== null &&
    monthData.studentsWithAtLeastOneHumanReview < sampleThreshold;

  return (
    <section aria-labelledby="bloco-redacao">
      <h2 id="bloco-redacao" className="text-xl font-semibold mt-8 mb-4">
        Redação
      </h2>

      <div className="space-y-5">
        <KpiHeader
          monthData={monthData}
          list={list}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          requesting={requesting}
        />

        {showSampleBanner && (
          <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              Amostra pequena: apenas{" "}
              {monthData!.studentsWithAtLeastOneHumanReview} aluno(s) com
              redação revisada por humano. Os dados podem não ser
              representativos.
            </span>
          </div>
        )}

        <EssayEvolutionChart
          months={list.months}
          selectedMonth={selectedMonth}
          onSelectMonth={onSelectMonth}
        />

        {monthLoading && (
          <p className="py-6 text-center text-sm text-gray-400">
            Carregando mês...
          </p>
        )}

        {!monthLoading && !monthData && <EmptyState variant="month-empty" />}

        {!monthLoading && monthData && (
          <CompetenciaRadar competencias={monthData.competencias} />
        )}
      </div>
    </section>
  );
}
