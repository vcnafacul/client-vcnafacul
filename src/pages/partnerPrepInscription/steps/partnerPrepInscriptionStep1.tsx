/* eslint-disable @typescript-eslint/no-explicit-any */
import Text from "@/components/atoms/text";
// import Button from "@/components/molecules/button";
import Button from "@/components/molecules/button";
import { InputFactory } from "@/components/organisms/inputFactory";
import { StudentInscriptionDTO } from "@/dtos/student/studentInscriptionDTO";
import {
  linkSocialName,
  socialNameCheckbox,
  stateOptions,
} from "@/pages/register/data";
import { phoneMask } from "@/utils/phoneMask";
import { yupResolver } from "@hookform/resolvers/yup";
import { addLocale } from "primereact/api";
import { Calendar } from "primereact/calendar";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { validateCPF } from "validations-br";
import * as yup from "yup";
import { EachStepProps } from "..";
import { ptBr } from "../data";
import "./styles.css";

addLocale("pt-br", { ...ptBr["pt-br"] });

interface PartnerPrepInscriptionStep1Props extends EachStepProps {
  updateData?: (data: Partial<StudentInscriptionDTO>) => void;
}

export function PartnerPrepInscriptionStep1({
  description,
  updateData,
  currentData,
}: PartnerPrepInscriptionStep1Props) {
  const [cpf, setCPF] = useState<string>(currentData?.cpf || "");
  const [isCheckboxChecked, setIsCheckboxChecked] = useState<boolean>(
    currentData?.socialName !== ""
  );

  const [whatsapp, setWhatsapp] = useState<string>(
    phoneMask(currentData?.whatsapp) || ""
  );
  const [phone, setPhone] = useState<string>(
    phoneMask(currentData?.urgencyPhone) || ""
  );

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
      socialName: yup.string().default(currentData?.socialName || ""),
      email: yup
        .string()
        .email()
        .default(currentData?.email)
        .required("Por favor, preencha o seu email"),
      whatsapp: yup
        .string()
        .default(phoneMask(currentData?.whatsapp))
        .required("Por favor, preencha o seu whatsapp")
        .min(11, "Número inválido"),
      urgencyPhone: yup
        .string()
        .default(phoneMask(currentData?.urgencyPhone))
        .test(
          "urgencyPhone",
          "O Telefone de emergência não pode ser igual ao whatsapp",
          (value) => value !== whatsapp
        ),
      birthday: yup
        .date()
        .default(
          currentData?.birthday ? new Date(currentData?.birthday) : new Date()
        )
        .required("Por favor, preencha a sua data de nascimento"),
      rg: yup.string().default(currentData?.rg),
      uf: yup
        .string()
        .default(currentData?.uf)
        .when("rg", {
          is: (value: string) => !value || value.length === 0,
          then: () => yup.string().notRequired(),
          otherwise: () => yup.string().required("Requerido"),
        }),
      cpf: yup
        .string()
        .default(currentData?.cpf)
        .required("Por favor, preencha o seu CPF")
        .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido")
        .test("cpf", "CPF inválido", (value) => validateCPF(value)),
    })
    .required();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const firstName = watch("firstName");
  const socialName = watch("socialName");
  const lastName = watch("lastName");

  const getDisplayName = () => {
    const nameToUse = isCheckboxChecked && socialName ? socialName : firstName;
    return `${nameToUse} ${lastName}`.trim();
  };

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

  useEffect(() => {
    if (currentData) {
      setValue("firstName", currentData.firstName || "");
      setValue("lastName", currentData.lastName || "");
      setValue("socialName", currentData.socialName || "");
      setValue("email", currentData.email || "");
      setValue("whatsapp", phoneMask(currentData.whatsapp) || "");
      setValue("urgencyPhone", phoneMask(currentData.urgencyPhone) || "");
      setValue("birthday", currentData.birthday || new Date());
      setValue("rg", currentData.rg || "");
      setValue("cpf", currentData.cpf || "");
      setValue("uf", currentData?.uf || "");
    }
  }, [currentData]);

  function handleForm(data: Partial<StudentInscriptionDTO>) {
    if (!isCheckboxChecked) {
      data.socialName = "";
    }
    if (data.rg?.length === 0) {
      data.uf = undefined;
    }
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
         
        onChange={(e: any) => setValue("firstName", e.target.value)}
        maxLength={50}
      />
      <InputFactory
        id="lastName"
        label="Sobrenome*"
        type="text"
        error={errors.lastName}
        defaultValue={currentData?.lastName}
         
        onChange={(e: any) => setValue("lastName", e.target.value)}
        maxLength={100}
      />
      <InputFactory
        id="socialName"
        label="Nome Social"
        type="text"
        defaultValue={currentData?.socialName}
        error={errors.socialName}
         
        onChange={(e: any) => setValue("socialName", e.target.value)}
        maxLength={50}
        disabled={!isCheckboxChecked}
      />
      <div className="flex flex-col w-full items-start justify-start">
        <div>
          <InputFactory
            id="socialNameCheckbox"
            label=""
            type="checkbox"
            checkboxs={["Desejo utilizar o Nome Social"]}
            defaultValue={
              currentData?.socialName ? ["Desejo utilizar o Nome Social"] : []
            }
            error={errors.socialName}
            onCheckedChange={(values: string[]) => {
              setIsCheckboxChecked(values.length > 0);
            }}
          />
        </div>
        <div className="text-sm text-gray-500">
          <span className="text-sm font-extrabold pb-2 text-gray-500"></span>
          {socialNameCheckbox}{" "}
          <a
            href={linkSocialName}
            target="_blank"
            className="text-blue-600 underline hover:text-blue-800 focus:outline focus:ring-2 focus:ring-blue-500"
          >
            Saiba mais aqui.
          </a>
        </div>
      </div>
      <span className="text-xs text-grey font-semibold mb-4">
        Esta é uma pré-visualização do nome que será utilizado na plataforma:{" "}
        {getDisplayName()}
      </span>
      <InputFactory
        id="email"
        label="Email*"
        type="email"
        disabled={true}
        value={currentData?.email}
         
        onChange={(e: any) => setValue("email", e.target.value)}
        className="bg-gray-200 tracking-wider"
        maxLength={100}
      />
      <InputFactory
        id="whatsapp"
        label="WhatsApp*"
        type="text"
        error={errors.whatsapp}
        value={whatsapp}
         
        onChange={(e: any) => {
          const value = phoneMask(e.target.value);
          setWhatsapp(value);
          setValue("whatsapp", value);
        }}
      />
      <InputFactory
        id="urgencyPhone"
        label="Telefone para Emergências*"
        type="text"
        error={errors.urgencyPhone}
        value={phone}
         
        onChange={(e: any) => {
          const value = phoneMask(e.target.value);
          setPhone(value);
          setValue("urgencyPhone", value);
        }}
      />
      <div className="card flex justify-content-center h-16 border hover:border-orange pt-4 pl-4 rounded-md relative mb-4 row-start-3 col-start-1 z-10">
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
              className="focus-visible:ring-none w-full h-14 bg-transparent"
              locale="pt-br"
              showIcon
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
            label="RG"
            type="text"
            error={errors.rg}
            defaultValue={currentData?.rg}
             
            onChange={(e: any) => setValue("rg", e.target.value)}
            className="w-full flex flex-1"
            maxLength={15}
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
            error={errors.uf}
            defaultValue={currentData?.uf}
            value={currentData?.uf}
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
         
        onChange={(e: any) => handleCPFChange(e.target.value)}
      />
      <Button type="submit">Continuar</Button>
    </form>
  );
}
