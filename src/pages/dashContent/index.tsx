import { SelectProps } from "@/components/atoms/select";
import { OptionProps } from "@/components/atoms/selectOption";
import { ButtonProps } from "@/components/molecules/button";
import DashCardTemplate from "@/components/templates/dashCardTemplate";
import { DashCardContext } from "@/context/dashCardContext";
import { ContentDtoInput } from "@/dtos/content/contentDtoInput";
import { Materias } from "@/enums/content/materias";
import { StatusContent } from "@/enums/content/statusContent";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { Roles } from "@/enums/roles/roles";
import { getContent } from "@/services/content/getContent";
import { useAuthStore } from "@/store/auth";
import { MateriasLabel } from "@/types/content/materiasLabel";
import { Paginate } from "@/utils/paginate";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ReactComponent as SettingIcon } from "../../assets/icons/setting.svg";
import { cardTransformationContent, dashAllContent } from "./data";
import NewDemand from "./modals/newDemand";
import SettingsFrente from "./modals/settingsFrente";
import ShowDemand from "./modals/showDemand";
import ValidatedDemand from "./modals/validatedDemand";
import { useModals } from "@/hooks/useModal";

function DashContent() {
  const {
    data: { token, permissao },
  } = useAuthStore();

  const modals = useModals([
    'showDemand',
    'newDemand',
    'settings',
  ]);

  const uploader: boolean = permissao[Roles.uploadDemanda];
  const manager: boolean = permissao[Roles.gerenciadorDemanda];

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
    StatusContent.Pending_Upload
  );
  const dataRef = useRef<ContentDtoInput[]>([]);
  const limitCards = 100;

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

  const onClickCard = (id: number | string) => {
    setDemandSelected(dataRef.current.find((demand) => demand.id === id)!);
    modals.showDemand.open();
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
    return modals.showDemand.isOpen &&
      uploader &&
      demandSelected?.status === StatusContent.Pending_Upload ? (
      <ShowDemand
        handleClose={() => modals.showDemand.close()}
        isOpen={
          modals.showDemand.isOpen &&
          demandSelected?.status === StatusContent.Pending_Upload
        }
        demand={demandSelected!}
        updateStatusDemand={handleRemoveDemand}
      />
    ) : null;
  };

  const ValidatedModalDemand = () => {
    const open =
      modals.showDemand.isOpen &&
      (!uploader || demandSelected?.status !== StatusContent.Pending_Upload);
    return open ? (
      <ValidatedDemand
        demand={demandSelected!}
        updateStatusDemand={handleRemoveDemand}
        handleClose={() => modals.showDemand.close()}
        isOpen={open}
      />
    ) : null;
  };

  const NewModalDemand = () => {
    const open = manager && modals.newDemand.isOpen;
    return !open ? null : (
      <NewDemand
        addDemand={addDemand}
        handleClose={() => modals.newDemand.close()}
        isOpen={modals.newDemand.isOpen}
      />
    );
  };

  const SettingsModal = () => {
    const open = manager && modals.settings.isOpen;
    return !open ? null : (
      <SettingsFrente
        isOpen={modals.settings.isOpen}
        handleClose={() => {
          modals.settings.close();
        }}
      />
    );
  };

  const FilterManager = () => {
    if (!manager) return null;
    return (
      <div className="flex">
        <SettingIcon
          onClick={() => {
            modals.settings.open();
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

  const buttons: ButtonProps[] = [];
  if (manager) {
    buttons.push({
      onClick: () => {
        setDemandSelected(null);
        modals.newDemand.open();
      },
      typeStyle: "quaternary",
      size: "small",
      children: "Nova Demanda",
    });
  }

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
export default DashContent;
