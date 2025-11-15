import { useEffect, useState } from "react";
import { CardDash } from "../../components/molecules/cardDash";
import DashCardTemplate from "../../components/templates/dashCardTemplate";
import { DashCardContext } from "../../context/dashCardContext";
import { ISimuladoDTO } from "../../dtos/simulado/simuladoDto";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { useToastAsync } from "../../hooks/useToastAsync";
import { getSimulados } from "../../services/simulado/getSimulados";
import { useAuthStore } from "../../store/auth";
import { formatDate } from "../../utils/date";
import { Paginate } from "../../utils/paginate";

function DashSimulado() {
  const [simulados, setSimulados] = useState<ISimuladoDTO[]>([]);
  const {
    data: { token },
  } = useAuthStore();
  const executeAsync = useToastAsync();
  const limitCards = 500;

  const cardTransformation = (simulado: ISimuladoDTO): CardDash => ({
    id: simulado._id,
    title: simulado.nome,
    status: simulado.bloqueado ? StatusEnum.Rejected : StatusEnum.Approved,
    infos: [
      { field: "Tipo", value: simulado.tipo.nome },
      {
        field: "Duracao",
        value: simulado.tipo.duracao.toString() + " minutos",
      },
      {
        field: "Questoes",
        value: `${simulado.questoes.length.toString()}/${simulado.tipo.quantidadeTotalQuestao.toString()}`,
      },
      {
        field: "Descrição",
        value:
          simulado.descricao && simulado.descricao.length > 20
            ? simulado.descricao.substring(0, 20) + "..."
            : simulado.descricao,
      },
      {
        field: "Atualizado em ",
        value: simulado.updatedAt
          ? formatDate(simulado.updatedAt.toString())
          : "",
      },
    ],
  });

  useEffect(() => {
    executeAsync({
      action: () => getSimulados(token, 1, limitCards),
      loadingMessage: "Buscando Simulados...",
      successMessage: "Simulados carregados com sucesso!",
      errorMessage: (error) => error.message,
      onSuccess: (res) => setSimulados(res.data),
      onError: () => setSimulados([]),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const getMoreCards = async (
    page: number
  ): Promise<Paginate<ISimuladoDTO>> => {
    return await getSimulados(token, page, limitCards);
  };

  return (
    <DashCardContext.Provider
      value={{
        title: "Simulados",
        entities: simulados,
        setEntities: setSimulados,
        onClickCard: () => {},
        getMoreCards,
        cardTransformation,
        limitCards,
      }}
    >
      <DashCardTemplate />
    </DashCardContext.Provider>
  );
}

export default DashSimulado;
