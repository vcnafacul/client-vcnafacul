/* eslint-disable @typescript-eslint/no-explicit-any */
import { OptionsSelect } from "@/components/ui/options-select";
import { Field, FormLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
            noValidate
            className="flex flex-col gap-6"
          >
            <FormLegend />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Matéria" required error={errors.materia?.message}>
                <OptionsSelect
                  id="materia"
                  options={materiasOptions}
                  value={materia}
                  onValueChange={(valor) => setValue("materia", valor)}
                />
              </Field>
              <Field label="Frente" required error={errors.frente?.message}>
                <OptionsSelect
                  id="frente"
                  options={frentes.map((f) => ({ label: f.nome, value: f._id || f.id }))}
                  value={frente}
                  onValueChange={(valor) => setValue("frente", valor)}
                />
              </Field>
              <Field label="Tema" required error={errors.subjectId?.message}>
                <OptionsSelect
                  id="subjectId"
                  options={subjects.map((s) => ({ label: s.name, value: s._id || s.id }))}
                  value={watch("subjectId")}
                  onValueChange={(valor) => setValue("subjectId", valor)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Field label="Título" required error={errors.title?.message}>
                <Input
                  id="title"
                  type="text"
                  placeholder="Digite um Título"
                  onChange={(e) => setValue("title", e.target.value)}
                />
              </Field>
              <Field label="Descrição" required error={errors.description?.message}>
                <Textarea
                  id="description"
                  placeholder="Digite uma descrição"
                  onChange={(e) => setValue("description", e.target.value)}
                />
              </Field>
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
