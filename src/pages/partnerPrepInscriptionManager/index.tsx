import { ButtonProps } from "@/components/molecules/button";
import { CardDash } from "@/components/molecules/cardDash";
import DashCardTemplate from "@/components/templates/dashCardTemplate";
import { DashCardContext } from "@/context/dashCardContext";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { createInscription } from "@/services/prepCourse/inscription/createInscription";
import { deleteInscription } from "@/services/prepCourse/inscription/deleteInscription";
import { getAllInscription } from "@/services/prepCourse/inscription/getAllInscription";
import { updateInscription } from "@/services/prepCourse/inscription/updateInscription";
import { useAuthStore } from "@/store/auth";
import { usePrepCourseStore } from "@/store/prepCourse";
import { Inscription } from "@/types/partnerPrepCourse/inscription";
import { formatDate } from "@/utils/date";
import { Paginate } from "@/utils/paginate";
import { useEffect, useState } from "react";
import { MoonLoader } from "react-spinners";
import { toast } from "react-toastify";
import { dataInscription } from "./data";
import {
  InscriptionInfoCreateEditModal,
  InscriptionOutput,
} from "./modals/InscriptionInfoCreateEditModal";
import { InscriptionInfoModal } from "./modals/InscriptionInfoModal";

export function PartnerPrepInscriptionManager() {
  const [processing, setProcessing] = useState<boolean>(true);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [inscriptionSelected, setInscriptionSelected] = useState<
    Inscription | undefined
  >(undefined);
  const limitCards = 40;

  const {
    data: { token },
  } = useAuthStore();

  const { setPrepCourse } = usePrepCourseStore();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getMoreCards = async (): Promise<Paginate<Inscription>> => {
    return {
      data: [],
      page: 0,
      limit: 0,
      totalItems: 0,
    };
  };

  const cardTransformation = (inscription: Inscription): CardDash => ({
    id: inscription.id,
    title: inscription.name,
    status: inscription.actived,
    infos: [
      {
        field: "Inicia",
        value: inscription.startDate
          ? formatDate(inscription.startDate.toString())
          : "",
      },
      {
        field: "Encerra",
        value: inscription.endDate
          ? formatDate(inscription.endDate.toString())
          : "",
      },
      {
        field: "Inscritos",
        value: inscription.subscribersCount.toString(),
      },
      {
        field: "Criado em",
        value: inscription.createdAt
          ? formatDate(inscription.createdAt.toString())
          : "",
      },
    ],
  });

  const onClickCard = (cardId: number | string) => {
    setInscriptionSelected(inscriptions.find((ins) => ins.id === cardId)!);
    setOpenModal(true);
  };
  const buttons: ButtonProps[] = [
    {
      // disabled: !permissao[Roles.criarQuestao],
      onClick: () => {
        setOpenModalCreate(true);
      },
      typeStyle: "quaternary",
      size: "small",
      children: "Novo",
    },
  ];

  const handleCreate = async (data: InscriptionOutput) => {
    const id = toast.loading("Criando Processo Seletivo...");
    createInscription(token, data)
      .then(() => {
        toast.update(id, {
          render: `Processo Seletivo ${data.name} criado com sucesso`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setOpenModalCreate(false);
        fetchInscriptions();
      })
      .catch((e) => {
        toast.update(id, {
          render: e.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const ModalCreate = () => {
    return openModalCreate ? (
      <InscriptionInfoCreateEditModal
        isOpen={openModalCreate}
        handleClose={() => setOpenModalCreate(false)}
        onCreateEdit={handleCreate}
      />
    ) : null;
  };

  const handleEdit = async (data: InscriptionOutput) => {
    const id = toast.loading("Atualizando Processo Seletivo...");
    updateInscription(token, data)
      .then(() => {
        setInscriptionSelected({
          ...inscriptionSelected!,
          name: data.name,
          openingsCount: data.openingsCount,
          description: data.description,
          startDate: data.range[0],
          endDate: data.range[1],
        });
        toast.update(id, {
          render: `Processo Seletivo ${data.name} atualizado com sucesso`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        fetchInscriptions();
      })
      .catch((e) => {
        toast.update(id, {
          render: e.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const canEditFunction = () => {
    const activedInscription = inscriptions.find(
      (item) => item.actived === StatusEnum.Approved
    );

    if (!activedInscription) {
      return true;
    }
    if (activedInscription.id === inscriptionSelected?.id) {
      return true;
    }
    return false;
  };

  const handleDelete = async () => {
    deleteInscription(token, inscriptionSelected!.id)
      .then(() => {
        setInscriptions(
          inscriptions.filter((ins) => ins.id !== inscriptionSelected?.id)
        );
        setOpenModal(false);
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const ModalInfo = () => {
    return openModal ? (
      <InscriptionInfoModal
        isOpen={openModal}
        handleClose={() => {
          setOpenModal(false);
        }}
        inscription={inscriptionSelected}
        handleEdit={handleEdit}
        canEdit={canEditFunction()}
        handleDelete={handleDelete}
      />
    ) : null;
  };

  const fetchInscriptions = async () => {
    setProcessing(true);
    try {
      const res = await getAllInscription(token, 1, limitCards);
      res.data.sort((a, b) => {
        return a.startDate < b.startDate ? -1 : 1;
      });
      setInscriptions(res.data);
      if (res.data.length > 0) {
        setPrepCourse({
          id: res.data[0].partnerPrepCourseId,
          prepCourseName: res.data[0].partnerPrepCourseName,
        });
      }
      setProcessing(false);
    } catch (e) {
      console.error("Erro ao buscar inscrições", e);
    }
  };

  useEffect(() => {
    fetchInscriptions();
  }, []);

  return (
    <DashCardContext.Provider
      value={{
        title: dataInscription.title,
        entities: inscriptions,
        setEntities: setInscriptions,
        onClickCard: onClickCard,
        getMoreCards: getMoreCards,
        limitCards: 10,
        cardTransformation,
        buttons,
      }}
    >
      {processing ? (
        <div className="w-full h-full flex justify-center pt-40">
          <MoonLoader color="#FF7600" size={60} speedMultiplier={0.4} />
        </div>
      ) : (
        <>
          <DashCardTemplate
            classNameFilter="md:w-9/12 bg-white h-20"
            className="md:mt-24"
          />
          <ModalInfo />
          <ModalCreate />
        </>
      )}
    </DashCardContext.Provider>
  );
}
