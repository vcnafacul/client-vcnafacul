/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputFactory } from "@/components/organisms/inputFactory";
import { Button } from "@/components/ui/button";
import { Materias } from "@/enums/content/materias";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getFrentes } from "@/services/content/getFrentes";
import { getSubjects } from "@/services/content/getSubjects";
import { yupResolver } from "@hookform/resolvers/yup";
import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import ModalTemplate, {
  ModalProps,
} from "../../../components/templates/modalTemplate";
import {
  ContentDtoInput,
  FrenteDto,
  SubjectDto,
} from "../../../dtos/content/contentDtoInput";
import { createContent } from "../../../services/content/createContent";
import { useAuthStore } from "../../../store/auth";
import { MateriasLabel } from "../../../types/content/materiasLabel";

interface NewDemandProps extends ModalProps {
  addDemand: (data: ContentDtoInput) => void;
  isOpen: boolean;
}

function NewDemand({ handleClose, addDemand, isOpen }: NewDemandProps) {
  const [frentes, setFrentes] = useState<FrenteDto[]>([]);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);

  const executeAsync = useToastAsync();

  const {
    data: { token },
  } = useAuthStore();

  const schema = yup
    .object()
    .shape({
      materia: yup.number().required(),
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
    const getFrenteByMateria = async (materia: Materias) => {
      getFrentes(materia ? materia : Materias.LinguaPortuguesa, token)
        .then((res) => {
          setFrentes(res);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    };
    getFrenteByMateria(materia as Materias);
  }, [materia, token]);

  useEffect(() => {
    const getSubjectByFrente = async (frente: string) => {
      getSubjects(frente, token)
        .then((res) => {
          setSubjects(res);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    };
    if (frente) {
      getSubjectByFrente(frente);
    }
  }, [materia, frente, token]);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="bg-white w-full max-w-[90vw] p-6 rounded-2xl shadow-lg"
    >
      <div className="bg-white p-6 rounded-lg">
        <form onSubmit={handleSubmit(create)} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputFactory
              id="materia"
              type="select"
              label="Matéria"
              error={errors.materia}
              options={MateriasLabel}
              defaultValue={Materias.LinguaPortuguesa}
              onChange={(e: any) => setValue("materia", e.target.value)}
            />
            <InputFactory
              id="frente"
              type="select"
              label="Frente"
              error={errors.frente}
              options={frentes.map((f) => ({ label: f.name, value: f.id }))}
              onChange={(e: any) => setValue("frente", e.target.value)}
            />
            <InputFactory
              id="subjectId"
              type="select"
              label="Tema"
              error={errors.subjectId}
              options={subjects.map((s) => ({ label: s.name, value: s.id }))}
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

          <div className="flex justify-end gap-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex items-center gap-2"
            >
              <X size={18} /> Fechar
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              <Save size={18} /> Salvar
            </Button>
          </div>
        </form>
      </div>
    </ModalTemplate>
  );
}

export default NewDemand;
