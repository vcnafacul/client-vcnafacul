import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CardDash } from "../../components/molecules/cardDash";
import DashCardTemplate from "../../components/templates/dashCardTemplate";
import { DashCardContext } from "../../context/dashCardContext";
import { HistoricoDTO } from "../../dtos/historico/historicoDTO";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { DASH, SIMULADO, SIMULATE_METRICS } from "../../routes/path";
import { getAllHistoricoSimulado } from "../../services/historico/getAllHistoricoSimulado";
import { useAuthStore } from "../../store/auth";
import { getFormatingTime } from "../../utils/getFormatingTime";
import { Paginate } from "../../utils/paginate";
import { dashHistories } from "./data";

export function SimulationHistories() {
  const [historical, setHistorical] = useState<HistoricoDTO[]>([]);
  const {
    data: { token },
  } = useAuthStore();
  const limitCards = 40;

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
      { field: "Realizado", value: historico.createdAt?.toString() },
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

  useEffect(() => {
    getAllHistoricoSimulado(token, 1, limitCards)
      .then((res) => {
        setHistorical(res.data);
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMoreCards = async (
    page: number
  ): Promise<Paginate<HistoricoDTO>> => {
    return await getAllHistoricoSimulado(token, page, limitCards);
  };

  const HeaderDashHistories = () => {
    return (
      <div className="py-4 flex justify-center">
        
      </div>
    )
  }

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
        <DashCardTemplate headerDash={HeaderDashHistories()}/>
      </DashCardContext.Provider>
    </div>
  );
}
