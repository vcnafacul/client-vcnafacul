import { FrenteDto, SubjectDto } from "@/dtos/content/contentDtoInput";
import {
  CreateSubjectDtoInput,
  UpdateSubjectDto,
} from "@/dtos/content/SubjectDto";
import { createSubject } from "@/services/content/createSubject";
import { updateSubject } from "@/services/content/updateSubject";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ModalTemplate from "../../../components/templates/modalTemplate";
import { deleteSubject } from "../../../services/content/deleteSubject";
import { getSubjects } from "../../../services/content/getSubjects";
import { useAuthStore } from "../../../store/auth";
import { SubjectPanel } from "./subjectPanel";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  frente: FrenteDto;
  updateSizeFrente: (size: number) => void;
}

function SettingsSubject({ isOpen, handleClose, frente, updateSizeFrente }: Props) {
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);

  const {
    data: { token },
  } = useAuthStore();

  const handleRemove = async (subjectId: string) => {
    const idToast = toast.loading("Deletando Tema ... ");
    deleteSubject(subjectId, token)
      .then(() => {
        toast.update(idToast, {
          render: `Tema Deletado`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        const updatedSubject = subjects.filter((subject) => {
          if (subject.id !== subjectId) return subject;
        });
        setSubjects(updatedSubject);
        updateSizeFrente(updatedSubject.length);
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

  const handleCreate = async (body: CreateSubjectDtoInput) => {
    const id = toast.loading("Criando Tema ... ");
    createSubject(body, token)
      .then((res) => {
        toast.update(id, {
          render: `Tema Criado`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        const newSubject: SubjectDto = {
          id: res.id,
          name: res.name,
          description: res.description,
          frente: frente,
          lenght: 0,
          createdAt: new Date(),
        };
        const newSubjects: SubjectDto[] = [...subjects, newSubject];
        setSubjects(newSubjects);
        updateSizeFrente(newSubjects.length);
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

  const handleUpdate = async (body: UpdateSubjectDto) => {
    const id = toast.loading("Editando Tema ... ");
    updateSubject(body, token)
      .then(() => {
        toast.update(id, {
          render: `Tema Editado`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        const newSubject = {
          id: body.id,
          description: body.description,
          name: body.name,
          frente: frente,
        };
        const newSubjects: SubjectDto[] = subjects.map((subject) => {
          if (subject.id === newSubject.id) {
            return {
              ...newSubject,
              lenght: subject.lenght,
              createdAt: subject.createdAt,
            };
          }
          return subject;
        });
        setSubjects(newSubjects);
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

  useEffect(() => {
    const getSubjectByFrente = (_frente: FrenteDto = frente) => {
      if (_frente) {
        getSubjects(_frente.id, token)
          .then((res) => {
            console.log(res);
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
          <SubjectPanel
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
