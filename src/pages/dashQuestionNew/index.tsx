import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestionCardBase } from "@/dtos/question/questionV2Dto";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getAllQuestions } from "@/services/question/getAllQuestion";
import { getInfosQuestion } from "@/services/question/getInfosQuestion";
import { useAuthStore } from "@/store/auth";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FilterValues, QuestionFilters } from "./components/QuestionFilters";
import { SimpleQuestionCard } from "./components/simpleQuestionCard";
import { ModalQuestionDetailsRefactored } from "./modals/ModalQuestionDetailsRefactored";

function DashQuestionNew() {
  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();
  const modals = useModals(["modalQuestionDetails"]);

  const [questions, setQuestions] = useState<QuestionCardBase[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [infos, setInfos] = useState<any>(null);

  // Filters state
  const [filters, setFilters] = useState<FilterValues>({
    status: StatusEnum.All,
    materia: "",
    frente: "",
    prova: "",
    enemArea: "",
    filterText: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const limitCards = 40;

  const infosQuestion = useCallback(async () => {
    const infos = await getInfosQuestion(token);
    setInfos(infos);
  }, [token]);

  const getQuestions = useCallback(
    async (page: number = 1) => {
      setIsLoading(true);
      await executeAsync({
        action: () =>
          getAllQuestions(
            token,
            filters.status,
            filters.filterText,
            page,
            limitCards,
            filters.materia,
            filters.frente,
            filters.prova,
            filters.enemArea
          ),
        loadingMessage: "Carregando questões...",
        successMessage: "Questões carregadas com sucesso",
        errorMessage: (error: any) => error.message,
        onSuccess: (res) => {
          setQuestions(res.data);
          setTotalItems(res.totalItems);
        },
        onFinally: () => setIsLoading(false),
      });
    },
    [token, filters]
  );

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset para primeira página ao filtrar
  };

  const handleCardClick = (questionId: string) => {
    setSelectedQuestionId(questionId);
    modals.modalQuestionDetails.open();
  };

  const handleCloseModal = () => {
    modals.modalQuestionDetails.close();
    setSelectedQuestionId(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (infos) {
      getQuestions(currentPage);
    }
  }, [currentPage, filters, infos]);

  useEffect(() => {
    infosQuestion();
  }, [infosQuestion]);

  const totalPages = Math.ceil(totalItems / limitCards);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    // Sempre mostra a primeira página
    pages.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
          className="cursor-pointer"
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Ellipsis inicial
    if (showEllipsisStart) {
      pages.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Páginas do meio
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Ellipsis final
    if (showEllipsisEnd) {
      pages.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Sempre mostra a última página
    if (totalPages > 1) {
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <Pagination className="my-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                currentPage > 1 && handlePageChange(currentPage - 1)
              }
              className={`cursor-pointer ${
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }`}
            />
          </PaginationItem>
          {pages}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                currentPage < totalPages && handlePageChange(currentPage + 1)
              }
              className={`cursor-pointer ${
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const hasActiveFilters =
    filters.status !== StatusEnum.All ||
    filters.materia ||
    filters.frente ||
    filters.prova ||
    filters.enemArea ||
    filters.filterText;

  return (
    <div className="container mx-auto p-6 max-w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Banco de Questões (Novo)
            </h1>
            <p className="text-muted-foreground mt-1">
              Visualize e explore as questões cadastradas
            </p>
          </div>

          {/* Botão para mostrar/esconder filtros */}
          {infos && (
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Esconder" : "Mostrar"} Filtros
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {hasActiveFilters && !showFilters && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  ✓
                </span>
              )}
            </Button>
          )}
        </div>

        {/* Filtros */}
        {infos && showFilters && (
          <QuestionFilters
            infos={infos}
            onFilter={handleFilterChange}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Informações e Paginação Superior */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            "Carregando..."
          ) : (
            <>
              Mostrando {questions.length} de {totalItems} questões | Página{" "}
              {currentPage} de {totalPages}
            </>
          )}
        </p>
      </div>

      {/* Paginação Superior */}
      {!isLoading && renderPagination()}

      {/* Questions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Nenhuma questão encontrada
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 justify-center">
          {questions.map((question) => (
            <SimpleQuestionCard
              key={question._id}
              question={question}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}

      {/* Paginação Inferior */}
      {!isLoading && renderPagination()}

      {/* Modal de Detalhes */}
      <ModalQuestionDetailsRefactored
        isOpen={modals.modalQuestionDetails.isOpen}
        onClose={handleCloseModal}
        questionId={selectedQuestionId}
        infos={infos}
      />
    </div>
  );
}

export default DashQuestionNew;
