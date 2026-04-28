import { ButtonProps } from "@/components/molecules/button";
import { CardDash } from "@/components/molecules/cardDash";
import { SelectProps } from "@/components/atoms/select";
import DashCardTemplate from "@/components/templates/dashCardTemplate";
import { DashCardContext } from "@/context/dashCardContext";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { createInscription } from "@/services/prepCourse/inscription/createInscription";
import { deleteInscription } from "@/services/prepCourse/inscription/deleteInscription";
import { getAllInscription } from "@/services/prepCourse/inscription/getAllInscription";
import { updateInscription } from "@/services/prepCourse/inscription/updateInscription";
import { useAuthStore } from "@/store/auth";
import { Inscription } from "@/types/partnerPrepCourse/inscription";
import { formatDate } from "@/utils/date";
import { Paginate } from "@/utils/paginate";
import { useEffect, useMemo, useState } from "react";
import { MoonLoader } from "react-spinners";
import { toast } from "react-toastify";
import { dataInscription } from "./data";
import {
  InscriptionInfoCreateEditModal,
  InscriptionOutput,
} from "./modals/InscriptionInfoCreateEditModal";
import { InscriptionInfoModal } from "./modals/InscriptionInfoModal";

const getInscriptionStatus = (inscription: Inscription): StatusEnum => {
  if (new Date(inscription.endDate) < new Date()) return StatusEnum.Rejected;
  return inscription.actived;
};

export function PartnerPrepInscriptionManager() {
  const [processing, setProcessing] = useState<boolean>(true);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [inscriptionSelected, setInscriptionSelected] = useState<
    Inscription | undefined
  >(undefined);
  const [statusFilter, setStatusFilter] = useState<StatusEnum>(StatusEnum.All);
  const limitCards = 100;

  const modals = useModals(["modalCreate", "modalInfo"]);

  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

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
    status:
      inscription.endDate < new Date()
        ? StatusEnum.Rejected
        : inscription.actived,
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
    modals.modalInfo.open();
  };
  const filteredInscriptions = useMemo(() => {
    if (statusFilter === StatusEnum.All) return inscriptions;
    return inscriptions.filter(
      (ins) => getInscriptionStatus(ins) === statusFilter
    );
  }, [inscriptions, statusFilter]);

  const selectFiltes: SelectProps[] = [
    {
      options: dataInscription.statusOptions,
      setState: (value) => setStatusFilter(Number(value) as StatusEnum),
      defaultValue: statusFilter,
    },
  ];

  const buttons: ButtonProps[] = [
    {
      // disabled: !permissao[Roles.criarQuestao],
      onClick: () => {
        modals.modalCreate.open();
      },
      typeStyle: "quaternary",
      size: "small",
      children: "Novo",
    },
  ];

  const handleCreate = async (data: InscriptionOutput) => {
    await executeAsync({
      action: () => createInscription(token, data),
      loadingMessage: "Criando Processo Seletivo...",
      successMessage: "Processo Seletivo criado com sucesso!",
      errorMessage: "Erro ao criar processo seletivo",
      onSuccess: () => {
        modals.modalCreate.close();
        fetchInscriptions();
      },
    });
  };

  const ModalCreate = () => {
    return modals.modalCreate.isOpen ? (
      <InscriptionInfoCreateEditModal
        isOpen={modals.modalCreate.isOpen}
        handleClose={() => modals.modalCreate.close()}
        onCreateEdit={handleCreate}
      />
    ) : null;
  };

  const handleEdit = async (data: InscriptionOutput) => {
    await executeAsync({
      action: () => updateInscription(token, data),
      loadingMessage: "Atualizando Processo Seletivo...",
      successMessage: "Processo Seletivo atualizado com sucesso!",
      errorMessage: "Erro ao atualizar processo seletivo",
      onSuccess: () => {
        setInscriptionSelected({
          ...inscriptionSelected!,
          name: data.name,
          openingsCount: data.openingsCount,
          description: data.description,
          startDate: data.range[0],
          endDate: data.range[1],
          requestDocuments: data.requestDocuments,
        });
        fetchInscriptions();
      },
    });
  };

  const handleDelete = async () => {
    deleteInscription(token, inscriptionSelected!.id)
      .then(() => {
        setInscriptions(
          inscriptions.filter((ins) => ins.id !== inscriptionSelected?.id)
        );
        modals.modalInfo.close();
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const ModalInfo = () => {
    return modals.modalInfo.isOpen ? (
      <InscriptionInfoModal
        isOpen={modals.modalInfo.isOpen}
        handleClose={() => {
          modals.modalInfo.close();
        }}
        inscription={inscriptionSelected}
        setInscription={(insc) => {
          // Atualizar a lista de inscrições
          setInscriptions(
            inscriptions.map((ins) => (ins.id === insc.id ? insc : ins))
          );
          // Atualizar também a inscrição selecionada para refletir no modal
          setInscriptionSelected(insc);
        }}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    ) : null;
  };

  const fetchInscriptions = async () => {
    setProcessing(true);
    try {
      const res = await getAllInscription(token, 1, limitCards);
      res.data.sort((a, b) => (a.startDate < b.startDate ? -1 : 1));
      setInscriptions(res.data);
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
        entities: filteredInscriptions,
        setEntities: (action) => {
          setInscriptions((prev) => {
            const newList =
              typeof action === "function" ? action(prev) : action;
            const prevIds = new Set(prev.map((i) => i.id));
            const genuinelyNew = newList.filter((i) => !prevIds.has(i.id));
            return genuinelyNew.length > 0 ? [...prev, ...genuinelyNew] : prev;
          });
        },
        onClickCard: onClickCard,
        getMoreCards: getMoreCards,
        limitCards: 10,
        cardTransformation,
        buttons,
        selectFiltes,
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
