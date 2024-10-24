/* eslint-disable @typescript-eslint/no-explicit-any */
import Text from "@/components/atoms/text";
// import Button from "@/components/molecules/button";
import Button from "@/components/molecules/button";
import { InputFactory } from "@/components/organisms/inputFactory";
import { StudentInscriptionDTO } from "@/dtos/student/studentInscriptionDTO";
import { stateOptions } from "@/pages/register/data";
import { yupResolver } from "@hookform/resolvers/yup";
import { addLocale } from "primereact/api";
import { Calendar } from "primereact/calendar";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { EachStepProps } from "..";
import { ptBr } from "../data";

addLocale("pt-br", { ...ptBr["pt-br"] });

export function PartnerPrepInscriptionStep1({
  description,
  updateData,
  currentData,
}: EachStepProps) {
  const [cpf, setCPF] = useState<string>(currentData?.cpf || "");
  const schema = yup
    .object()
    .shape({
      firstName: yup
        .string()
        .default(currentData?.firstName)
        .required("Por favor, preencha o seu nome"),
      lastName: yup
        .string()
        .default(currentData?.lastName)
        .required("Por favor, preencha o seu sobrenome"),
      socialName: yup.string().default(currentData?.socialName),
      email: yup
        .string()
        .email()
        .default(currentData?.email)
        .required("Por favor, preencha o seu email"),
      whatsapp: yup
        .string()
        .default(currentData?.whatsapp)
        .required("Por favor, preencha o seu whatsapp"),
      urgencyPhone: yup
        .string()
        .default(currentData?.urgencyPhone)
        .required("Por favor, preencha um telefone de emergência"),
      birthday: yup
        .date()
        .default(
          currentData?.birthday ? new Date(currentData?.birthday) : new Date()
        )
        .required("Por favor, preencha a sua data de nascimento"),
      uf: yup.string().default(currentData?.uf).required("Requerido"),
      rg: yup
        .string()
        .default(currentData?.rg)
        .required("Por favor, preencha o seu RG"),
      cpf: yup
        .string()
        .default(currentData?.cpf)
        .required("Por favor, preencha o seu CPF")
        .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
    })
    .required();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Função para aplicar máscara de CPF
  const handleCPFChange = (cpf: string) => {
    let value = cpf.replace(/\D/g, ""); // Remove tudo que não for número

    // Aplica a máscara de CPF: 123.456.789-00
    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{0,3})$/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{0,3})$/, "$1.$2");
    }
    setCPF(value);
    setValue("cpf", value); // Atualiza o valor no react-hook-form
  };

  useEffect(() => {
    register("firstName");
    register("lastName");
    register("socialName");
    register("email");
    register("whatsapp");
    register("birthday");
    register("rg");
    register("cpf");
    register("uf");
    register("urgencyPhone");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleForm(data: Partial<StudentInscriptionDTO>) {
    updateData!(data);
  }
  return (
    <form
      onSubmit={handleSubmit(handleForm)}
      className="w-full flex flex-col gap-4 sm:gap-4 md:gap-2 mt-8 mb-16"
    >
      <Text size="tertiary">{description}</Text>
      <InputFactory
        id="firstName"
        label="Nome*"
        type="text"
        error={errors.firstName}
        defaultValue={currentData?.firstName}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("firstName", e.target.value)}
      />
      <InputFactory
        id="lastName"
        label="Sobrenome*"
        type="text"
        error={errors.lastName}
        defaultValue={currentData?.lastName}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("lastName", e.target.value)}
      />
      <InputFactory
        id="socialName"
        label="Nome Social"
        type="text"
        defaultValue={currentData?.socialName}
        error={errors.socialName}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("socialName", e.target.value)}
      />
      <InputFactory
        id="email"
        label="Email*"
        type="email"
        disabled={true}
        value={currentData?.email}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("email", e.target.value)}
        className="bg-gray-200 tracking-wider"
      />
      <InputFactory
        id="whatsapp"
        label="WhatsApp*"
        type="text"
        error={errors.whatsapp}
        defaultValue={currentData?.whatsapp}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("whatsapp", e.target.value)}
      />
      <InputFactory
        id="urgencyPhone"
        label="Telefone para Emergências*"
        type="text"
        error={errors.urgencyPhone}
        defaultValue={currentData?.urgencyPhone}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("urgencyPhone", e.target.value)}
      />
      <div className="card flex justify-content-center h-16 border hover:border-orange pt-4 pl-4 rounded-md relative mb-4  row-start-3 col-start-1">
        <label
          className="absolute top-1 left-3 text-xs text-grey font-semibold"
          htmlFor="date"
        >
          Data de Nascimento*
        </label>
        <Controller
          name="birthday"
          control={control}
          defaultValue={currentData?.birthday || new Date()}
          render={({ field }) => (
            <Calendar
              id="birthday"
              dateFormat="dd/mm/yy"
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              selectionMode="single"
              className="focus-visible:ring-orange"
              readOnlyInput
              hideOnRangeSelection
              locale="pt-br"
            />
          )}
        />
        {errors.birthday && (
          <p className="absolute text-red text-xs mt-1 -bottom-5 left-0">
            {errors.birthday.message}
          </p>
        )}
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <InputFactory
            id="rg"
            label="RG*"
            type="text"
            error={errors.rg}
            defaultValue={currentData?.rg}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e: any) => setValue("rg", e.target.value)}
            className="w-full flex flex-1 "
          />
        </div>
        <div className="w-24">
          <InputFactory
            id="uf"
            label="UF*"
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
            error={errors.uf}
            defaultValue={currentData?.uf}
            onChange={(e: any) => {
              setValue("uf", e.value);
            }}
          />
        </div>
      </div>

      <InputFactory
        id="cpf"
        label="CPF*"
        type="text"
        error={errors.cpf}
        value={cpf}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => handleCPFChange(e.target.value)}
      />
      <Button type="submit">Continuar</Button>
    </form>
  );
}
