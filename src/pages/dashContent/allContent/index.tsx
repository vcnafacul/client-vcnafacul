import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { SelectProps } from "../../../components/atoms/select";
import { ButtonProps } from "../../../components/molecules/button";
import DashCardTemplate from "../../../components/templates/dashCardTemplate";
import { ContentDtoInput } from "../../../dtos/content/contentDtoInput";
import { StatusContent } from "../../../enums/content/statusContent";
import { StatusEnum } from "../../../enums/generic/statusEnum";
import { getContent } from "../../../services/content/getContent";
import { useAuthStore } from "../../../store/auth";
import NewDemand from "../modals/newDemand";
import ShowDemand from "../modals/showDemand";
import ValidatedDemand from "../modals/validatedDemand";
import { dashAllContent } from "./data";

import { ReactComponent as SettingIcon } from "../../../assets/icons/setting.svg";
import { OptionProps } from "../../../components/atoms/selectOption";
import ModalTemplate from "../../../components/templates/modalTemplate";
import { DashCardContext } from "../../../context/dashCardContext";
import { Materias } from "../../../enums/content/materias";
import { Roles } from "../../../enums/roles/roles";
import { MateriasLabel } from "../../../types/content/materiasLabel";
import { Paginate } from "../../../utils/paginate";
import { cardTransformationContent } from "../data";
import SettingsContent from "../modals/settingsContent";

function AllContent() {
  const [openShowModal, setOpenShowModal] = useState<boolean>(false);
  const [settings, setSettings] = useState<boolean>(false);
  const [openNewModalDemand, setOpenNewModalDemand] = useState<boolean>(false);
  const [demands, setDemands] = useState<ContentDtoInput[]>([]);
  const [demandSelected, setDemandSelected] = useState<ContentDtoInput | null>(
    null
  );
  const [materias] = useState<OptionProps[]>(() => {
    const mat = MateriasLabel.map((materia) => ({
      id: materia.value,
      name: materia.label,
    }));
    mat.unshift({ id: -1 as Materias, name: "Todos" });
    return mat;
  });
  const [materiaSelected, setMateriaSelected] = useState<number>(
    materias[0].id as number
  );
  const [status, setStatus] = useState<StatusContent | StatusEnum>(
    StatusEnum.Approved
  );
  const dataRef = useRef<ContentDtoInput[]>([]);
  const limitCards = 40;

  const selectDemandByMateria = (id: Materias) => {
    setMateriaSelected(id);
    if (id === (-1 as Materias)) setDemands(dataRef.current);
    else {
      setDemands(
        dataRef.current.filter((demand) => {
          if (demand.subject.frente.materia === id) return demand;
        })
      );
    }
  };

  const {
    data: { token, permissao },
  } = useAuthStore();

  const onClickCard = (id: number | string) => {
    setDemandSelected(dataRef.current.find((demand) => demand.id === id)!);
    setOpenShowModal(true);
  };

  const addDemand = (data: ContentDtoInput) => {
    dataRef.current.push(data);
    setDemands(dataRef.current);
  };

  const handleRemoveDemand = (id: string) => {
    const newContent = demands.filter((q) => q.id != id);
    setDemands(newContent);
  };

  const ShowDemandModal = () => {
    return (
      <ModalTemplate
        handleClose={() => setOpenShowModal(false)}
        isOpen={
          openShowModal &&
          demandSelected?.status === StatusContent.Pending_Upload
        }
      >
        <ShowDemand
          demand={demandSelected!}
          updateStatusDemand={handleRemoveDemand}
        />
      </ModalTemplate>
    );
  };

  const ValidatedModalDemand = () => {
    return (
      <ModalTemplate
        handleClose={() => setOpenShowModal(false)}
        isOpen={
          openShowModal &&
          demandSelected?.status !== StatusContent.Pending_Upload
        }
      >
        <ValidatedDemand
          demand={demandSelected!}
          updateStatusDemand={handleRemoveDemand}
        />
      </ModalTemplate>
    );
  };

  const NewModalDemand = () => {
    return (
      <ModalTemplate
        isOpen={openNewModalDemand}
        handleClose={() => setOpenNewModalDemand(false)}
      >
        <NewDemand
          addDemand={addDemand}
          handleClose={() => setOpenNewModalDemand(false)}
        />
      </ModalTemplate>
    );
  };

  const SettingsModal = () => {
    return (
      <ModalTemplate
        isOpen={settings}
        handleClose={() => {
          setSettings(false);
        }}
      >
        <SettingsContent />
      </ModalTemplate>
    );
  };

  const FilterManager = () => {
    if (!permissao[Roles.gerenciadorDemanda]) return null;
    return (
      <div className="flex">
        <SettingIcon
          onClick={() => {
            setSettings(true);
          }}
          className="w-10 h-10 transition-all duration-300 opacity-75 cursor-pointer fill-marine hover:opacity-100"
        />
      </div>
    );
  };

  useEffect(() => {
    getContent(token, status as StatusContent, materiaSelected, 1, limitCards)
      .then((res) => {
        setDemands(res.data);
        dataRef.current = res.data;
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  }, [token, status, materiaSelected]);

  const getMoreCards = async (
    page: number
  ): Promise<Paginate<ContentDtoInput>> => {
    return await getContent(
      token,
      status as StatusContent,
      materiaSelected,
      page,
      limitCards
    );
  };

  const buttons: ButtonProps[] = [
    {
      onClick: () => {
        setDemandSelected(null);
        setOpenNewModalDemand(true);
      },
      typeStyle: "quaternary",
      size: "small",
      children: "Nova Demanda",
    },
  ];

  const selectFiltes: SelectProps[] = [
    {
      options: materias,
      defaultValue: materiaSelected,
      setState: selectDemandByMateria,
    },
    {
      options: dashAllContent.options,
      defaultValue: status,
      setState: setStatus,
      disabled: !permissao[Roles.validarDemanda],
    },
  ];

  return (
    <DashCardContext.Provider
      value={{
        title: dashAllContent.title,
        entities: demands,
        setEntities: setDemands,
        onClickCard,
        getMoreCards,
        cardTransformation: cardTransformationContent,
        limitCards,
        selectFiltes,
        buttons,
      }}
    >
      <DashCardTemplate customFilter={[<FilterManager />]} />
      <ShowDemandModal />
      <ValidatedModalDemand />
      <NewModalDemand />
      <SettingsModal />
    </DashCardContext.Provider>
  );
}

export default AllContent;
