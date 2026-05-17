import { useCallback, useEffect, useState } from "react";
import { ClassMonthAnalytics, ClassMonthsList } from "@/types/classAnalytics/classSimuladoAnalytics";
import { listClassSimuladoMonths } from "@/services/prepCourse/class/listClassSimuladoMonths";
import { getClassSimuladoByMonth } from "@/services/prepCourse/class/getClassSimuladoByMonth";
import { refreshClassSimuladoAnalytics } from "@/services/prepCourse/class/refreshClassSimuladoAnalytics";
import { useRefreshPolling } from "@/hooks/useRefreshPolling";
import { KpiHeader } from "./KpiHeader";
import { MonthPicker } from "./MonthPicker";
import { SampleSizeBanner } from "./SampleSizeBanner";
import { EmptyState } from "./EmptyState";
import { MateriaRadar } from "@/components/molecules/materiaRadar";
import { FrenteRadar } from "@/components/molecules/frenteRadar";
import { ClassEvolutionChart } from "@/components/molecules/classEvolutionChart";

interface Props {
  classId: string;
  token: string;
}

export function ClassSimuladoAnalytics({ classId, token }: Props) {
  const [list, setList] = useState<ClassMonthsList | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [monthData, setMonthData] = useState<ClassMonthAnalytics | null>(null);
  const [monthLoading, setMonthLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMateriaId, setSelectedMateriaId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setLoading(true);
    listClassSimuladoMonths(classId, token)
      .then((data) => {
        setList(data);
        if (data.months.length > 0) {
          setSelectedMonth(data.months[data.months.length - 1].month);
        }
      })
      .finally(() => setLoading(false));
  }, [classId, token]);

  useEffect(() => {
    if (!selectedMonth) return;
    setMonthLoading(true);
    setMonthData(null);
    setSelectedMateriaId(undefined);
    getClassSimuladoByMonth(classId, selectedMonth, token)
      .then(setMonthData)
      .finally(() => setMonthLoading(false));
  }, [classId, selectedMonth, token]);

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
    }
  }, [latest]);

  useEffect(() => {
    if (timedOut) setRefreshing(false);
  }, [timedOut]);

  const handleRefresh = useCallback(async () => {
    if (!selectedMonth || refreshing) return;
    setRefreshing(true);
    try {
      await refreshClassSimuladoAnalytics(classId, "current", token);
    } catch {
      setRefreshing(false);
    }
  }, [classId, selectedMonth, refreshing, token]);

  const handleGenerate = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshClassSimuladoAnalytics(classId, "all", token);
    } catch {
      setRefreshing(false);
    }
  }, [classId, token]);

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
      />

      {list.months.length === 0 ? (
        <EmptyState
          variant="no-months"
          onGenerate={list.coursePeriod.isActive ? handleGenerate : undefined}
          loading={refreshing}
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

          <MonthPicker
            months={list.months}
            value={selectedMonth}
            onChange={(m) => {
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
              <MateriaRadar
                materias={monthData.materias}
                onSelectMateria={setSelectedMateriaId}
                selectedMateriaId={selectedMateriaId}
              />
              {selectedMateria && <FrenteRadar materia={selectedMateria} />}
            </>
          )}
        </>
      )}
    </div>
  );
}
