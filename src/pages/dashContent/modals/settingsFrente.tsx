import { InputFactory } from "@/components/organisms/inputFactory";
import { FrenteDto } from "@/dtos/content/contentDtoInput";
import {
  CreateFrenteDtoInput,
  UpdateFrenteDto,
} from "@/dtos/content/frenteDto";
import { createFrente } from "@/services/content/createFrente";
import { updateFrente } from "@/services/content/updateFrente";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ModalTemplate from "../../../components/templates/modalTemplate";
import { Materias } from "../../../enums/content/materias";
import { deleteFrente } from "../../../services/content/deleteFrente";
import { getFrentes } from "../../../services/content/getFrentes";
import { useAuthStore } from "../../../store/auth";
import { MateriasLabel } from "../../../types/content/materiasLabel";
import { PanelFrente } from "./panelFrente";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}

function SettingsFrente({ isOpen, handleClose }: Props) {
  const [frentes, setFrentes] = useState<FrenteDto[]>([]);
  const [materiaSelected, setMateriaSelected] = useState<Materias>(
    Materias.LinguaPortuguesa
  );

  const {
    data: { token },
  } = useAuthStore();

  const handleRemoveFrente = async (frenteId: string) => {
    const idToast = toast.loading("Deletando Frente ... ");
    deleteFrente(frenteId, token)
      .then(() => {
        toast.update(idToast, {
          render: `Frente Deletada`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setFrentes(
          frentes.filter((frente) => {
            if (frente.id !== frenteId) return frente;
          })
        );
      })
      .catch((error: Error) => {
        toast.update(idToast, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const handleCreate = async (body: CreateFrenteDtoInput) => {
    const id = toast.loading("Criando Frente ... ");
    createFrente(body, token)
      .then((res) => {
        toast.update(id, {
          render: `Frente ${body.name} Criada`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        const newFrente = {
          id: res.id,
          name: res.name,
          materia: materiaSelected,
          lenght: 0,
          createdAt: new Date(),
          subjects: [],
        };
        const newFrentes: FrenteDto[] = [...frentes, newFrente];
        setFrentes(newFrentes);
      })
      .catch((error: Error) => {
        toast.update(id, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const handleUpdate = async (body: UpdateFrenteDto) => {
    const id = toast.loading("Editando Frente ... ");
    updateFrente(body, token)
      .then(() => {
        toast.update(id, {
          render: `Frente Editada`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        const newFrente = {
          id: body.id,
          name: body.name,
          materia: materiaSelected,
        };
        const newFrentes: FrenteDto[] = frentes.map((frente) => {
          if (frente.id === newFrente.id) {
            return {
              ...newFrente,
              lenght: frente.lenght,
              createdAt: frente.createdAt,
              subjects: frente.subjects,
            };
          }
          return frente;
        });
        setFrentes(newFrentes);
      })
      .catch((error: Error) => {
        toast.update(id, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  function updateSizeFrente(id: string, size: number) {
    const newFrentes = frentes.map((frente) => {
      if (frente.id === id) {
        return {
          ...frente,
          lenght: size,
        };
      }
      return frente;
    });
    setFrentes(newFrentes);
  }

  useEffect(() => {
    const getFrenteByMateria = (materia: Materias) => {
      getFrentes(materia, token)
        .then((res) => {
          setFrentes(res);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    };
    getFrenteByMateria(materiaSelected);
  }, [materiaSelected]);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="bg-white w-[90vw] p-6 rounded-md max-h-[90vh]"
    >
      <div className="flex flex-col gap-6">
        {/* Seleção de matéria */}
        <InputFactory
          id="materia"
          type="select"
          label="Matéria"
          options={MateriasLabel}
          defaultValue={materiaSelected}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setMateriaSelected(e.target.value)}
        />

        {/* Painel Frentes e Temas */}
        <div className="h-full">
          <PanelFrente
            frentes={frentes}
            updateSizeFrente={updateSizeFrente}
            materia={materiaSelected}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleRemoveFrente}
          />
        </div>
      </div>
    </ModalTemplate>
  );
}

export default SettingsFrente;
