import { Button } from "@/components/ui/button";
import { SelectOpcoes } from "@/components/formulario/select-opcoes";
import { Field, FormLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  LegalGuardianDTO,
  StudentInscriptionDTO,
} from "@/dtos/student/studentInscriptionDTO";
import { stateOptions } from "@/pages/register/data";
import { phoneMask } from "@/utils/phoneMask";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { validateCPF } from "validations-br";
import * as yup from "yup";
import { EachStepProps } from "..";
import { parentescoOptions } from "../data";

interface PartnerPrepInscriptionStep3Props extends EachStepProps {
  isMinor: boolean;
  updateData?: (data: LegalGuardianDTO) => void;
}

export function PartnerPrepInscriptionStep3({
  description,
  updateData,
  currentData,
  handleBack,
  isMinor,
}: PartnerPrepInscriptionStep3Props) {
  const [phone, setPhone] = useState<string>(
    phoneMask(currentData?.legalGuardian?.phone) || ""
  );
  const [fRelationOther, setFRelationOther] = useState<boolean>(false);
  const [cpf, setCPF] = useState<string>(currentData?.legalGuardian?.cpf || "");

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
      family_relationship: yup
        .string()
        .default(currentData?.legalGuardian?.family_relationship)
        .when([], {
          is: () => isMinor,
          then: () =>
            yup
              .string()
              .required("Por favor, preencha o vinculo com o guardião legal"),
          otherwise: () => yup.string().notRequired(),
        }),
      family_relationship_input: yup.string().when([], {
        is: () => fRelationOther,
        then: () =>
          yup
            .string()
            .required("Por favor, preencha o vinculo com o guardião legal"),
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
          is: (value: string) => isMinor && value && value.length > 0,
          then: () => yup.string().required("Requerido"),
          otherwise: () => yup.string().notRequired(),
        }),
      cpf: yup
        .string()
        .default(currentData?.legalGuardian?.cpf)
        .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido")
        .test("cpf", "CPF inválido", (value) => validateCPF(value || ""))
        .test(
          "cpf",
          "O CPF do representante legal deve ser diferente do seu CPF",
          (value) => value !== currentData?.cpf
        )
        .test("cpf", "Por favor, preencha o CPF do responsável", () => isMinor),
    })
    .required();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    register("fullName");
    register("family_relationship");
    register("phone");
    register("rg");
    register("uf");
    register("cpf");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentData) {
      setValue("fullName", currentData?.legalGuardian?.fullName);
      setValue(
        "family_relationship",
        currentData?.legalGuardian?.family_relationship
      );
      setValue("phone", phoneMask(currentData?.legalGuardian?.phone));
      setValue("rg", currentData?.legalGuardian?.rg);
      setValue("uf", currentData?.legalGuardian?.uf);
      setValue("cpf", currentData?.legalGuardian?.cpf);
    }
  }, [currentData]);

  function handleForm(data: LegalGuardianDTO) {
    if (fRelationOther) {
      data.family_relationship = getValues("family_relationship_input");
    }
    if (data.rg?.length === 0) {
      data.uf = undefined;
    }
    updateData!(data);
  }

  function handleBackStep() {
    handleBack!({
      ...currentData,
      legalGuardian: {
        fullName: getValues("fullName"),
        family_relationship: getValues("family_relationship"),
        phone: getValues("phone"),
        rg: getValues("rg"),
        uf: getValues("uf"),
        cpf: getValues("cpf"),
      },
    } as Partial<StudentInscriptionDTO>);
  }

  return (
    <form
      onSubmit={handleSubmit(handleForm)}
      noValidate
      className="w-full flex flex-col gap-4 md:gap-2 mt-4 md:mt-8 mb-8 md:mb-16"
    >
      <p className="text-body text-foreground mb-6 text-center">{description}</p>
      <FormLegend />
      <Field label="Nome Completo Responsável" required error={errors.fullName?.message}>
        <Input
          id="fullName"
          type="text"
          autoComplete="off"
          defaultValue={currentData?.legalGuardian?.fullName}
          onChange={(e) => setValue("fullName", e.target.value)}
        />
      </Field>
      <Field label="Parentesco" required error={errors.family_relationship?.message}>
        <SelectOpcoes
          id="family_relationship"
          options={parentescoOptions.map((parentesco) => ({
            label: parentesco,
            value: parentesco,
          }))}
          value={
            watch("family_relationship") ??
            currentData?.legalGuardian?.family_relationship
          }
          onValueChange={(value) => {
            setValue("family_relationship", value);
            setFRelationOther(value === "Outro");
            if (value !== "Outro") {
              setValue("family_relationship_input", undefined);
            }
          }}
        />
      </Field>
      {fRelationOther && (
        <Field
          label="Parentesco"
          required
          error={errors.family_relationship_input?.message}
        >
          <Input
            id="family_relationship_input"
            type="text"
            onChange={(e) => {
              setValue("family_relationship_input", e.target.value);
            }}
          />
        </Field>
      )}
      <Field label="Telefone do Responsável" required error={errors.phone?.message}>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => {
            const value = phoneMask(e.target.value);
            setPhone(value);
            setValue("phone", value);
          }}
        />
      </Field>
      <div className="flex gap-4">
        <div className="flex-1">
          <Field label="RG do Responsável" error={errors.rg?.message}>
            <Input
              id="rg"
              type="text"
              defaultValue={currentData?.legalGuardian?.rg}
              onChange={(e) => setValue("rg", e.target.value)}
            />
          </Field>
        </div>
        <div className="w-24">
          <Field label="UF" error={errors.uf?.message}>
            <SelectOpcoes
              id="uf"
              options={stateOptions.map((state) => ({
                label: state.value as string,
                value: state.value as string,
              }))}
              value={watch("uf") ?? currentData?.legalGuardian?.uf}
              onValueChange={(value) => setValue("uf", value)}
            />
          </Field>
        </div>
      </div>
      <Field label="CPF do responsável" required error={errors.cpf?.message}>
        <Input
          id="cpf"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={cpf}
          onChange={(e) => handleCPFChange(e.target.value)}
        />
      </Field>
      <div className="flex flex-col-reverse sm:flex-row gap-4">
        <Button className="w-full" variant="primary" size="lg" type="button" onClick={handleBackStep}>
          Voltar
        </Button>
        <Button className="w-full" variant="primary" size="lg" type="submit">Continuar</Button>
      </div>
    </form>
  );
}
