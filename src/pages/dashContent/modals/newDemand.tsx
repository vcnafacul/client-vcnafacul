import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import Button from "../../../components/molecules/button";
import {
  FormFieldInput,
  FormFieldOption,
} from "../../../components/molecules/formField";
import Form from "../../../components/organisms/form";
import ModalTemplate, {
  ModalProps,
} from "../../../components/templates/modalTemplate";
import { ContentDtoInput } from "../../../dtos/content/contentDtoInput";
import { Materias } from "../../../enums/content/materias";
import { createContent } from "../../../services/content/createContent";
import { getFrenteLikeFormField } from "../../../services/content/getFrentes";
import { getSubjectsLikeFormField } from "../../../services/content/getSubjects";
import { useAuthStore } from "../../../store/auth";
import { MateriasLabel } from "../../../types/content/materiasLabel";

interface NewDemandProps extends ModalProps {
  addDemand: (data: ContentDtoInput) => void;
  isOpen: boolean;
}

function NewDemand({ handleClose, addDemand, isOpen }: NewDemandProps) {
  const [frentes, setFrentes] = useState<FormFieldOption[]>([]);
  const [subjects, setSubjects] = useState<FormFieldOption[]>([]);

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

  const listFields: FormFieldInput[] = [
    {
      id: "materia",
      type: "option",
      options: MateriasLabel,
      label: "Materia",
      className: "col-span-1",
    },
    {
      id: "frente",
      type: "option",
      options: frentes,
      label: "Frente",
      className: "col-start-2 col-span-1",
    },
    {
      id: "subjectId",
      type: "option",
      options: subjects,
      label: "Tema",
      className: "col-start-2 col-span-1",
    },
    { id: "title", type: "text", label: "Título*", className: "col-span-2" },
    {
      id: "description",
      type: "textarea",
      label: "Descrição*",
      className: "col-span-2",
    },
  ];

  const materia = watch("materia");
  const frente = watch("frente");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const create = (data: any) => {
    const id = toast.loading("Criando Demanda ... ");
    createContent(data, token)
      .then((res) => {
        addDemand(res);
        toast.update(id, {
          render: ``,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        handleClose!();
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

  const getSubjectByFrente = useCallback(
    async (frente: string) => {
      getSubjectsLikeFormField(frente, token)
        .then((res) => {
          setSubjects(res);
          if (res.length > 0) {
            setValue("subjectId", res[0].value as string);
          } else {
            setValue("subjectId", null as unknown as string);
          }
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    },
    [setValue, token]
  );

  const getFrenteByMateria = useCallback(
    async (materia: Materias) => {
      getFrenteLikeFormField(
        materia ? materia : Materias.LinguaPortuguesa,
        token
      )
        .then((res) => {
          setFrentes(res);
          if (res.length > 0) {
            getSubjectByFrente(res[0].value as string);
            setValue("frente", res[0].value as string);
          } else {
            setValue("frente", null as unknown as string);
          }
          setValue("subjectId", null as unknown as string);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    },
    [getSubjectByFrente, setValue, token]
  );

  useEffect(() => {
    getFrenteByMateria(materia as Materias);
  }, [getFrenteByMateria, materia, token]);

  useEffect(() => {
    if (frente) {
      getSubjectByFrente(frente);
    }
  }, [getSubjectByFrente, materia, frente, token]);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="bg-white w-full max-w-6xl p-4 rounded-md"
    >
      <div className="bg-white p-4 rounded max-w-7xl">
        <form onSubmit={handleSubmit(create)} className="flex flex-col gap-4">
          <Form
            className="grid grid-cols-2 gap-1 mb-1"
            formFields={listFields}
            register={register}
            errors={errors}
          />
          <div className="flex gap-4 col-span-2">
            <Button type="submit">Salvar</Button>
            <Button type="button" onClick={handleClose}>
              Fechar
            </Button>
          </div>
        </form>
      </div>
    </ModalTemplate>
  );
}

export default NewDemand;
