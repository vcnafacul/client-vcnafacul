import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { mensagemDeErro } from "@/utils/mensagemDeErro";
import { ClassMonthAnalytics, ClassMonthsList } from "@/types/classAnalytics/classSimuladoAnalytics";
import { listClassSimuladoMonths } from "@/services/prepCourse/class/listClassSimuladoMonths";
import { getClassSimuladoByMonth } from "@/services/prepCourse/class/getClassSimuladoByMonth";
import { refreshClassSimuladoAnalytics } from "@/services/prepCourse/class/refreshClassSimuladoAnalytics";
import { mesAtual, useAcompanharRecalculo } from "@/hooks/useAcompanharRecalculo";
import { KpiHeader } from "./KpiHeader";
import { SampleSizeBanner } from "./SampleSizeBanner";
import { EmptyState } from "./EmptyState";
import { MateriaRadar } from "@/components/molecules/materiaRadar";
import { FrenteRadar } from "@/components/molecules/frenteRadar";
import { ClassEvolutionChart } from "@/components/molecules/classEvolutionChart";

interface Props {
  classId: string;
  token: string;
  /** Gerenciar Turmas: atualizar e gerar os dados (card 07). */
  podeAtualizar: boolean;
  selectedMonth?: string | null;
  onSelectMonth?: (month: string) => void;
  onListLoaded?: (list: ClassMonthsList) => void;
}

export function ClassSimuladoAnalytics({
  classId,
  token,
  podeAtualizar,
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
  /**
   * O que está sendo recalculado (cards 09 e 10): o mês atual ("Atualizar mês
   * atual") ou todos, numa turma ainda sem meses ("Gerar agora").
   */
  const [acompanhando, setAcompanhando] = useState<
    { modo: "mes"; mes: string; baseline: string | null } | { modo: "gerar" } | null
  >(null);
  const refreshing = acompanhando !== null;
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
          const sorted = [...data.months].sort((a, b) => a.month.localeCompare(b.month));
          setSelectedMonth(sorted[sorted.length - 1].month);
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

  const recarregarLista = useCallback(async () => {
    const data = await listClassSimuladoMonths(classId, token);
    setList(data);
    onListLoaded?.(data);
    return data;
  }, [classId, token, onListLoaded]);

  const doMes = useAcompanharRecalculo({
    ativo: acompanhando?.modo === "mes",
    consultar: () =>
      getClassSimuladoByMonth(
        classId,
        acompanhando?.modo === "mes" ? acompanhando.mes : "",
        token,
      ),
    pronto: (r) =>
      !!r &&
      acompanhando?.modo === "mes" &&
      r.generatedAt !== acompanhando.baseline,
  });

  // Turma sem meses: não há mês para acompanhar — acompanha a lista (card 09).
  const daLista = useAcompanharRecalculo({
    ativo: acompanhando?.modo === "gerar",
    consultar: () => listClassSimuladoMonths(classId, token),
    pronto: (l) => l.months.length > 0,
  });

  useEffect(() => {
    if (!doMes.resultado) return;
    setMonthData(doMes.resultado);
    setAcompanhando(null);
    toast.success("Dados de simulado atualizados!");
    // O mês atual pode ser novo: entra no seletor sem recarregar (card 10).
    recarregarLista().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doMes.resultado]);

  useEffect(() => {
    if (!daLista.resultado) return;
    const data = daLista.resultado;
    setList(data);
    onListLoaded?.(data);
    const sorted = [...data.months].sort((a, b) => a.month.localeCompare(b.month));
    setSelectedMonth(sorted[sorted.length - 1].month);
    setAcompanhando(null);
    toast.success("Relatório de simulado gerado!");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daLista.resultado]);

  useEffect(() => {
    if (!doMes.esgotou && !daLista.esgotou) return;
    setAcompanhando(null);
    toast.info(
      "Ainda processando em segundo plano. Recarregue a página em alguns minutos para ver os dados atualizados.",
    );
  }, [doMes.esgotou, daLista.esgotou]);

  /**
   * "Atualizar mês atual" (card 10): a api recalcula só o mês atual. A tela
   * passa a mostrar esse mês e espera ele mudar — antes esperava o mês
   * selecionado, que num mês antigo nunca mudava.
   */
  const handleRefresh = useCallback(async () => {
    if (requesting || refreshing) return;
    setRequesting(true);
    try {
      await refreshClassSimuladoAnalytics(classId, "current", token);
      const mes = mesAtual();
      const baseline =
        (mes === selectedMonth
          ? monthData?.generatedAt
          : list?.months.find((m) => m.month === mes)?.generatedAt) ?? null;
      setSelectedMonth(mes);
      setAcompanhando({ modo: "mes", mes, baseline });
      toast.info(
        "Atualização enfileirada. O processamento acontece em segundo plano — pode levar alguns minutos.",
      );
    } catch (e) {
      console.error(e);
      toast.error(
        mensagemDeErro(
          e,
          "atualizar os dados",
          "Falha ao solicitar atualização. Tente novamente.",
        ),
      );
    } finally {
      setRequesting(false);
    }
  }, [classId, list, monthData, refreshing, requesting, selectedMonth, setSelectedMonth, token]);

  const handleGenerate = useCallback(async () => {
    if (requesting || refreshing) return;
    setRequesting(true);
    try {
      await refreshClassSimuladoAnalytics(classId, "all", token);
      setAcompanhando({ modo: "gerar" });
      toast.info(
        "Geração enfileirada. O processamento acontece em segundo plano — pode levar alguns minutos.",
      );
    } catch (e) {
      console.error(e);
      toast.error(
        mensagemDeErro(
          e,
          "gerar os dados",
          "Falha ao solicitar geração. Tente novamente.",
        ),
      );
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
        onRefresh={podeAtualizar ? handleRefresh : undefined}
        refreshing={refreshing}
        requesting={requesting}
      />

      {list.months.length === 0 ? (
        <EmptyState
          variant="no-months"
          onGenerate={
            list.coursePeriod.isActive && podeAtualizar ? handleGenerate : undefined
          }
          aviso={
            list.coursePeriod.isActive && !podeAtualizar
              ? "Os dados ainda não foram gerados. Quem gerencia turmas pode gerar."
              : undefined
          }
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
              {/*
                ⚠️ O limiar `max(3, 10%)` vive AQUI desde o card 09: ele é a
                regra do agregado mensal, e o banner passou a receber números
                para poder servir também ao relatório de simulado.
              */}
              <SampleSizeBanner
                comDados={monthData.studentsWithAtLeastOneCompletedAttempt}
                minimo={Math.max(3, Math.floor(list.totalStudents * 0.1))}
                descricao="com simulado completo"
              />
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
