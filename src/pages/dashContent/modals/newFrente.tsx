/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import PropValue from "../../../components/molecules/PropValue";
import Button from "../../../components/molecules/button";
import {
  FormFieldInput,
  FormFieldOption,
} from "../../../components/molecules/formField";
import Form from "../../../components/organisms/form";
import ModalTemplate, {
  ModalProps,
} from "../../../components/templates/modalTemplate";
import {
  CreateFrenteDtoOutput,
  UpdateFrenteDtoOutut,
} from "../../../dtos/content/frenteDto";
import { createFrente } from "../../../services/content/createFrente";
import { updateFrente } from "../../../services/content/updateFrente";
import { useAuthStore } from "../../../store/auth";
import { FormFieldOptionFrente } from "./settingsContent";

interface NewFrenteProps extends ModalProps {
  materia: FormFieldOption;
  frente?: FormFieldOptionFrente;
  actionFrente: (frente: FormFieldOptionFrente) => void;
  isOpen: boolean;
}

function NewFrente({
  handleClose,
  materia,
  frente,
  actionFrente,
  isOpen,
}: NewFrenteProps) {
  const schema = yup
    .object()
    .shape({
      name: yup.string().required("Você precisa definir um Título"),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const {
    data: { token },
  } = useAuthStore();

  const listFields: FormFieldInput[] = [
    { id: "name", type: "text", label: "Nome*", className: "col-span-2" },
  ];

  const create = (data: any) => {
    const body: CreateFrenteDtoOutput = {
      name: data.name,
      materia: parseInt(materia.value as string),
    };
    const id = toast.loading("Criando Frente ... ");
    createFrente(body, token)
      .then((res) => {
        toast.update(id, {
          render: `Frente ${body.name} Criada`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        actionFrente({ label: body.name, value: res.id, canDelete: true });
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

  const edit = (data: any) => {
    const body: UpdateFrenteDtoOutut = {
      name: data.name,
      id: frente!.value as string,
    };
    const id = toast.loading("Editando Frente ... ");
    updateFrente(body, token)
      .then((_) => {
        toast.update(id, {
          render: `Frente Editada`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        actionFrente({
          label: body.name,
          value: frente!.value,
          canDelete: frente!.canDelete,
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

  useEffect(() => {
    if (frente) {
      setValue("name", frente.label);
    }
  }, [frente, setValue]);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="bg-white w-full max-w-6xl p-4 rounded-md"
    >
      <form onSubmit={handleSubmit(frente ? edit : create)}>
        <PropValue prop="Materia" value={materia.label} />
        <Form
          className="flex flex-col gap-4 my-4"
          formFields={listFields}
          register={register}
          errors={errors}
        />
        <div className="flex gap-4 flex-wrap sm:flex-nowrap">
          <Button type="submit">{frente ? "Salvar" : "Criar"}</Button>
        </div>
      </form>
    </ModalTemplate>
  );
}

export default NewFrente;
