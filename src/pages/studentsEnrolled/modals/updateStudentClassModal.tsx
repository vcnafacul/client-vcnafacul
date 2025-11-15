import Text from "@/components/atoms/text";
import ModalTemplate from "@/components/templates/modalTemplate";
import { getAllClasses } from "@/services/prepCourse/class/getAllClasses";
import { useAuthStore } from "@/store/auth";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { formatDate } from "@/utils/date";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

// Hook para detectar mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

// Tipo para agrupar turmas por período
type ClassesByPeriod = {
  periodId: string;
  periodName: string;
  year: number;
  startDate: Date;
  endDate: Date;
  classes: ClassEntity[];
};

interface UpdateStudentClassModalProps {
  isOpen: boolean;
  handleClose: () => void;
  classId?: string;
  handleConfirm: (
    classId: string,
    name: string,
    year: number,
    endDate: Date
  ) => void;
}

export function UpdateStudentClassModal({
  isOpen,
  handleClose,
  classId,
  handleConfirm,
}: UpdateStudentClassModalProps) {
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [classesByPeriod, setClassesByPeriod] = useState<ClassesByPeriod[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(
    classId
  );
  const [selectedClass, setSelectedClass] = useState<ClassEntity | undefined>();
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef<HTMLSelectElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const {
    data: { token },
  } = useAuthStore();

  // Filtrar períodos e turmas com base na busca
  const filteredClassesByPeriod = useMemo(() => {
    if (!searchTerm.trim()) return classesByPeriod;

    const searchLower = searchTerm.toLowerCase();
    return classesByPeriod
      .map((period) => ({
        ...period,
        classes: period.classes.filter(
          (classItem) =>
            classItem.name.toLowerCase().includes(searchLower) ||
            classItem.coursePeriod.name.toLowerCase().includes(searchLower) ||
            classItem.coursePeriod.year.toString().includes(searchLower)
        ),
      }))
      .filter((period) => period.classes.length > 0);
  }, [classesByPeriod, searchTerm]);

  const togglePeriod = (periodId: string) => {
    setExpandedPeriods((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(periodId)) {
        newSet.delete(periodId);
      } else {
        newSet.add(periodId);
      }
      return newSet;
    });
  };

  const loadClasses = () => {
    setIsLoading(true);
    setError(null);

    getAllClasses(token, 1, 100)
      .then((res) => {
        setClasses(res.data);

        // Agrupar turmas por período letivo
        const periodsMap = new Map<string, ClassesByPeriod>();

        res.data.forEach((classItem) => {
          const periodId = classItem.coursePeriod.id;

          if (!periodsMap.has(periodId)) {
            periodsMap.set(periodId, {
              periodId,
              periodName: classItem.coursePeriod.name,
              year: classItem.coursePeriod.year,
              startDate: classItem.coursePeriod.startDate,
              endDate: classItem.coursePeriod.endDate,
              classes: [],
            });
          }

          periodsMap.get(periodId)!.classes.push(classItem);
        });

        // Converter Map para array e ordenar por ano (mais recente primeiro)
        const periodsSorted = Array.from(periodsMap.values()).sort((a, b) => {
          if (b.year !== a.year) {
            return b.year - a.year;
          }
          return (
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
        });

        setClassesByPeriod(periodsSorted);

        // Expandir o primeiro período por padrão em mobile
        if (periodsSorted.length > 0 && isMobile) {
          setExpandedPeriods(new Set([periodsSorted[0].periodId]));
        }

        if (classId) {
          const foundClass = res.data.find((c) => c.id === classId);
          setSelectedClass(foundClass);
          if (foundClass && isMobile) {
            setExpandedPeriods(new Set([foundClass.coursePeriod.id]));
          }
        }

        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar turmas:", err);
        setError("Erro ao carregar turmas. Tente novamente.");
        toast.error("Erro ao buscar turmas");
        setIsLoading(false);
      });
  };

  const handleConfirmClass = () => {
    if (!selectedClassId) {
      toast.error("Selecione uma turma");
      return;
    }
    const classSelected = classes.find((c) => c.id === selectedClassId)!;
    handleConfirm(
      classSelected.id,
      classSelected.name,
      classSelected.coursePeriod.year,
      classSelected.coursePeriod.endDate
    );
  };

  useEffect(() => {
    if (!isOpen) return; // Só buscar quando modal abrir
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (selectedClassId) {
      const foundClass = classes.find(
        (classItem) => classItem.id === selectedClassId
      );
      setSelectedClass(foundClass);
    }
  }, [selectedClassId, classes]);

  // Auto-abrir o select quando o modal abrir (desktop) ou focar busca (mobile)
  useEffect(() => {
    if (isOpen && !classId && !isLoading) {
      const timer = setTimeout(() => {
        if (isMobile && searchInputRef.current) {
          searchInputRef.current.focus();
        } else if (selectRef.current) {
          selectRef.current.focus();
          selectRef.current.click();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, classId, isMobile, isLoading]);

  // Suporte a tecla ESC para fechar modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, handleClose]);

  // Limpar busca ao fechar modal
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className={`bg-white rounded-md border-2 ${
        isMobile
          ? "p-3 fixed inset-0 m-0 max-w-full max-h-full h-full overflow-y-auto"
          : "p-4 max-w-2xl"
      }`}
    >
      <div className={isMobile ? "pb-20" : ""}>
        <Text
          size="secondary"
          className={`font-bold text-center ${
            isMobile ? "mb-3 text-lg" : "mb-4"
          }`}
        >
          Selecionar Turma
        </Text>
        <p
          className={`${
            isMobile ? "text-sm mb-3" : "text-lg mb-4"
          } text-center text-gray-600`}
        >
          Selecione uma nova turma para o estudante
        </p>

        {/* Campo de busca */}
        {!isLoading && !error && (
          <div className={`${isMobile ? "mb-3" : "mb-4"}`}>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="🔍 Buscar turma, período ou ano..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${
                  isMobile ? "p-2.5 text-sm" : "p-3 text-base"
                } border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none transition-colors`}
                aria-label="Buscar turmas"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors"
                  aria-label="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-xs text-gray-500 mt-1">
                {filteredClassesByPeriod.reduce(
                  (acc, period) => acc + period.classes.length,
                  0
                )}{" "}
                resultado(s) encontrado(s)
              </p>
            )}
          </div>
        )}

        {/* Estado de Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 text-center">Carregando turmas...</p>
          </div>
        )}

        {/* Estado de Erro */}
        {error && !isLoading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 font-semibold mb-3">❌ {error}</p>
            <button
              onClick={loadClasses}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm font-medium"
            >
              🔄 Tentar Novamente
            </button>
          </div>
        )}

        {/* Versão Mobile - Cards */}
        {!isLoading && !error && isMobile ? (
          <div className="space-y-2">
            {filteredClassesByPeriod.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">🔍</p>
                <p>Nenhuma turma encontrada</p>
              </div>
            ) : (
              filteredClassesByPeriod.map((period) => (
                <div
                  key={period.periodId}
                  className="border-2 border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Header do Período */}
                  <button
                    onClick={() => togglePeriod(period.periodId)}
                    className="w-full p-3 bg-gradient-to-r from-blue-50 to-blue-100 flex justify-between items-center active:bg-blue-200 transition-all duration-200"
                    aria-expanded={expandedPeriods.has(period.periodId)}
                    aria-label={`${
                      expandedPeriods.has(period.periodId)
                        ? "Recolher"
                        : "Expandir"
                    } período ${period.periodName}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📚</span>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 text-sm">
                          {period.periodName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {period.year} • {period.classes.length}{" "}
                          {period.classes.length === 1 ? "turma" : "turmas"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`transform transition-transform ${
                        expandedPeriods.has(period.periodId) ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {/* Lista de Turmas */}
                  {expandedPeriods.has(period.periodId) && (
                    <div className="divide-y divide-gray-200 animate-in fade-in duration-200">
                      {period.classes.map((classItem) => (
                        <button
                          key={classItem.id}
                          onClick={() => setSelectedClassId(classItem.id)}
                          className={`w-full p-3 text-left transition-colors active:bg-blue-100 ${
                            selectedClassId === classItem.id
                              ? "bg-blue-500 text-white"
                              : "bg-white hover:bg-gray-50"
                          }`}
                          role="radio"
                          aria-checked={selectedClassId === classItem.id}
                          aria-label={`Selecionar turma ${classItem.name} com ${
                            classItem.number_students
                          } alunos${
                            classId === classItem.id ? " (turma atual)" : ""
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`font-semibold text-sm ${
                                    selectedClassId === classItem.id
                                      ? "text-white"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {classItem.name}
                                </p>
                                {classId === classItem.id && (
                                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                    Atual
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-xs ${
                                  selectedClassId === classItem.id
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }`}
                              >
                                {classItem.number_students}{" "}
                                {classItem.number_students === 1
                                  ? "aluno"
                                  : "alunos"}
                              </p>
                            </div>
                            {selectedClassId === classItem.id && (
                              <span className="text-xl">✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* Versão Desktop - Select */
          !isLoading &&
          !error && (
            <div className="mb-4">
              <label htmlFor="classSelect" className="block font-bold mb-2">
                Selecione a Turma
              </label>
              <select
                ref={selectRef}
                id="classSelect"
                className="w-full p-3 border-2 rounded-md focus:border-blue-500 focus:outline-none cursor-pointer text-base"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                autoFocus={!classId}
                size={Math.min(filteredClassesByPeriod.length * 2 + 2, 8)}
              >
                <option value="" className="text-gray-400">
                  -- Selecione uma turma --
                </option>
                {filteredClassesByPeriod.map((period) => (
                  <optgroup
                    key={period.periodId}
                    label={`📚 ${period.periodName} (${period.year})`}
                    className="font-bold text-blue-600 bg-gray-50"
                  >
                    {period.classes.map((classItem) => (
                      <option
                        key={classItem.id}
                        value={classItem.id}
                        className="py-2 pl-4"
                      >
                        {classItem.name} • {classItem.number_students} alunos
                        {classId === classItem.id ? " 🔶 ATUAL" : ""}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                {filteredClassesByPeriod.length > 0
                  ? `${filteredClassesByPeriod.length} período(s) letivo(s) disponível(is)`
                  : "Nenhuma turma disponível"}
              </p>
            </div>
          )
        )}

        {selectedClass && (
          <div
            className={`${
              isMobile ? "mt-3 mb-4 p-3" : "mb-4 p-4"
            } border-2 border-blue-200 rounded-lg bg-blue-50 shadow-sm`}
          >
            <p
              className={`font-bold ${
                isMobile ? "text-base mb-2" : "text-lg mb-3"
              } text-blue-900 flex items-center gap-2`}
            >
              <span>📋</span>{" "}
              {isMobile ? "Detalhes" : "Detalhes da Turma Selecionada"}
            </p>
            <div
              className={isMobile ? "space-y-1.5 text-xs" : "space-y-2 text-sm"}
            >
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-gray-700">Nome:</span>
                <span className="text-gray-900 text-right">
                  {selectedClass.name}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-gray-700">Período:</span>
                <span className="text-gray-900 text-right">
                  {selectedClass.coursePeriod.name}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-gray-700">Ano:</span>
                <span className="text-gray-900 text-right">
                  {selectedClass.coursePeriod.year}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-gray-700">Início:</span>
                <span className="text-gray-900 text-right">
                  {formatDate(selectedClass.coursePeriod.startDate?.toString())}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-gray-700">Término:</span>
                <span className="text-gray-900 text-right">
                  {formatDate(selectedClass.coursePeriod.endDate?.toString())}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-gray-700">Estudantes:</span>
                <span className="text-gray-900 font-bold text-right">
                  {selectedClass.number_students}
                </span>
              </div>
              {selectedClass.description && (
                <div className="pt-2 border-t border-blue-200">
                  <span className="font-semibold text-gray-700 block mb-1">
                    Descrição:
                  </span>
                  <p
                    className={`text-gray-600 ${
                      isMobile ? "text-xs" : "text-xs"
                    } leading-relaxed`}
                  >
                    {isMobile
                      ? selectedClass.description.slice(0, 100)
                      : selectedClass.description.slice(0, 200)}
                    {selectedClass.description.length >
                      (isMobile ? 100 : 200) && "..."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mensagem quando a turma atual é selecionada */}
        {selectedClassId && selectedClassId === classId && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 text-center mb-4">
            <p className="text-yellow-800 text-sm font-medium">
              ⚠️ Esta já é a turma atual do estudante. Selecione uma turma
              diferente.
            </p>
          </div>
        )}
      </div>

      {/* Botões */}
      <div
        className={`${
          isMobile
            ? "fixed bottom-0 left-0 right-0 p-3 bg-white border-t-2 border-gray-200 flex gap-2"
            : "flex justify-end gap-4 mt-6"
        }`}
      >
        <button
          className={`${
            isMobile ? "flex-1 py-3 text-sm" : "px-6 py-2"
          } bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 active:bg-gray-500 transition-colors font-medium`}
          onClick={handleClose}
        >
          Cancelar
        </button>
        <button
          className={`${
            isMobile ? "flex-1 py-3 text-sm" : "px-6 py-2"
          } bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm`}
          onClick={handleConfirmClass}
          disabled={!selectedClassId || selectedClassId === classId}
          title={
            selectedClassId === classId
              ? "Selecione uma turma diferente da atual"
              : ""
          }
        >
          {isMobile ? "Confirmar" : "Confirmar Matrícula"}
        </button>
      </div>
    </ModalTemplate>
  );
}
