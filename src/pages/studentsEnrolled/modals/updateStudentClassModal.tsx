import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    endDate: Date,
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
    classId,
  );
  const [selectedClass, setSelectedClass] = useState<ClassEntity | undefined>();
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(
    new Set(),
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
            classItem.coursePeriod.year.toString().includes(searchLower),
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
      classSelected.coursePeriod.endDate,
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
        (classItem) => classItem.id === selectedClassId,
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
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent size="lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Selecionar Turma</DialogTitle>
          <p
            className={`${
              isMobile ? "text-body" : "text-h3"
            } text-muted-foreground`}
          >
            Selecione uma nova turma para o estudante
          </p>
        </DialogHeader>

        <div>
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
                    isMobile ? "p-2.5 text-body" : "p-3 text-body"
                  } border-2 border-border rounded-md focus:border-primary focus:outline-none transition-colors`}
                  aria-label="Buscar turmas"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground active:text-foreground transition-colors"
                    aria-label="Limpar busca"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="text-caption text-muted-foreground mt-1">
                  {filteredClassesByPeriod.reduce(
                    (acc, period) => acc + period.classes.length,
                    0,
                  )}{" "}
                  resultado(s) encontrado(s)
                </p>
              )}
            </div>
          )}

          {/* Estado de Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner size="page" decorative className="mb-4 text-primary" />
              <p className="text-muted-foreground text-center">
                Carregando turmas...
              </p>
            </div>
          )}

          {/* Estado de Erro */}
          {error && !isLoading && (
            <div className="bg-destructive-muted border-2 border-destructive rounded-lg p-4 text-center">
              <p className="text-destructive font-semibold mb-3">❌ {error}</p>
              <button
                onClick={loadClasses}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 active:bg-primary/80 transition-colors text-body font-medium"
              >
                🔄 Tentar Novamente
              </button>
            </div>
          )}

          {/* Versão Mobile - Cards */}
          {!isLoading && !error && isMobile ? (
            <div className="space-y-2">
              {filteredClassesByPeriod.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-h3 mb-2">🔍</p>
                  <p>Nenhuma turma encontrada</p>
                </div>
              ) : (
                filteredClassesByPeriod.map((period) => (
                  <div
                    key={period.periodId}
                    className="border-2 border-border rounded-lg overflow-hidden"
                  >
                    {/* Header do Período */}
                    <button
                      onClick={() => togglePeriod(period.periodId)}
                      className="w-full p-3 bg-info-muted flex justify-between items-center active:bg-accent transition-all duration-200"
                      aria-expanded={expandedPeriods.has(period.periodId)}
                      aria-label={`${
                        expandedPeriods.has(period.periodId)
                          ? "Recolher"
                          : "Expandir"
                      } período ${period.periodName}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-h2">📚</span>
                        <div className="text-left">
                          <p className="font-bold text-foreground text-body">
                            {period.periodName}
                          </p>
                          <p className="text-caption text-muted-foreground">
                            {period.year} • {period.classes.length}{" "}
                            {period.classes.length === 1 ? "turma" : "turmas"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`transform transition-transform ${
                          expandedPeriods.has(period.periodId)
                            ? "rotate-180"
                            : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>

                    {/* Lista de Turmas */}
                    {expandedPeriods.has(period.periodId) && (
                      <div className="divide-y divide-border animate-in fade-in duration-200">
                        {period.classes.map((classItem) => (
                          <button
                            key={classItem.id}
                            onClick={() => setSelectedClassId(classItem.id)}
                            className={`w-full p-3 text-left transition-colors active:bg-info-muted ${
                              selectedClassId === classItem.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-white hover:bg-page"
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
                                    className={`font-semibold text-body ${
                                      selectedClassId === classItem.id
                                        ? "text-primary-foreground"
                                        : "text-foreground"
                                    }`}
                                  >
                                    {classItem.name}
                                  </p>
                                  {classId === classItem.id && (
                                    <span className="bg-cta text-cta-foreground text-caption px-2 py-0.5 rounded-full font-bold">
                                      Atual
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={`text-caption ${
                                    selectedClassId === classItem.id
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {classItem.number_students}{" "}
                                  {classItem.number_students === 1
                                    ? "aluno"
                                    : "alunos"}
                                </p>
                              </div>
                              {selectedClassId === classItem.id && (
                                <span className="text-h2">✓</span>
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
                  className="w-full p-3 border-2 rounded-md focus:border-primary focus:outline-none cursor-pointer text-body"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  size={Math.min(filteredClassesByPeriod.length * 2 + 2, 8)}
                >
                  <option value="" className="text-muted-foreground">
                    -- Selecione uma turma --
                  </option>
                  {filteredClassesByPeriod.map((period) => (
                    <optgroup
                      key={period.periodId}
                      label={`📚 ${period.periodName} (${period.year})`}
                      className="font-bold text-primary bg-page"
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
                <p className="text-body text-muted-foreground mt-2">
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
              } border-2 border-info rounded-lg bg-info-muted shadow-sm`}
            >
              <p
                className={`font-bold ${
                  isMobile ? "text-body mb-2" : "text-h3 mb-3"
                } text-foreground flex items-center gap-2`}
              >
                <span>📋</span>{" "}
                {isMobile ? "Detalhes" : "Detalhes da Turma Selecionada"}
              </p>
              <div
                className={
                  isMobile ? "space-y-1.5 text-caption" : "space-y-2 text-body"
                }
              >
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-foreground">Nome:</span>
                  <span className="text-foreground text-right">
                    {selectedClass.name}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-foreground">
                    Período:
                  </span>
                  <span className="text-foreground text-right">
                    {selectedClass.coursePeriod.name}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-foreground">Ano:</span>
                  <span className="text-foreground text-right">
                    {selectedClass.coursePeriod.year}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-foreground">Início:</span>
                  <span className="text-foreground text-right">
                    {formatDate(
                      selectedClass.coursePeriod.startDate?.toString(),
                    )}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-foreground">
                    Término:
                  </span>
                  <span className="text-foreground text-right">
                    {formatDate(selectedClass.coursePeriod.endDate?.toString())}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="font-semibold text-foreground">
                    Estudantes:
                  </span>
                  <span className="text-foreground font-bold text-right">
                    {selectedClass.number_students}
                  </span>
                </div>
                {selectedClass.description && (
                  <div className="pt-2 border-t border-border">
                    <span className="font-semibold text-foreground block mb-1">
                      Descrição:
                    </span>
                    <p
                      className={`text-muted-foreground ${
                        isMobile ? "text-caption" : "text-caption"
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
            <div className="bg-warning-muted border-2 border-warning rounded-lg p-3 text-center mb-4">
              <p className="text-foreground text-body font-medium">
                ⚠️ Esta já é a turma atual do estudante. Selecione uma turma
                diferente.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirmClass}
            disabled={!selectedClassId || selectedClassId === classId}
            title={
              selectedClassId === classId
                ? "Selecione uma turma diferente da atual"
                : ""
            }
          >
            {isMobile ? "Confirmar" : "Confirmar Matrícula"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
