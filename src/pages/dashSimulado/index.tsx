import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CardDash } from "../../components/molecules/cardDash";
import DashCardTemplate from "../../components/templates/dashCardTemplate";
import { DashCardContext } from "../../context/dashCardContext";
import { ISimuladoDTO } from "../../dtos/simulado/simuladoDto";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { getSimulados } from "../../services/simulado/getSimulados";
import { useAuthStore } from "../../store/auth";
import { formatDate } from "../../utils/date";
import { Paginate } from "../../utils/paginate";

function DashSimulado() {
  const [simulados, setSimulados] = useState<ISimuladoDTO[]>([]);
  const {
    data: { token },
  } = useAuthStore();
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
    const id = toast.loading("Buscando Simulados ... ");
    getSimulados(token, 1, limitCards)
      .then((res) => {
        setSimulados(res.data);
        toast.dismiss(id);
      })
      .catch((error: Error) => {
        toast.update(id, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        setSimulados([]);
      });
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
