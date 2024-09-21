import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import { InputFactory } from "@/components/organisms/inputFactory";
import { StudentInscriptionDTO } from "@/dtos/student/studentInscriptionDTO";
import { stateOptions } from "@/pages/register/data";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { EachStepProps } from "..";

export function PartnerPrepInscriptionStep3({
  description,
  updateData,
  currentData,
  handleBack,
}: EachStepProps) {
  const schema = yup
    .object()
    .shape({
      fullName: yup
        .string()
        .default(currentData?.legalGuardian?.fullName)
        .required("Por favor, preencha o nome do seu responsável"),
      phone: yup
        .string()
        .default(currentData?.legalGuardian?.phone)
        .required("Por favor, preencha o telefone do seu responsável"),
      rg: yup
        .string()
        .default(currentData?.legalGuardian?.rg)
        .required("Por favor, preencha o rg do seu responsável"),
      uf: yup
        .string()
        .default(currentData?.legalGuardian?.uf)
        .required("Por favor, preencha o uf do rg do seu responsável"),
      cpf: yup
        .string()
        .default(currentData?.legalGuardian?.cpf)
        .required("Por favor, preencha o cpf do seu responsável"),
    })
    .required();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    register("fullName");
    register("phone");
    register("rg");
    register("uf");
    register("cpf");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleForm(data: Partial<StudentInscriptionDTO>) {
    updateData!(data);
  }
  return (
    <form
      onSubmit={handleSubmit(handleForm)}
      className="w-full flex flex-col gap-2 mt-8 mb-16"
    >
      <Text size="tertiary">{description}</Text>
      <InputFactory
        id="fullName"
        label="Nome Completo Responsável*"
        type="text"
        error={errors.fullName}
        defaultValue={currentData?.legalGuardian?.fullName}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("fullName", e.target.value)}
      />
      <InputFactory
        id="phone"
        label="Telefone do Responsável*"
        type="text"
        error={errors.phone}
        defaultValue={currentData?.legalGuardian?.phone}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("phone", e.target.value)}
      />
      <div className="flex gap-4">
        <div className="flex-1">
          <InputFactory
            id="rg"
            label="RG do Responsável"
            type="text"
            defaultValue={currentData?.legalGuardian?.rg}
            error={errors.rg}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e: any) => setValue("rg", e.target.value)}
          />
        </div>
        <div className="w-24">
          <InputFactory
            id="uf"
            label="UF"
            type="select"
            options={
              stateOptions.map((state) => ({
                label: state.value,
                value: state.value,
              })) as {
                label: string;
                value: string;
              }[]
            }
            defaultValue={currentData?.legalGuardian?.uf}
            error={errors.uf}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e: any) => setValue("uf", e.target.value)}
          />
        </div>
      </div>
      <InputFactory
        id="cpf"
        label="CPF do responsável*"
        type="text"
        error={errors.cpf}
        defaultValue={currentData?.legalGuardian?.cpf}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("cpf", e.target.value)}
      />
      <div className="flex flex-col sm:flex-row gap-4">
        <Button type="button" onClick={handleBack}>
          Voltar
        </Button>
        <Button type="submit">Continuar</Button>
      </div>
    </form>
  );
}
