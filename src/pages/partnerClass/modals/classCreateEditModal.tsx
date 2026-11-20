/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputFactory } from "@/components/organisms/inputFactory";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClassEntityOutput } from "@/dtos/classes/classOutput";
import { useToastAsync } from "@/hooks/useToastAsync";
import { createClass } from "@/services/prepCourse/class/createClass";
import { editClass } from "@/services/prepCourse/class/editClass";
import { useAuthStore } from "@/store/auth";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

interface ClassModalProps {
  isOpen: boolean;
  handleClose: () => void;
  entity?: ClassEntity;
  coursePeriodSelected: string;
  onCreateClass: (entity: ClassEntity) => void;
  onEditClass: (entity: ClassEntity) => void;
}

export function ClassCreateEditModal({
  isOpen,
  handleClose,
  entity,
  coursePeriodSelected,
  onCreateClass,
  onEditClass,
}: ClassModalProps) {
  const schema = yup
    .object()
    .shape({
      name: yup.string().default(entity?.name).required("Campo obrigatório"),
      description: yup.string().default(entity?.description),
    })
    .required();

  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const resolver = (data: any) => {
    if (entity) {
      handleEditClass({ ...data, id: entity.id });
    } else {
      handleCreateClass({
        ...data,
        coursePeriodId: coursePeriodSelected,
      });
    }
  };

  const handleEditClass = async (dto: ClassEntityOutput & { id: string }) => {
    await executeAsync({
      action: () => editClass(token, dto),
      loadingMessage: "Editando turma...",
      successMessage: "Turma editada com sucesso!",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        handleClose();
        onEditClass({
          ...entity!,
          name: dto.name,
          description: dto.description,
        });
      },
    });
  };

  const handleCreateClass = async (dto: ClassEntityOutput) => {
    await executeAsync({
      action: () => createClass(token, dto),
      loadingMessage: "Criando turma...",
      successMessage: "Turma criada com sucesso!",
      errorMessage: (error: Error) => error.message,
      onSuccess: (res: ClassEntity) => {
        handleClose();
        onCreateClass(res);
      },
    });
  };

  useEffect(() => {
    register("name");
    register("description");
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Turmas</DialogTitle>
        </DialogHeader>

        <form
          id="form-turma"
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(resolver)}
        >
          {/* Linha 1: Nome e Data */}
          <InputFactory
            id="name"
            label="Título"
            type="text"
            defaultValue={entity?.name}
            error={errors.name}
            onChange={(e: { target: { value: string } }) =>
              setValue("name", e.target.value)
            }
          />
          {/* Linha 2: Descrição */}
          <InputFactory
            id="description"
            label="Descrição"
            type="textarea"
            defaultValue={entity?.description}
            onChange={(e: { target: { value: string | undefined } }) =>
              setValue("description", e.target.value)
            }
            rows={5}
          />
        </form>

        <DialogFooter>
          <Button variant="outlined" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="contained" type="submit" form="form-turma">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
