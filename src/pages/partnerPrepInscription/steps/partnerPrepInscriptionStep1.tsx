import { Button } from "@/components/ui/button";
import { OptionsSelect } from "@/components/ui/options-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FormLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { StudentInscriptionDTO } from "@/dtos/student/studentInscriptionDTO";
import {
  linkSocialName,
  socialNameCheckbox,
  stateOptions,
} from "@/pages/register/data";
import { phoneMask } from "@/utils/phoneMask";
import { yupResolver } from "@hookform/resolvers/yup";
import { DatePicker } from "@/components/ui/date-picker";
import { paraDataValida } from "@/lib/datasBr";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { validateCPF } from "validations-br";
import * as yup from "yup";
import { EachStepProps } from "..";

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
      noValidate
      className="w-full flex flex-col gap-4 md:gap-2 mt-4 md:mt-8 mb-8 md:mb-16"
    >
      <p className="text-body text-foreground mb-6 text-center">{description}</p>
      <FormLegend />
      <Field label="Nome" required maxLength={50} error={errors.firstName?.message}>
        <Input
          id="firstName"
          type="text"
          autoComplete="given-name"
          defaultValue={currentData?.firstName}
          onChange={(e) => setValue("firstName", e.target.value)}
        />
      </Field>
      <Field label="Sobrenome" required maxLength={100} error={errors.lastName?.message}>
        <Input
          id="lastName"
          type="text"
          autoComplete="family-name"
          defaultValue={currentData?.lastName}
          onChange={(e) => setValue("lastName", e.target.value)}
        />
      </Field>
      <Field label="Nome Social" maxLength={50} error={errors.socialName?.message}>
        <Input
          id="socialName"
          type="text"
          defaultValue={currentData?.socialName}
          disabled={!isCheckboxChecked}
          onChange={(e) => setValue("socialName", e.target.value)}
        />
      </Field>
      <div className="flex flex-col w-full items-start justify-start">
        <div>
          <Checkbox
            id="socialNameCheckbox"
            label="Desejo utilizar o Nome Social"
            defaultChecked={!!currentData?.socialName}
            onCheckedChange={(marcado) => setIsCheckboxChecked(marcado === true)}
          />
        </div>
        <div className="text-body text-muted-foreground">
          <span className="text-body font-extrabold pb-2 text-muted-foreground"></span>
          {socialNameCheckbox}{" "}
          <a
            href={linkSocialName}
            target="_blank"
            className="text-primary underline hover:text-primary/80 focus:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Saiba mais aqui.
          </a>
        </div>
      </div>
      <span className="text-caption text-muted-foreground font-semibold mb-4">
        Esta é uma pré-visualização do nome que será utilizado na plataforma:{" "}
        {getDisplayName()}
      </span>
      <Field label="Email">
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          disabled
          value={currentData?.email}
          onChange={(e) => setValue("email", e.target.value)}
        />
      </Field>
      <Field label="WhatsApp" required error={errors.whatsapp?.message}>
        <Input
          id="whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={whatsapp}
          onChange={(e) => {
            const value = phoneMask(e.target.value);
            setWhatsapp(value);
            setValue("whatsapp", value);
          }}
        />
      </Field>
      <Field
        label="Telefone para Emergências"
        required
        error={errors.urgencyPhone?.message}
      >
        <Input
          id="urgencyPhone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => {
            const value = phoneMask(e.target.value);
            setPhone(value);
            setValue("urgencyPhone", value);
          }}
        />
      </Field>
      <Controller
        name="birthday"
        control={control}
        defaultValue={currentData?.birthday || new Date()}
        render={({ field }) => (
          <Field label="Data de Nascimento" required error={errors.birthday?.message}>
            <DatePicker
              value={paraDataValida(field.value)}
              onChange={field.onChange}
              captionLayout="dropdown"
              startMonth={new Date(1900, 0)}
              endMonth={new Date()}
            />
          </Field>
        )}
      />
      <div className="flex gap-4">
        <div className="flex-1">
          <Field label="RG" maxLength={15} error={errors.rg?.message}>
            <Input
              id="rg"
              type="text"
              defaultValue={currentData?.rg}
              onChange={(e) => setValue("rg", e.target.value)}
            />
          </Field>
        </div>
        <div className="w-24">
          <Field label="UF" error={errors.uf?.message}>
            <OptionsSelect
              id="uf"
              options={stateOptions.map((state) => ({
                label: state.value as string,
                value: state.value as string,
              }))}
              value={watch("uf") ?? currentData?.uf}
              onValueChange={(valor) => setValue("uf", valor)}
            />
          </Field>
        </div>
      </div>

      <Field label="CPF" required error={errors.cpf?.message}>
        <Input
          id="cpf"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={cpf}
          onChange={(e) => handleCPFChange(e.target.value)}
        />
      </Field>
      <Button className="w-full" variant="primary" size="lg" type="submit">Continuar</Button>
    </form>
  );
}
