/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputFactory } from "@/components/organisms/inputFactory";
import { Button } from "@/components/ui/button";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getMaterias, MateriaDto } from "@/services/content/getMaterias";
import { getSubjects } from "@/services/content/getSubjects";
import { yupResolver } from "@hookform/resolvers/yup";
import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import { ModalProps } from "@/types/modal";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ContentDtoInput,
  FrenteDto,
  SubjectDto,
} from "../../../dtos/content/contentDtoInput";
import { createContent } from "../../../services/content/createContent";
import { useAuthStore } from "../../../store/auth";

interface NewDemandProps extends ModalProps {
  addDemand: (data: ContentDtoInput) => void;
  isOpen: boolean;
}

function NewDemand({ handleClose, addDemand, isOpen }: NewDemandProps) {
  const [materiasList, setMateriasList] = useState<MateriaDto[]>([]);
  const [frentes, setFrentes] = useState<FrenteDto[]>([]);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);

  const executeAsync = useToastAsync();

  const {
    data: { token },
  } = useAuthStore();

  const schema = yup
    .object()
    .shape({
      materia: yup.string().required("Matéria é obrigatória"),
      frente: yup.string().required("Frente é obrigatória"),
      subjectId: yup.string().required("Tema é Obrigatório"),
      title: yup.string().required("Você precisa definir um Título"),
      description: yup
        .string()
        .required("Você precisa definir uma descrição para essa Demanda"),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    register("materia");
    register("frente");
    register("subjectId");
    register("title");
    register("description");
  }, []);

  useEffect(() => {
    getMaterias(token)
      .then((res) => {
        setMateriasList(res);
        if (res.length > 0) {
          setValue("materia", res[0]._id);
        }
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  }, [token]);

  const materia = watch("materia");
  const frente = watch("frente");

  const create = async (data: any) => {
    await executeAsync({
      action: () => createContent(data, token),
      loadingMessage: "Criando Demanda ... ",
      successMessage: "Demanda criada com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: (res) => {
        addDemand(res);
        handleClose!();
      },
    });
  };

  useEffect(() => {
    if (!materia) return;
    const frentesFound = materiasList.find((m) => m._id === materia)?.frentes;
    if (frentesFound) {
      setFrentes(frentesFound);
    } else {
      setFrentes([]);
    }
    setValue("frente", "");
    setSubjects([]);
    setValue("subjectId", "");
  }, [materia]);

  useEffect(() => {
    if (!frente) {
      setSubjects([]);
      setValue("subjectId", "");
      return;
    }
    getSubjects(frente, token)
      .then((res) => {
        setSubjects(res);
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  }, [frente, token]);

  const materiasOptions = materiasList.map((m) => ({
    value: m._id,
    label: m.nome,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose?.()}>
      <DialogContent size="lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Criar demanda</DialogTitle>
        </DialogHeader>
        <DialogBody className="-mx-1 px-1 pt-2">
          <form
            id="form-new-demand"
            onSubmit={handleSubmit(create)}
            className="flex flex-col gap-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputFactory
                id="materia"
                type="select"
                appendTo="self"
                label="Matéria"
                error={errors.materia}
                options={materiasOptions}
                defaultValue={materia}
                onChange={(e: any) => setValue("materia", e.target.value)}
              />
              <InputFactory
                id="frente"
                type="select"
                appendTo="self"
                label="Frente"
                error={errors.frente}
                value={frente}
                options={frentes.map((f) => ({ label: f.nome, value: f._id }))}
                onChange={(e: any) => setValue("frente", e.target.value)}
              />
              <InputFactory
                id="subjectId"
                type="select"
                appendTo="self"
                label="Tema"
                error={errors.subjectId}
                value={watch("subjectId")}
                options={subjects.map((s) => ({ label: s.name, value: s._id }))}
                onChange={(e: any) => setValue("subjectId", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <InputFactory
                id="title"
                type="text"
                label="Título*"
                placeholder="Digite um Título"
                error={errors.title}
                onChange={(e: any) => setValue("title", e.target.value)}
              />
              <InputFactory
                id="description"
                type="textarea"
                label="Descrição*"
                placeholder="Digite uma descrição"
                error={errors.description}
                onChange={(e: any) => setValue("description", e.target.value)}
              />
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex items-center gap-2"
          >
            <X size={18} /> Fechar
          </Button>
          <Button
            type="submit"
            form="form-new-demand"
            className="flex items-center gap-2"
          >
            <Save size={18} /> Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NewDemand;
