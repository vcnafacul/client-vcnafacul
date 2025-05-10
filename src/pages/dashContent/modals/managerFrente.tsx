import { InputFactory } from "@/components/organisms/inputFactory";
import { Button } from "@/components/ui/button";
import { FrenteDto } from "@/dtos/content/contentDtoInput";
import { Materias } from "@/enums/content/materias";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import PropValue from "../../../components/molecules/PropValue";
import { FormFieldOption } from "../../../components/molecules/formField";
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

  useEffect(() => {
    register("name");
  }, [register]);

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
      className="bg-white w-full max-w-xl p-4 rounded-md"
    >
      <form
        onSubmit={handleSubmit(frente ? edit : create)}
        className="flex flex-col gap-4"
      >
        <PropValue prop="Materia" value={materia.label} />
        <InputFactory
          id="name"
          type="text"
          label="Nome"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setValue("name", e.target.value)}
          error={errors.name}
          defaultValue={frente?.name}
        />
        <div className="flex justify-end">
          <Button
            variant="default"
            className="bg-orange hover:bg-orange/80"
            type="submit"
          >
            {frente ? "Salvar" : "Criar"}
          </Button>
        </div>
      </form>
    </ModalTemplate>
  );
}

export default ManagerFrente;
