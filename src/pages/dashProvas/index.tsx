import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ButtonProps } from "../../components/molecules/button";
import { CardDash } from "../../components/molecules/cardDash";
import DashCardTemplate from "../../components/templates/dashCardTemplate";
import ModalTemplate from "../../components/templates/modalTemplate";
import { DashCardContext } from "../../context/dashCardContext";
import { Prova } from "../../dtos/prova/prova";
import { ITipoSimulado } from "../../dtos/simulado/tipoSimulado";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { Roles } from "../../enums/roles/roles";
import { getProvas } from "../../services/prova/getProvas";
import { getTipos } from "../../services/tipoSimulado/getTipos";
import { useAuthStore } from "../../store/auth";
import { formatDate } from "../../utils/date";
import { Paginate } from "../../utils/paginate";
import { dashProva } from "./data";
import NewProva from "./modals/newProva";
import ShowProva from "./modals/showProva";

function DashProva() {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [provaSelected, setProvaSelected] = useState<Prova | null>(null);

  const [tipoSimulado, setTipoSimulado] = useState<ITipoSimulado[]>();

  const [openNewProva, setOpenNewProva] = useState<boolean>(false);
  const [showProva, setShowProva] = useState<boolean>(false);
  const limitCards = 40;

  const {
    data: { token, permissao },
  } = useAuthStore();

  const cardTransformation = (prova: Prova): CardDash => ({
    id: prova._id,
    title: prova.nome,
    status:
      prova.totalQuestao === prova.totalQuestaoValidadas
        ? StatusEnum.Approved
        : prova.totalQuestao === prova.totalQuestaoCadastradas
        ? StatusEnum.Pending
        : StatusEnum.Rejected,
    infos: [
      { field: "Total de Questões", value: prova.totalQuestao.toString() },
      {
        field: "Total de Questões Cadastradas",
        value: prova.totalQuestaoCadastradas.toString(),
      },
      {
        field: "Total de Questões Validadas",
        value: prova.totalQuestaoValidadas.toString(),
      },
      {
        field: "Cadastrado em ",
        value: prova.createdAt ? formatDate(prova.createdAt.toString()) : "",
      },
    ],
  });

  const onClickCard = (id: string | number) => {
    setProvaSelected(provas.find((p) => p._id === id)!);
    setShowProva(true);
  };

  const addProva = (data: Prova) => {
    const newProvas = [...provas, data];
    setProvas(newProvas);
  };

  const ModalNewProva = () => {
    return (
      <ModalTemplate
        handleClose={() => setOpenNewProva(false)}
        isOpen={openNewProva}
        outSideClose
      >
        <NewProva tipos={tipoSimulado!} addProva={addProva} />
      </ModalTemplate>
    );
  };

  const ModalShowProva = () => {
    return (
      <ModalTemplate
        handleClose={() => {
          setShowProva(false);
        }}
        isOpen={showProva}
        outSideClose
      >
        <ShowProva prova={provaSelected!} />
      </ModalTemplate>
    );
  };

  useEffect(() => {
    getProvas(token, 1, limitCards)
      .then((res) => {
        setProvas(res.data);
      })
      .catch((erro: Error) => {
        toast.error(erro.message);
      });

    getTipos(token)
      .then((res) => {
        setTipoSimulado(res.data);
      })
      .catch((erro: Error) => {
        toast.error(erro.message);
      });
  }, [token]);

  const getMoreCards = async (page: number): Promise<Paginate<Prova>> => {
    return await getProvas(token, page, limitCards);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const buttons: ButtonProps[] = [
    {
      disabled: !permissao[Roles.cadastrarProvas],
      onClick: () => {
        setProvaSelected(null);
        setOpenNewProva(true);
      },
      typeStyle: "quaternary",
      className: "text-xl font-light rounded-full h-8",
      children: "Cadastrar Prova",
    },
  ];

  return (
    <DashCardContext.Provider
      value={{
        title: dashProva.title,
        entities: provas,
        setEntities: setProvas,
        onClickCard,
        getMoreCards,
        cardTransformation,
        limitCards,
        buttons,
      }}
    >
      <DashCardTemplate />
      <ModalNewProva />
      <ModalShowProva />
    </DashCardContext.Provider>
  );
}

export default DashProva;
