import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ClassMonthAnalytics, ClassMonthsList } from "@/types/classAnalytics/classSimuladoAnalytics";
import { listClassSimuladoMonths } from "@/services/prepCourse/class/listClassSimuladoMonths";
import { getClassSimuladoByMonth } from "@/services/prepCourse/class/getClassSimuladoByMonth";
import { refreshClassSimuladoAnalytics } from "@/services/prepCourse/class/refreshClassSimuladoAnalytics";
import { useRefreshPolling } from "@/hooks/useRefreshPolling";
import { KpiHeader } from "./KpiHeader";
import { SampleSizeBanner } from "./SampleSizeBanner";
import { EmptyState } from "./EmptyState";
import { MateriaRadar } from "@/components/molecules/materiaRadar";
import { FrenteRadar } from "@/components/molecules/frenteRadar";
import { ClassEvolutionChart } from "@/components/molecules/classEvolutionChart";

interface Props {
  classId: string;
  token: string;
  selectedMonth?: string | null;
  onSelectMonth?: (month: string) => void;
  onListLoaded?: (list: ClassMonthsList) => void;
}

export function ClassSimuladoAnalytics({
  classId,
  token,
  selectedMonth: selectedMonthProp,
  onSelectMonth,
  onListLoaded,
}: Props) {
  const isControlled = selectedMonthProp !== undefined && onSelectMonth !== undefined;
  const [list, setList] = useState<ClassMonthsList | null>(null);
  const [loading, setLoading] = useState(true);
  const [internalMonth, setInternalMonth] = useState<string | null>(null);
  const selectedMonth = isControlled ? selectedMonthProp ?? null : internalMonth;
  const setSelectedMonth = useCallback(
    (m: string) => {
      if (onSelectMonth) onSelectMonth(m);
      else setInternalMonth(m);
    },
    [onSelectMonth],
  );
  const [monthData, setMonthData] = useState<ClassMonthAnalytics | null>(null);
  const [monthLoading, setMonthLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [selectedMateriaId, setSelectedMateriaId] = useState<string | undefined>(undefined);
  const [view, setView] = useState<"materia" | "frente">("materia");
  const [viewTouched, setViewTouched] = useState(false);

  useEffect(() => {
    setLoading(true);
    listClassSimuladoMonths(classId, token)
      .then((data) => {
        setList(data);
        onListLoaded?.(data);
        if (data.months.length > 0 && !selectedMonth) {
          setSelectedMonth(data.months[data.months.length - 1].month);
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, token]);

  useEffect(() => {
    if (!selectedMonth) return;
    setMonthLoading(true);
    setMonthData(null);
    setSelectedMateriaId(undefined);
    setViewTouched(false);
    getClassSimuladoByMonth(classId, selectedMonth, token)
      .then(setMonthData)
      .finally(() => setMonthLoading(false));
  }, [classId, selectedMonth, token]);

  useEffect(() => {
    if (viewTouched || !monthData) return;
    setView(monthData.materias.length <= 1 ? "frente" : "materia");
  }, [monthData, viewTouched]);

  const baselineGeneratedAt = monthData?.generatedAt ?? null;

  const { latest, timedOut } = useRefreshPolling(
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
      toast.success("Dados de simulado atualizados!");
    }
  }, [latest]);

  useEffect(() => {
    if (timedOut) {
      setRefreshing(false);
      toast.info(
        "Ainda processando em segundo plano. Recarregue a página em alguns minutos para ver os dados atualizados.",
      );
    }
  }, [timedOut]);

  const handleRefresh = useCallback(async () => {
    if (!selectedMonth || requesting || refreshing) return;
    setRequesting(true);
    try {
      await refreshClassSimuladoAnalytics(classId, "current", token);
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
  }, [classId, selectedMonth, refreshing, requesting, token]);

  const handleGenerate = useCallback(async () => {
    if (requesting || refreshing) return;
    setRequesting(true);
    try {
      await refreshClassSimuladoAnalytics(classId, "all", token);
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
    return <p className="py-8 text-center text-sm text-gray-400">Carregando dados da turma...</p>;
  }

  if (!list) {
    return <p className="py-8 text-center text-sm text-red-400">Erro ao carregar dados.</p>;
  }

  const selectedMateria = monthData?.materias.find((m) => m.id === selectedMateriaId);

  return (
    <div className="space-y-5">
      <KpiHeader
        list={list}
        monthData={monthData}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        requesting={requesting}
      />

      {list.months.length === 0 ? (
        <EmptyState
          variant="no-months"
          onGenerate={list.coursePeriod.isActive ? handleGenerate : undefined}
          loading={refreshing || requesting}
        />
      ) : (
        <>
          <ClassEvolutionChart
            months={list.months}
            selectedMonth={selectedMonth}
            onSelectMonth={(m) => {
              setSelectedMonth(m);
              setSelectedMateriaId(undefined);
            }}
          />

          {monthLoading && (
            <p className="py-6 text-center text-sm text-gray-400">Carregando mês...</p>
          )}

          {!monthLoading && !monthData && <EmptyState variant="month-empty" />}

          {!monthLoading && monthData && (
            <>
              <SampleSizeBanner monthData={monthData} totalStudents={list.totalStudents} />
              {monthData.materias.length > 0 && (
                <div className="flex items-center justify-end gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setView("materia");
                      setViewTouched(true);
                    }}
                    className={`rounded-l border px-3 py-1 ${
                      view === "materia"
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                    aria-pressed={view === "materia"}
                  >
                    Por matéria
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView("frente");
                      setViewTouched(true);
                    }}
                    className={`-ml-px rounded-r border px-3 py-1 ${
                      view === "frente"
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                    aria-pressed={view === "frente"}
                  >
                    Por frente
                  </button>
                </div>
              )}
              {view === "materia" ? (
                <>
                  <MateriaRadar
                    materias={monthData.materias}
                    onSelectMateria={setSelectedMateriaId}
                    selectedMateriaId={selectedMateriaId}
                  />
                  {selectedMateria && <FrenteRadar materias={[selectedMateria]} />}
                </>
              ) : (
                <FrenteRadar materias={monthData.materias} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
