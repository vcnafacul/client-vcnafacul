import { format } from "date-fns";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MyResponsiveLine } from "../../components/atoms/lineChart";
import { CardDash } from "../../components/molecules/cardDash";
import DashCardTemplate from "../../components/templates/dashCardTemplate";
import { DashCardContext } from "../../context/dashCardContext";
import { AproveitamentoHitoriesDTO } from "../../dtos/historico/getPerformanceDTO";
import { HistoricoDTO } from "../../dtos/historico/historicoDTO";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { DASH, SIMULADO, SIMULATE_METRICS } from "../../routes/path";
import { getAllHistoricoSimulado } from "../../services/historico/getAllHistoricoSimulado";
import { getPerformance } from "../../services/historico/getPerformance";
import { useAuthStore } from "../../store/auth";
import { DateRelative } from "../../utils/dateRelative";
import { getFormatingTime } from "../../utils/getFormatingTime";
import { Paginate } from "../../utils/paginate";
import { dashHistories } from "./data";

export function SimulationHistories() {
  const [historical, setHistorical] = useState<HistoricoDTO[]>([]);
  const [aproveitamento, setAproveitamento] = useState<
    AproveitamentoHitoriesDTO | undefined
  >(undefined);
  const {
    data: { token },
  } = useAuthStore();
  const limitCards = 100;

  const navigate = useNavigate();

  const cardTransformation = (historico: HistoricoDTO): CardDash => ({
    id: historico._id,
    title:
      historico.simulado.tipo.nome +
      " - " +
      DateTime.fromISO(historico.createdAt.toString()).toLocaleString(
        DateTime.DATE_MED
      ),
    status:
      historico.questoesRespondidas ===
      historico.simulado.tipo.quantidadeTotalQuestao
        ? StatusEnum.Approved
        : StatusEnum.Rejected,
    infos: [
      {
        field: "Questoes Respondidas",
        value: historico.questoesRespondidas.toString(),
      },
      {
        field: "Realizado",
        value: historico.createdAt
          ? format(historico.createdAt?.toString(), "dd/MM/yyyy HH:mm")
          : "",
      },
      { field: "Tempo", value: getFormatingTime(historico.tempoRealizado) },
      {
        field: "Aproveitamento",
        value: `${(historico.aproveitamento.geral * 100).toFixed(2)}%`,
      },
    ],
  });

  const onClickCard = (cardId: number | string) => {
    navigate(`${DASH}/${SIMULADO}${SIMULATE_METRICS}${cardId}`);
  };

  const HeaderDashHistories = () => {
    return (
      <div className="py-4 flex items-center sm:flex-col-reverse md:flex-row justify-center flex-wrap gap-4 pl-4 w-full">
        <div className="flex gap-4 flex-col w-full h-full items-center">
          {aproveitamento && aproveitamento.historicos.length > 0 && (
            <div className="bg-white border border-t-0 shadow p-2 rounded h-52 sm:h-80 w-11/12">
              <MyResponsiveLine
                data={[
                  {
                    id: "aproveitamento",
                    data:
                      aproveitamento?.historicos.map((p) => ({
                        x: DateRelative(p.createdAt.toString()),
                        y: p.performance.geral * 100,
                        color: "rgba(0, 0, 0, 0.5)",
                      })) || [],
                  },
                ]}
                legendX="Data"
                legendY="Aproveitamento (%)"
              />
            </div>
          )}
        </div>
        {/* <div
          className="relative hidden sm:flex flex-col justify-center 
        items-center border border-gray-50 rounded shadow p-1 h-[500px] w-[700px]"
        >
          <h1 className="absolute font-black text-base text-marine top-2 left-2 z-10">
            Frentes
          </h1>
          <RadarChart
            data={
              aproveitamento?.performanceMateriaFrente.frentes.map((m) => ({
                materia: m.nome,
                aproveitamento: m.aproveitamento * 100,
              })) || []
            }
            scheme="pink_yellowGreen"
            fill="#000"
          />
        </div> */}
      </div>
    );
  };

  useEffect(() => {
    getAllHistoricoSimulado(token, 1, limitCards)
      .then((res) => {
        setHistorical(res.data);
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  }, [token]);

  useEffect(() => {
    getPerformance(token)
      .then((res) => {
        setAproveitamento(res);
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  }, [token]);

  const getMoreCards = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _page: number
  ): Promise<Paginate<HistoricoDTO>> => {
    return {
      data: [],
      limit: 0,
      page: 0,
      totalItems: 0,
    };
    // return await getAllHistoricoSimulado(token, page, limitCards);
  };

  return (
    <div>
      <DashCardContext.Provider
        value={{
          title: dashHistories.title,
          entities: historical,
          setEntities: setHistorical,
          onClickCard,
          getMoreCards,
          cardTransformation,
          limitCards,
        }}
      >
        <DashCardTemplate
          headerDash={HeaderDashHistories()}
          backButton={
            <DashCardTemplate.BackButton
              className="w-24 h-10 sm:absolute right-4"
              onClick={() => navigate(`${DASH}/${SIMULADO}`)}
            >
              Voltar
            </DashCardTemplate.BackButton>
          }
        />
      </DashCardContext.Provider>
    </div>
  );
}
