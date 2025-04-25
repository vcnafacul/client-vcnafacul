import { FrenteDto } from "@/dtos/content/contentDtoInput";
import { Materias } from "@/enums/content/materias";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
  CreateFrenteDtoInput,
  UpdateFrenteDto,
} from "../../../dtos/content/frenteDto";

interface Props extends ModalProps {
  materia: FormFieldOption;
  frente?: FrenteDto | null;
  newFrente: (frente: CreateFrenteDtoInput) => Promise<void>;
  editFrente: (frente: UpdateFrenteDto) => Promise<void>;
  isOpen: boolean;
}

function ManagerFrente({
  handleClose,
  materia,
  frente,
  newFrente,
  editFrente,
  isOpen,
}: Props) {
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

  const listFields: FormFieldInput[] = [
    { id: "name", type: "text", label: "Nome*", className: "col-span-2" },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const create = (data: any) => {
    const body: CreateFrenteDtoInput = {
      name: data.name,
      materia: materia.value as Materias,
    };
    newFrente(body).then(() => handleClose!());
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const edit = (data: any) => {
    const body: UpdateFrenteDto = {
      id: frente!.id,
      name: data.name,
    };
    editFrente(body).then(() => handleClose!());
  };

  useEffect(() => {
    if (frente) {
      setValue("name", frente.name);
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

export default ManagerFrente;
