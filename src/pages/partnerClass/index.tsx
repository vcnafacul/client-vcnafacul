import { ButtonProps } from "@/components/molecules/button";
import DashCardTemplate from "@/components/templates/dashCardTemplate";
import { DashCardContext } from "@/context/dashCardContext";
import { ClassEntityOutput } from "@/dtos/classes/classOutput";
import { createClass } from "@/services/prepCourse/class/createClass";
import { deleteClass } from "@/services/prepCourse/class/deleteClass";
import { editClass } from "@/services/prepCourse/class/editClass";
import { getAllClasses } from "@/services/prepCourse/class/getAllClasses";
import { useAuthStore } from "@/store/auth";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { cardClassTransformation } from "@/utils/cardTransformation";
import { Paginate } from "@/utils/paginate";
import { useEffect, useState } from "react";
import { MoonLoader } from "react-spinners";
import { toast } from "react-toastify";
import { dataClass } from "./data";
import { ClassCreateEditModal } from "./modals/classCreateEditModal";
import { ClassInfoModal } from "./modals/infoClassModal";

export function PartnerClass() {
  const [processing, setProcessing] = useState<boolean>(true);
  const [entities, setEntities] = useState<ClassEntity[]>([]);
  const [entitySelected, setEntitySelected] = useState<ClassEntity>();
  const [openModal, setOpenModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const limitCards = 100;

  const {
    data: { token },
  } = useAuthStore();

  const getMoreCards = async (page: number): Promise<Paginate<ClassEntity>> => {
    return await getAllClasses(token, page, limitCards);
  };

  const onClickCard = (cardId: number | string) => {
    setEntitySelected(entities.find((e) => e.id === cardId)!);
    setOpenModal(true);
  };

  const handleCreate = (entity: ClassEntityOutput) => {
    const id = toast.loading("Criando Turma...");
    createClass(token, entity)
      .then((res) => {
        toast.update(id, {
          render: "Turma criada com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setOpenCreateModal(false);
        setEntities([...entities, res]);
      })
      .catch(() => {
        toast.update(id, {
          render: "Erro ao criar turma!",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      });
  };

  const handleEdit = async (entity: ClassEntityOutput) => {
    const id = toast.loading("Editando Turma...");
    return editClass(token, { ...entity, id: entitySelected!.id })
      .then(() => {
        toast.update(id, {
          render: "Turma editada com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .catch((e) => {
        toast.update(id, {
          render: "Erro ao editar turma!",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        throw e;
      });
  };

  const handleDelete = async () => {
    const id = toast.loading("Deletando Turma...");
    deleteClass(token, entitySelected!.id)
      .then(() => {
        const newEntities = entities.filter((e) => e.id !== entitySelected!.id);
        setEntities(newEntities);
        toast.update(id, {
          render: "Turma deletada com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .catch((e) => {
        toast.update(id, {
          render: "Erro ao deletar turma!",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        throw e;
      });
  };

  const ModalCreate = () => {
    return openCreateModal ? (
      <ClassCreateEditModal
        isOpen={openCreateModal}
        handleClose={() => setOpenCreateModal(false)}
        onCreateEdit={handleCreate}
      />
    ) : null;
  };

  const ModalInfo = () => {
    return openModal ? (
      <ClassInfoModal
        isOpen={openModal}
        handleClose={() => setOpenModal(false)}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        entity={entitySelected!}
      />
    ) : null;
  };

  const buttons: ButtonProps[] = [
    {
      // disabled: !permissao[Roles.criarQuestao],
      onClick: () => {
        setOpenCreateModal(true);
      },
      typeStyle: "quaternary",
      size: "small",
      children: "Novo",
    },
  ];

  useEffect(() => {
    setProcessing(true);
    getMoreCards(1).then((res) => {
      setEntities(res.data);
      setProcessing(false);
    });
  }, []);

  return (
    <DashCardContext.Provider
      value={{
        title: dataClass.title,
        entities: entities,
        setEntities: setEntities,
        onClickCard: onClickCard,
        getMoreCards: getMoreCards,
        limitCards: 10,
        cardTransformation: cardClassTransformation,
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
            classNameFilter="md:w-9/12 bg-transparent h-20"
            className="md:mt-24"
          />
          <ModalCreate />
          <ModalInfo />
        </>
      )}
    </DashCardContext.Provider>
  );
}
