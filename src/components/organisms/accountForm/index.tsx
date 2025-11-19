/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import ControlCalendar from "@/components/atoms/controlCalendar";
import { Checkbox } from "@/components/ui/checkbox";
import { optionsGender, stateOptions } from "@/pages/register/data";
import { UserMe } from "@/types/user/userMe";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { InputFactory } from "../inputFactory";

interface AccountFormProps {
  update: (data: any, onSuccess?: () => void, onError?: () => void) => void;
  userAccount: UserMe;
  hasImageChange?: boolean;
}

export function AccountForm({
  update,
  userAccount,
  hasImageChange = false,
}: AccountFormProps) {
  const [isCheckboxChecked, setIsCheckboxChecked] = useState<boolean>(
    userAccount.useSocialName
  );
  const [hasChanges, setHasChanges] = useState<boolean>(false);
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
      >
        <InputFactory
          id="firstName"
          label="Nome"
          type="text"
          defaultValue={userAccount?.firstName}
          error={errors.firstName}
          onChange={(e: any) => setValue("firstName", e.target.value)}
        />
        <InputFactory
          id="lastName"
          label="Sobrenome"
          type="text"
          defaultValue={userAccount?.lastName}
          error={errors.lastName}
          onChange={(e: any) => setValue("lastName", e.target.value)}
        />
        <InputFactory
          id="gender"
          label="Gênero"
          type="select"
          defaultValue={userAccount?.gender}
          value={userAccount?.gender}
          options={optionsGender}
          error={errors.gender}
          onChange={(e: any) => setValue("gender", e.target.value)}
        />
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 h-16">
          <Checkbox
            className="h-5 w-5 border-grey border-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-white data-[state=checked]:text-green2"
            checked={isCheckboxChecked}
            id="useSocialName"
            onCheckedChange={(ischeck) => {
              setIsCheckboxChecked(ischeck as boolean);
            }}
          />
          <label
            htmlFor="useSocialName"
            className="text-sm font-medium text-gray-700 cursor-pointer select-none"
          >
            Desejo usar um nome social
          </label>
        </div>
        <div className="col-span-1 space-y-4">
          <InputFactory
            id="socialName"
            label="Nome Social"
            type="text"
            defaultValue={userAccount?.socialName}
            disabled={!isCheckboxChecked}
            error={errors.socialName}
            onChange={(e: any) => setValue("socialName", e.target.value)}
          />
        </div>
        <ControlCalendar
          control={control}
          label="Data de Nascimento"
          value={new Date(userAccount?.birthday)}
        />
        <InputFactory
          id="phone"
          label="Telefone"
          type="text"
          defaultValue={userAccount?.phone}
          error={errors.phone}
          onChange={(e: any) => setValue("phone", e.target.value)}
        />
        <InputFactory
          id="city"
          label="Cidade"
          type="text"
          defaultValue={userAccount?.city}
          error={errors.city}
          onChange={(e: any) => setValue("city", e.target.value)}
        />
        <InputFactory
          id="state"
          label="Estado"
          type="select"
          defaultValue={userAccount?.state}
          value={userAccount?.state}
          options={stateOptions}
          error={errors.state}
          onChange={(e: any) => setValue("state", e.target.value)}
        />
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <InputFactory
            id="about"
            label="Sobre"
            type="textarea"
            defaultValue={userAccount?.about}
            options={stateOptions}
            error={errors.about}
            rows={5}
            onChange={(e: any) => setValue("about", e.target.value)}
          />
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
