import { FrenteDto, SubjectDto } from "@/dtos/content/contentDtoInput";
import {
  CreateSubjectDtoInput,
  UpdateSubjectDto,
} from "@/dtos/content/SubjectDto";
import { useToastAsync } from "@/hooks/useToastAsync";
import { createSubject } from "@/services/content/createSubject";
import { updateSubject } from "@/services/content/updateSubject";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ModalTemplate from "../../../components/templates/modalTemplate";
import { deleteSubject } from "../../../services/content/deleteSubject";
import { getSubjects } from "../../../services/content/getSubjects";
import { useAuthStore } from "../../../store/auth";
import { PanelSubject } from "./panelSubject";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  frente: FrenteDto;
  updateSizeFrente: (size: number) => void;
}

function SettingsSubject({
  isOpen,
  handleClose,
  frente,
  updateSizeFrente,
}: Props) {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);

  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const handleRemove = async (subjectId: string) => {
    await executeAsync({
      action: () => deleteSubject(subjectId, token),
      loadingMessage: "Deletando Tema ... ",
      successMessage: "Tema deletado com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        setSubjects(subjects.filter((subject) => subject.id !== subjectId));
      },
    });
  };

  const handleCreate = async (body: CreateSubjectDtoInput) => {
    await executeAsync({
      action: () => createSubject(body, token),
      loadingMessage: "Criando Tema ... ",
      successMessage: "Tema criado com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: (res) => {
        const newSubject: SubjectDto = {
          id: res.id,
          name: res.name,
          description: res.description,
          frente: frente,
          lenght: 0,
          createdAt: new Date(),
          contents: [],
        };
        setSubjects([...subjects, newSubject]);
        updateSizeFrente(subjects.length + 1);
      },
    });
  };

  const handleUpdate = async (body: UpdateSubjectDto) => {
    await executeAsync({
      action: () => updateSubject(body, token),
      loadingMessage: "Editando Tema ... ",
      successMessage: "Tema editado com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        setSubjects(
          subjects.map((subject) =>
            subject.id === body.id
              ? {
                  ...subject,
                  name: body.name,
                  description: body.description,
                  frente: frente,
                }
              : subject
          )
        );
        updateSizeFrente(subjects.length);
      },
    });
  };

  useEffect(() => {
    const getSubjectByFrente = (_frente: FrenteDto = frente) => {
      if (_frente) {
        getSubjects(_frente.id, token)
          .then((res) => {
            setSubjects(res);
          })
          .catch((error: Error) => {
            toast.error(error.message);
          });
      }
    };
    getSubjectByFrente();
  }, []);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="bg-white w-[90vw] p-6 rounded-md max-h-[90vh]"
    >
      <div className="flex flex-col gap-6">
        <span className="text-2xl font-semibold text-marine">
          {frente.name}
        </span>
        <div className="h-full">
          <PanelSubject
            subjects={subjects}
            frente={frente}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleRemove}
          />
        </div>
      </div>
    </ModalTemplate>
  );
}

export default SettingsSubject;
