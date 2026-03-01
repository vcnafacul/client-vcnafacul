import { InputFactory } from "@/components/organisms/inputFactory";
import { FrenteDto } from "@/dtos/content/contentDtoInput";
import {
  CreateFrenteDtoInput,
  UpdateFrenteDto,
} from "@/dtos/content/frenteDto";
import { useToastAsync } from "@/hooks/useToastAsync";
import { createFrente } from "@/services/content/createFrente";
import { deleteFrente } from "@/services/content/deleteFrente";
import { getMaterias, MateriaDto } from "@/services/content/getMaterias";
import { updateFrente } from "@/services/content/updateFrente";
import { getSubjects } from "@/services/content/getSubjects";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ModalTemplate from "../../../components/templates/modalTemplate";
import { useAuthStore } from "../../../store/auth";
import { PanelFrente } from "./panelFrente";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}

function SettingsFrente({ isOpen, handleClose }: Props) {
  const [frentes, setFrentes] = useState<FrenteDto[]>([]);
  const [materiasList, setMateriasList] = useState<MateriaDto[]>([]);
  const [materiaSelected, setMateriaSelected] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const executeAsync = useToastAsync();

  const {
    data: { token },
  } = useAuthStore();

  useEffect(() => {
    getMaterias(token)
      .then((res) => {
        setMateriasList(res);
        if (res.length > 0) {
          setMateriaSelected(res[0]._id);
        }
      })
      .catch((error: Error) => {
        toast.error(error.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleCreate = async (body: CreateFrenteDtoInput) => {
    const materiaId = body.materia ?? materiaSelected;
    await executeAsync({
      action: () => createFrente(body, token),
      loadingMessage: "Criando Frente ... ",
      successMessage: "Frente criada com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: (res) => {
        const newFrente: FrenteDto = {
          id: res.id ?? res._id,
          nome: res.nome,
          materia: materiaId,
          lenght: 0,
          createdAt: new Date(),
          subjects: [],
        };
        setFrentes((prev) => [...prev, newFrente]);
        // Atualizar lista de matérias com o novo ObjectId da frente (evita refetch)
        setMateriasList((prev) =>
          prev.map((m) =>
            m._id === materiaId
              ? { ...m, frentes: [...(m.frentes ?? []), newFrente] }
              : m
          )
        );
      },
    });
  };

  const handleUpdate = async (body: UpdateFrenteDto) => {
    await executeAsync({
      action: () => updateFrente(body, token),
      loadingMessage: "Editando Frente ... ",
      successMessage: "Frente editada com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        setFrentes(
          frentes.map((frente) =>
            (frente._id || frente.id) === body.id ? { ...frente, nome: body.name } : frente
          )
        );
      },
    });
  };

  function updateSizeFrente(id: string, size: number) {
    const newFrentes = frentes.map((frente) => {
      if ((frente._id || frente.id) === id) {
        return {
          ...frente,
          lenght: size,
        };
      }
      return frente;
    });
    setFrentes(newFrentes);
  }

  /** Remove a frente da lista local e da lista de matérias (usado ao excluir frente). */
  function removeFrenteFromMateriasList(frenteId: string) {
    const norm = (id: string) => (f: FrenteDto) => (f._id || f.id) === id;
    setFrentes((prev) => prev.filter((f) => !norm(frenteId)(f)));
    setMateriasList((prev) =>
      prev.map((m) => ({
        ...m,
        frentes: (m.frentes ?? []).filter((f) => !norm(frenteId)(f)),
      }))
    );
  }

  const handleDeleteFrente = async (frenteId: string) => {
    await executeAsync({
      action: () => deleteFrente(frenteId, token),
      loadingMessage: "Excluindo frente...",
      successMessage: "Frente excluída com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        removeFrenteFromMateriasList(frenteId);
      },
    });
  };

  useEffect(() => {
    if (!materiaSelected) return;
    const materia = materiasList.find((m) => m._id === materiaSelected);
    const frentesRaw = materia?.frentes ?? [];

    if (frentesRaw.length === 0) {
      setFrentes([]);
      return;
    }

    Promise.all(
      frentesRaw.map((f) =>
        getSubjects(f._id || f.id, token)
          .then((subjects) => ({ ...f, lenght: subjects.length, subjects }))
          .catch(() => ({ ...f, lenght: 0, subjects: [] }))
      )
    ).then(setFrentes);
  }, [materiaSelected, materiasList, token]);

  const materiasOptions = materiasList.map((m) => ({
    value: m._id,
    label: m.nome,
  }));

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="bg-white w-[90vw] p-6 rounded-md max-h-[90vh]"
    >
      <div className="flex flex-col gap-6">
        {loading ? (
          <span className="text-gray-500">Carregando matérias...</span>
        ) : (
          <>
            {/* Seleção de matéria */}
            <InputFactory
              id="materia"
              type="select"
              label="Matéria"
              options={materiasOptions}
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
                materiaLabel={
                  materiasList.find((m) => m._id === materiaSelected)?.nome ??
                  ""
                }
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onDelete={handleDeleteFrente}
              />
            </div>
          </>
        )}
      </div>
    </ModalTemplate>
  );
}

export default SettingsFrente;
