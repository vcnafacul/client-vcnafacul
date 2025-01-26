import { ButtonProps } from "@/components/molecules/button";
import { CardDash } from "@/components/molecules/cardDash";
import DashCardTemplate from "@/components/templates/dashCardTemplate";
import { DashCardContext } from "@/context/dashCardContext";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { getCollaborator } from "@/services/prepCourse/collaborator/get-collaborator";
import { useAuthStore } from "@/store/auth";
import { Collaborator } from "@/types/partnerPrepCourse/collaborator";
import { Paginate } from "@/utils/paginate";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ShowInfo } from "./modals/showInfo";
import { TempInviteMember } from "./modals/temp-invite-member";

export default function ManagerCollaborator() {
  const [collaborator, setCollaborator] = useState<Collaborator[]>([]);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [openShowInfo, setOpenShowInfo] = useState(false);
  const [collaboratorSelected, setCollaboratorSelected] =
    useState<Collaborator | null>(null);
  const limitCards = 40;

  const {
    data: { token },
  } = useAuthStore();

  const cardTransformation = (cl: Collaborator): CardDash => ({
    id: cl.user.id,
    title: cl.user.firstName + " " + cl.user.lastName,
    status: cl.actived ? StatusEnum.Approved : StatusEnum.Rejected,
    infos: [
      { field: "Email", value: cl.user.email },
      { field: "Telefone", value: cl.user.phone },
      {
        field: "Ultimo Acesso",
        value: cl.lastAccess ? cl.lastAccess.toISOString() : "",
      },
    ],
  });

  const onClickCard = (userId: string) => {
    setCollaboratorSelected(collaborator.find((cl) => cl.user.id === userId)!);
    setOpenShowInfo(true);
  };

  const getMoreCards = async (
    page: number
  ): Promise<Paginate<Collaborator>> => {
    return await getCollaborator(token, page, limitCards);
  };

  const buttons: ButtonProps[] = [
    {
      // disabled: !permissao[Roles.criarQuestao],
      onClick: () => {
        setOpenInviteModal(true);
      },
      typeStyle: "quaternary",
      size: "small",
      children: "Convidar",
    },
  ];

  const ModalInviteMember = () => {
    return openInviteModal ? (
      <TempInviteMember
        isOpen={openInviteModal}
        handleClose={() => setOpenInviteModal(false)}
      />
    ) : null;
  };

  const ModalShowInfo = () => {
    return openShowInfo ? (
      <ShowInfo
        isOpen={openShowInfo}
        handleClose={() => setOpenShowInfo(false)}
        collaborator={collaboratorSelected!}
      />
    ) : null;
  };

  useEffect(() => {
    getCollaborator(token, 1, 40)
      .then((c) => setCollaborator(c.data))
      .catch((error) => toast.error(error.message));
  }, [token]);

  return (
    <DashCardContext.Provider
      value={{
        title: "Colaboradores",
        entities: collaborator,
        setEntities: setCollaborator,
        onClickCard,
        getMoreCards,
        cardTransformation,
        limitCards,
        buttons,
      }}
    >
      <DashCardTemplate
        classNameFilter="md:w-9/12 bg-white h-20"
        className="md:mt-24"
      />
      <ModalInviteMember />
      <ModalShowInfo />
    </DashCardContext.Provider>
  );
}
