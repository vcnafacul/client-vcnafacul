import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PaginationWrapper } from "../../components/organisms/paginationWrapper";
import { AproveitamentoHitoriesDTO } from "../../dtos/historico/getPerformanceDTO";
import { HistoricoDTO } from "../../dtos/historico/historicoDTO";
import { DASH, SIMULADO, SIMULATE_METRICS } from "../../routes/path";
import { getAllHistoricoSimulado } from "../../services/historico/getAllHistoricoSimulado";
import { getPerformance } from "../../services/historico/getPerformance";
import { useAuthStore } from "../../store/auth";
import { PerformanceChart } from "./components/performanceChart";
import { SimpleHistoryCard } from "./components/simpleHistoryCard";

export function SimulationHistories() {
  const [historical, setHistorical] = useState<HistoricoDTO[]>([]);
  const [aproveitamento, setAproveitamento] = useState<
    AproveitamentoHitoriesDTO | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: { token },
  } = useAuthStore();

  const limitCards = 20;
  const navigate = useNavigate();

  const onClickCard = (cardId: string) => {
    navigate(`${DASH}/${SIMULADO}${SIMULATE_METRICS}${cardId}`);
  };

  const loadHistorical = useCallback(
    async (page: number = 1) => {
      setIsLoading(true);
      try {
        const res = await getAllHistoricoSimulado(token, page, limitCards);
        setHistorical(res.data);
        setTotalItems(res.totalItems);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [token, limitCards]
  );

  const loadPerformance = useCallback(async () => {
    try {
      const res = await getPerformance(token);
      setAproveitamento(res);
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, [token]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    loadHistorical(currentPage);
  }, [currentPage, loadHistorical]);

  useEffect(() => {
    loadPerformance();
  }, [loadPerformance]);

  const totalPages = Math.ceil(totalItems / limitCards);

  return (
    <div className="container mx-auto p-6 max-w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Histórico de Simulados
            </h1>
            <p className="text-muted-foreground mt-1">
              Visualize seu desempenho nos simulados realizados
            </p>
          </div>

          {/* Botão de Voltar */}
          <Button
            onClick={() => navigate(`${DASH}/${SIMULADO}`)}
            variant="outline"
            className="w-24 h-10"
          >
            Voltar
          </Button>
        </div>
      </div>

      {/* Gráfico de Aproveitamento */}
      {aproveitamento && aproveitamento.historicos.length > 0 && (
        <PerformanceChart aproveitamento={aproveitamento} />
      )}

      {/* Informações e Paginação */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            "Carregando..."
          ) : (
            <>
              Mostrando {historical.length} de {totalItems} simulados | Página{" "}
              {currentPage} de {totalPages}
            </>
          )}
        </p>
      </div>

      {/* Paginação Superior */}
      {!isLoading && (
        <PaginationWrapper
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Cards de Histórico */}
      {isLoading ? (
        <div className="flex flex-wrap gap-6 justify-center">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="w-72 h-64 rounded-lg" />
          ))}
        </div>
      ) : historical.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Nenhum simulado encontrado
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 justify-center">
          {historical.map((historico) => (
            <SimpleHistoryCard
              key={historico._id}
              historico={historico}
              onClick={onClickCard}
            />
          ))}
        </div>
      )}

      {/* Paginação Inferior */}
      {!isLoading && (
        <PaginationWrapper
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
