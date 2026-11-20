/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import ControlCalendar from "@/components/atoms/controlCalendar";
import { OptionsSelect } from "@/components/ui/options-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FormLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { optionsGender, stateOptions } from "@/pages/register/data";
import { UserMe } from "@/types/user/userMe";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface AccountFormProps {
  update: (data: any, onSuccess?: () => void, onError?: () => void) => void;
  userAccount: UserMe;
  hasImageChange?: boolean;
  /** Avisa quando há (ou deixa de haver) mudança sem salvar — o ponto no menu do perfil. */
  onChangesChange?: (temMudancas: boolean) => void;
}

export function AccountForm({
  update,
  userAccount,
  hasImageChange = false,
  onChangesChange,
}: AccountFormProps) {
  const [isCheckboxChecked, setIsCheckboxChecked] = useState<boolean>(
    userAccount.useSocialName
  );
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  useEffect(() => {
    onChangesChange?.(hasChanges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasChanges]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const schema = yup
    .object()
    .shape({
      firstName: yup
        .string()
        .default(userAccount?.firstName)
        .required("Por favor, preencha seu nome"),
      lastName: yup
        .string()
        .default(userAccount?.lastName)
        .required("Por favor, preencha seu sobrenome"),
      socialName: yup.string().default(userAccount?.socialName).nullable(),
      useSocialName: yup.boolean().default(userAccount?.useSocialName),
      gender: yup.number().required().default(userAccount?.gender),
      phone: yup
        .string()
        .required("campo obrigatório")
        .default(userAccount?.phone),
      birthday: yup
        .string()
        .required("Por favor, insira uma data de nascimento")
        .default(userAccount?.birthday),
      state: yup
        .string()
        .required("Campo Obrigatório")
        .default(userAccount?.state),
      city: yup
        .string()
        .required("Por favor, preencha sua cidade")
        .default(userAccount?.city),
      about: yup
        .string()
        .required("Fale um pouco sobre você")
        .default(userAccount?.about)
        .nullable(),
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

  useEffect(() => {
    register("firstName");
    register("lastName");
    register("socialName");
    register("birthday");
    register("state");
    register("city");
    register("about");
  }, [register]);

  // Função para detectar mudanças nos campos
  const checkForChanges = () => {
    const watchedValues = watch();
    const originalValues = {
      firstName: userAccount?.firstName,
      lastName: userAccount?.lastName,
      socialName: userAccount?.socialName,
      birthday: userAccount?.birthday,
      state: userAccount?.state,
      city: userAccount?.city,
      about: userAccount?.about,
      gender: userAccount?.gender,
      phone: userAccount?.phone,
      useSocialName: userAccount?.useSocialName,
    };

    const hasFormChanges = Object.keys(watchedValues).some((key) => {
      const watchedValue = watchedValues[key as keyof typeof watchedValues];
      const originalValue = originalValues[key as keyof typeof originalValues];

      // Tratamento especial para data de nascimento
      if (key === "birthday" && watchedValue) {
        const watchedDate = new Date(
          watchedValue as string | number | Date
        ).toISOString();
        return watchedDate !== originalValue;
      }

      /*
        ⚠️ Campo ainda não preenchido (undefined) não é mudança: na primeira
        checagem, ao montar, os valores ainda não chegaram ao formulário e
        "Isabela" contra undefined deixava o "Salvar" habilitado sem nada
        editado (e o ponto de "não salvo" do Meu perfil aceso).
      */
      if (watchedValue === undefined) return false;
      return watchedValue !== originalValue;
    });

    const hasCheckboxChanges = isCheckboxChecked !== userAccount?.useSocialName;

    setHasChanges(hasFormChanges || hasCheckboxChanges || hasImageChange);
  };

  // Monitorar mudanças nos campos
  useEffect(() => {
    const subscription = watch(() => {
      checkForChanges();
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, isCheckboxChecked, userAccount, hasImageChange]);

  // Monitorar mudanças na imagem especificamente
  useEffect(() => {
    checkForChanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasImageChange]);

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit((data: any) => {
          setIsSaving(true);
          update(
            {
              ...data,
              useSocialName: isCheckboxChecked,
              birthday: new Date(data.birthday).toISOString(),
            },
            () => {
              // Resetar estado de mudanças após salvamento bem-sucedido
              setHasChanges(false);
              setIsSaving(false);
            },
            () => {
              // Resetar estado de loading em caso de erro
              setIsSaving(false);
            }
          );
        })}
        noValidate
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
      >
        <FormLegend className="col-span-1 md:col-span-2 lg:col-span-3" />
        <Field label="Nome" required error={errors.firstName?.message}>
          <Input
            id="firstName"
            type="text"
            autoComplete="given-name"
            defaultValue={userAccount?.firstName}
            onChange={(e) => setValue("firstName", e.target.value)}
          />
        </Field>
        <Field label="Sobrenome" required error={errors.lastName?.message}>
          <Input
            id="lastName"
            type="text"
            autoComplete="family-name"
            defaultValue={userAccount?.lastName}
            onChange={(e) => setValue("lastName", e.target.value)}
          />
        </Field>
        <Field label="Gênero" error={errors.gender?.message}>
          <OptionsSelect
            id="gender"
            options={optionsGender}
            value={watch("gender") ?? userAccount?.gender}
            onValueChange={(valor) => setValue("gender", valor)}
          />
        </Field>
        <div className="flex items-center gap-3 p-4 bg-page rounded-lg border border-border h-16">
          <Checkbox
            className="h-5 w-5 border-input border-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-white data-[state=checked]:text-success"
            checked={isCheckboxChecked}
            id="useSocialName"
            onCheckedChange={(ischeck) => {
              setIsCheckboxChecked(ischeck as boolean);
            }}
          />
          <label
            htmlFor="useSocialName"
            className="text-body font-medium text-foreground cursor-pointer select-none"
          >
            Desejo usar um nome social
          </label>
        </div>
        <div className="col-span-1 space-y-4">
          <Field label="Nome Social" error={errors.socialName?.message}>
            <Input
              id="socialName"
              type="text"
              defaultValue={userAccount?.socialName}
              disabled={!isCheckboxChecked}
              onChange={(e) => setValue("socialName", e.target.value)}
            />
          </Field>
        </div>
        <ControlCalendar
          control={control}
          label="Data de Nascimento"
          value={new Date(userAccount?.birthday)}
        />
        <Field label="Telefone" required error={errors.phone?.message}>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={userAccount?.phone}
            onChange={(e) => setValue("phone", e.target.value)}
          />
        </Field>
        <Field label="Cidade" required error={errors.city?.message}>
          <Input
            id="city"
            type="text"
            autoComplete="address-level2"
            defaultValue={userAccount?.city}
            onChange={(e) => setValue("city", e.target.value)}
          />
        </Field>
        <Field label="Estado" required error={errors.state?.message}>
          <OptionsSelect
            id="state"
            options={stateOptions}
            value={watch("state") ?? userAccount?.state}
            onValueChange={(valor) => setValue("state", valor)}
          />
        </Field>
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <Field label="Sobre" required error={errors.about?.message}>
            <Textarea
              id="about"
              rows={5}
              defaultValue={userAccount?.about ?? undefined}
              onChange={(e) => setValue("about", e.target.value)}
            />
          </Field>
        </div>
        {/* Botão de salvar */}
        <div className="flex flex-col md:flex-row justify-between w-full col-span-1 md:col-span-2 lg:col-span-3">
          <div className="w-full max-w-md">
            <Button
              variant={hasChanges ? "contained" : "outlined"}
              disabled={!hasChanges || isSaving}
              className="transition-all duration-300 w-full"
              type="submit"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </div>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
