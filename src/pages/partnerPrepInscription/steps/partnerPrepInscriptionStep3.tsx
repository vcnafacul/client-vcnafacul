import Text from "@/components/atoms/text";
import Button from "@/components/molecules/button";
import { InputFactory } from "@/components/organisms/inputFactory";
import { LegalGuardianDTO } from "@/dtos/student/studentInscriptionDTO";
import { stateOptions } from "@/pages/register/data";
import { phoneMask } from "@/utils/phoneMask";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { validateCPF } from "validations-br";
import * as yup from "yup";
import { EachStepProps } from "..";

interface PartnerPrepInscriptionStep3Props extends EachStepProps {
  isMinor: boolean;
}

export function PartnerPrepInscriptionStep3({
  description,
  updateData,
  currentData,
  handleBack,
  isMinor,
}: PartnerPrepInscriptionStep3Props) {
  const [phone, setPhone] = useState<string>(
    phoneMask(currentData?.urgencyPhone) || ""
  );

  const schema = yup
    .object()
    .shape({
      fullName: yup
        .string()
        .default(currentData?.legalGuardian?.fullName)
        .when([], {
          is: () => isMinor,
          then: () =>
            yup
              .string()
              .required("Por favor, preencha o nome do seu responsável"),
          otherwise: () => yup.string().notRequired(),
        }),
      phone: yup
        .string()
        .default(phoneMask(currentData?.legalGuardian?.phone))
        .when([], {
          is: () => isMinor,
          then: () =>
            yup
              .string()
              .required("Por favor, preencha o telefone do seu responsável"),
          otherwise: () => yup.string().notRequired(),
        }),
      rg: yup.string().default(currentData?.legalGuardian?.rg),
      uf: yup
        .string()
        .default(currentData?.legalGuardian?.uf)
        .when("rg", {
          is: (value: string) => isMinor && value.length > 0,
          then: () => yup.string().required("Requerido"),
          otherwise: () => yup.string().notRequired(),
        }),
      cpf: yup
        .string()
        .default(currentData?.legalGuardian?.cpf)
        .when([], {
          is: () => isMinor,
          then: () =>
            yup
              .string()
              .required("Por favor, preencha o cpf do seu responsável"),
          otherwise: () => yup.string().notRequired(),
        })
        .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido")
        .test("cpf", "CPF inválido", (value) => validateCPF(value || ""))
        .test(
          "cpf",
          "O CPF do representante legal deve ser diferente do seu CPF",
          (value) => value !== currentData?.cpf
        ), // eslint-disable-line
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

  function handleForm(data: LegalGuardianDTO) {
    updateData!(data);
  }
  return (
    <form
      onSubmit={handleSubmit(handleForm)}
      className="w-full flex flex-col gap-4 md:gap-2 mt-8 mb-16"
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
        defaultValue={phone}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => {
          const value = phoneMask(e.target.value);
          setPhone(value);
          setValue("phone", value);
        }}
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
            onChange={(e: any) => setValue("uf", e.value)}
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
