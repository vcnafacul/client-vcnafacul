import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { SelectProps } from "../../../components/atoms/select";
import { OptionProps } from "../../../components/atoms/selectOption";
import DashCardTemplate from "../../../components/templates/dashCardTemplate";
import { DashCardContext } from "../../../context/dashCardContext";
import { ContentDtoInput } from "../../../dtos/content/contentDtoInput";
import { Materias } from "../../../enums/content/materias";
import { getDemands } from "../../../services/content/getDemands";
import { useAuthStore } from "../../../store/auth";
import { MateriasLabel } from "../../../types/content/materiasLabel";
import { Paginate } from "../../../utils/paginate";
import { cardTransformationContent } from "../data";
import ShowDemand from "../modals/showDemand";
import { dashOnlyDemand } from "./data";

function OnlyDemand() {
  const [openShowModal, setOpenShowModal] = useState<boolean>(false);
  const [demands, setDemands] = useState<ContentDtoInput[]>([]);
  const [demandSelected, setDemandSelected] = useState<ContentDtoInput>();
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

  const handleRemoveDemand = (id: string) => {
    const newContent = demands.filter((q) => q.id != id);
    setDemands(newContent);
  };

  const {
    data: { token },
  } = useAuthStore();

  const onClickCard = (id: number | string) => {
    setDemandSelected(dataRef.current.find((demand) => demand.id === id));
    setOpenShowModal(true);
  };

  const ShowModalDemand = () => {
    return !openShowModal ? null : (
      <ShowDemand
        demand={demandSelected!}
        isOpen={openShowModal}
        updateStatusDemand={handleRemoveDemand}
        handleClose={() => setOpenShowModal(false)}
      />
    );
  };

  useEffect(() => {
    const id = toast.loading("Buscando Demandas ... ");
    getDemands(token, 1, limitCards)
      .then((res) => {
        setDemands(res.data);
        toast.update(id, {
          render: "Demandas ok ... ",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .catch((error: Error) => {
        toast.update(id, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  }, [token]);

  const getMoreCards = async (
    page: number
  ): Promise<Paginate<ContentDtoInput>> => {
    return await getDemands(token, page, limitCards);
  };

  const selectFiltes: SelectProps[] = [
    {
      options: materias,
      defaultValue: materiaSelected,
      setState: selectDemandByMateria,
    },
  ];

  return (
    <DashCardContext.Provider
      value={{
        title: dashOnlyDemand.title,
        entities: demands,
        setEntities: setDemands,
        onClickCard,
        getMoreCards,
        cardTransformation: cardTransformationContent,
        limitCards,
        selectFiltes,
      }}
    >
      <DashCardTemplate />
      <ShowModalDemand />
    </DashCardContext.Provider>
  );
}

export default OnlyDemand;
