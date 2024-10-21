import { ButtonProps } from "@/components/molecules/button";
import { CardDash } from "@/components/molecules/cardDash";
import DashCardTemplate from "@/components/templates/dashCardTemplate";
import { DashCardContext } from "@/context/dashCardContext";
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
import { toast } from "react-toastify";
import { dataInscription } from "./data";
import {
  InscriptionInfoCreateEditModal,
  InscriptionOutput,
} from "./modals/InscriptionInfoEditModal";
import { InscriptionInfoModal } from "./modals/InscriptionInfoModal";

export function PartnerPrepInscriptionManager() {
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
  const getMoreCards = async (page: number): Promise<Paginate<Inscription>> => {
    return {
      data: [],
      page: 0,
      limit: 0,
      totalItems: 0,
    };
  };

  const cardTransformation = (inscription: Inscription): CardDash => ({
    id: inscription.id,
    title: inscription.id,
    status: inscription.actived,
    infos: [
      {
        field: "Nome",
        value: inscription.name,
      },
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
    createInscription(token, data)
      .then((res) => {
        setInscriptions([...inscriptions, res]);
        setOpenModalCreate(false);
      })
      .catch((error) => {
        toast.error(error.message);
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
    updateInscription(token, data)
      .then(() => {
        setInscriptions(
          inscriptions.map((ins) =>
            ins.id === data.id
              ? {
                  ...ins,
                  name: data.name,
                  openingsCount: data.openingsCount,
                  description: data.description,
                  startDate: data.range[0],
                  endDate: data.range[1],
                }
              : ins
          )
        );
        setInscriptionSelected({
          ...inscriptionSelected!,
          name: data.name,
          openingsCount: data.openingsCount,
          description: data.description,
          startDate: data.range[0],
          endDate: data.range[1],
        });
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const canEditFunction = () => {
    const activedInscription = inscriptions.find((item) => item.actived);

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
        handleClose={() => setOpenModal(false)}
        inscription={inscriptionSelected}
        handleEdit={handleEdit}
        canEdit={canEditFunction()}
        handleDelete={handleDelete}
      />
    ) : null;
  };

  useEffect(() => {
    getAllInscription(token, 1, limitCards).then((res) => {
      setInscriptions(res.data);
      if (res.data.length > 0) {
        setPrepCourse({
          id: res.data[0].partnerPrepCourseId,
          prepCourseName: res.data[0].partnerPrepCourseName,
        });
      }
    });
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
      <DashCardTemplate
        classNameFilter="md:w-9/12 bg-white h-20"
        className="md:mt-24"
      />
      <ModalInfo />
      <ModalCreate />
    </DashCardContext.Provider>
  );
}
