import { InputFactory } from "@/components/organisms/inputFactory";
import { Button } from "@/components/ui/button";
import { FrenteDto, SubjectDto } from "@/dtos/content/contentDtoInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import PropValue from "../../../components/molecules/PropValue";
import ModalTemplate, {
  ModalProps,
} from "../../../components/templates/modalTemplate";
import {
  CreateSubjectDtoInput,
  UpdateSubjectDto,
} from "../../../dtos/content/SubjectDto";

interface Props extends ModalProps {
  frente: FrenteDto;
  subject?: SubjectDto | null;
  isOpen: boolean;
  newSubject: (body: CreateSubjectDtoInput) => Promise<void>;
  editSubject: (body: UpdateSubjectDto) => Promise<void>;
}

function ManagerSubject({
  handleClose,
  frente,
  subject,
  newSubject,
  editSubject,
  isOpen,
}: Props) {
  const schema = yup
    .object()
    .shape({
      name: yup.string().required("Você precisa definir um Título"),
      description: yup
        .string()
        .required("Você precisa definir uma descrição para esse Tema"),
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
    register("description");
  }, []);

  console.log(errors);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const create = (data: any) => {
    console.log(data);
    const body: CreateSubjectDtoInput = {
      name: data.name,
      description: data.description,
      frente: frente!.id,
    };
    newSubject(body).then(() => handleClose!());
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const edit = (data: any) => {
    const body: UpdateSubjectDto = {
      id: frente!.id,
      name: data.name,
      description: data.description,
    };
    editSubject(body).then(() => handleClose!());
  };

  useEffect(() => {
    if (subject) {
      setValue("name", subject.name);
      setValue("description", subject.description);
    }
  }, [setValue, subject]);

  return (
    <ModalTemplate
      className="bg-white p-4 rounded-md max-w-4xl w-full"
      handleClose={handleClose!}
      isOpen={isOpen}
    >
      <PropValue prop="Frente" value={frente.name} />
      <form
        onSubmit={handleSubmit(subject ? edit : create)}
        className="flex flex-col py-4"
      >
        <InputFactory
          id="name"
          type="text"
          label="Nome*"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setValue("name", e.target.value)}
          error={errors.name}
          className="col-span-2"
        />
        <InputFactory
          id="description"
          type="textarea"
          label="Descrição*"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setValue("description", e.target.value)}
          error={errors.description}
          className="col-span-2 w-full outline-none pt-4"
        />
        <div className="flex justify-end gap-4">
          <Button
            variant="default"
            className="bg-orange hover:bg-orange/80"
            type="submit"
          >
            {subject ? "Salvar" : "Criar"}
          </Button>
        </div>
      </form>
    </ModalTemplate>
  );
}

export default ManagerSubject;
