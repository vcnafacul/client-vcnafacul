import { FrenteDto, SubjectDto } from "@/dtos/content/contentDtoInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import PropValue from "../../../components/molecules/PropValue";
import Button from "../../../components/molecules/button";
import { FormFieldInput } from "../../../components/molecules/formField";
import Form from "../../../components/organisms/form";
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

  const listFields: FormFieldInput[] = [
    { id: "name", type: "text", label: "Nome*", className: "col-span-2" },
    {
      id: "description",
      type: "textarea",
      label: "Descrição*",
      className: "col-span-2",
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const create = (data: any) => {
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
      <form onSubmit={handleSubmit(subject ? edit : create)}>
        <Form
          className="flex flex-col gap-4 my-4"
          formFields={listFields}
          register={register}
          errors={errors}
        />
        <div className="flex gap-4 flex-wrap sm:flex-nowrap">
          <Button type="submit">{subject ? "Salvar" : "Criar"}</Button>
          <Button type="button" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </form>
    </ModalTemplate>
  );
}

export default ManagerSubject;
