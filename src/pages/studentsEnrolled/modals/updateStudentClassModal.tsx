import Text from "@/components/atoms/text";
import ModalTemplate from "@/components/templates/modalTemplate";
import { getAllClasses } from "@/services/prepCourse/class/getAllClasses";
import { useAuthStore } from "@/store/auth";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { formatDate } from "@/utils/date";
import { useEffect, useRef, useState } from "react";
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
  const selectRef = useRef<HTMLSelectElement>(null);
  const isMobile = useIsMobile();

  const {
    data: { token },
  } = useAuthStore();

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
          // Primeiro por ano (mais recente primeiro)
          if (b.year !== a.year) {
            return b.year - a.year;
          }
          // Se mesmo ano, ordenar por data de início (mais recente primeiro)
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
          // Expandir período da turma selecionada
          if (foundClass && isMobile) {
            setExpandedPeriods(new Set([foundClass.coursePeriod.id]));
          }
        }
      })
      .catch(() => {
        toast.error("Erro ao buscar turmas");
      });
  }, [token, classId, isMobile]);

  useEffect(() => {
    if (selectedClassId) {
      const foundClass = classes.find(
        (classItem) => classItem.id === selectedClassId
      );
      setSelectedClass(foundClass);
    }
  }, [selectedClassId, classes]);

  // Auto-abrir o select quando o modal abrir
  useEffect(() => {
    if (isOpen && selectRef.current && !classId) {
      // Pequeno delay para garantir que o modal esteja totalmente renderizado
      const timer = setTimeout(() => {
        selectRef.current?.focus();
        // Tentar abrir o select (funciona em alguns navegadores)
        selectRef.current?.click();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, classId]);

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
          {isMobile ? "Selecionar Turma" : "Alterar Turma do Estudante"}
        </Text>
        <p
          className={`${
            isMobile ? "text-sm mb-3" : "text-lg mb-4"
          } text-center text-gray-600`}
        >
          Selecione uma nova turma para o estudante
        </p>

        {/* Versão Mobile - Cards */}
        {isMobile ? (
          <div className="space-y-2">
            {classesByPeriod.map((period) => (
              <div
                key={period.periodId}
                className="border-2 border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Header do Período */}
                <button
                  onClick={() => togglePeriod(period.periodId)}
                  className="w-full p-3 bg-gradient-to-r from-blue-50 to-blue-100 flex justify-between items-center active:bg-blue-200"
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
                  <div className="divide-y divide-gray-200">
                    {period.classes.map((classItem) => (
                      <button
                        key={classItem.id}
                        onClick={() => setSelectedClassId(classItem.id)}
                        className={`w-full p-3 text-left transition-colors active:bg-blue-100 ${
                          selectedClassId === classItem.id
                            ? "bg-blue-500 text-white"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p
                              className={`font-semibold text-sm ${
                                selectedClassId === classItem.id
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {classItem.name}
                            </p>
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
            ))}
          </div>
        ) : (
          /* Versão Desktop - Select */
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
              size={Math.min(classesByPeriod.length * 2 + 2, 8)}
            >
              <option value="" className="text-gray-400">
                -- Selecione uma turma --
              </option>
              {classesByPeriod.map((period) => (
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
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              {classesByPeriod.length > 0
                ? `${classesByPeriod.length} período(s) letivo(s) disponível(is)`
                : "Nenhuma turma disponível"}
            </p>
          </div>
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
          disabled={!selectedClassId}
        >
          {isMobile ? "Confirmar" : "Confirmar Matrícula"}
        </button>
      </div>
    </ModalTemplate>
  );
}
