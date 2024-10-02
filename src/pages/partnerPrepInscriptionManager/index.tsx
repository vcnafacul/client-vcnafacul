import { CardDash } from "@/components/molecules/cardDash";
import DashCardTemplate from "@/components/templates/dashCardTemplate";
import { DashCardContext } from "@/context/dashCardContext";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { Inscription } from "@/types/partnerPrepCourse/inscription";
import { formatDate } from "@/utils/date";
import { Paginate } from "@/utils/paginate";
import { useState } from "react";
import { dataInscription } from "./data";
import { InscriptionInfoModal } from "./modals/InscriptionInfoModal";

export function PartnerPrepInscriptionManager() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([
    {
      _id: "1",
      name: "Fernando",
      description: "Descrição da inscrição 1",
      startDate: new Date(),
      endDate: new Date(),
      actived: StatusEnum.Approved,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "2",
      name: "Laura",
      description: "Descrição da inscrição 2",
      startDate: new Date(),
      endDate: new Date(),
      actived: StatusEnum.Rejected,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [openModal, setOpenModal] = useState(false);
  const [inscriptionSelected, setInscriptionSelected] = useState<Inscription>();

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
    id: inscription._id,
    title: inscription._id,
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
          ? formatDate(inscription.startDate.toString())
          : "",
      },
      {
        field: "Criado em",
        value: inscription.createdAt
          ? formatDate(inscription.startDate.toString())
          : "",
      },
    ],
  });

  const onClickCard = (cardId: number | string) => {
    setInscriptionSelected(inscriptions.find((ins) => ins._id === cardId)!);
    setOpenModal(true);
  };

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
      }}
    >
      <DashCardTemplate />
      <InscriptionInfoModal
        isOpen={openModal}
        handleClose={() => setOpenModal(false)}
        inscription={inscriptionSelected}
      />
    </DashCardContext.Provider>
  );
}
