/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import ControlCalendar from "@/components/atoms/controlCalendar";
import Button from "@/components/molecules/button";
import { Checkbox } from "@/components/ui/checkbox";
import { optionsGender, stateOptions } from "@/pages/register/data";
import { UserMe } from "@/types/user/userMe";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { InputFactory } from "../inputFactory";

interface AccountFormProps {
  update: (data: any) => void;
  userAccount: UserMe;
}

export function AccountForm({ update, userAccount }: AccountFormProps) {
  const [isCheckboxChecked, setIsCheckboxChecked] = useState<boolean>(
    userAccount.useSocialName
  );

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

  return (
    <form
      onSubmit={handleSubmit((data: any) => {
        console.log(data);
        update({
          ...data,
          useSocialName: isCheckboxChecked,
          birthday: new Date(data.birthday).toISOString(),
        });
      })}
      className="grid grid-cols-1 sm:grid-cols-2 gap-5 px-4"
    >
      <InputFactory
        id="firstName"
        label="Nome"
        type="text"
        defaultValue={userAccount?.firstName}
        error={errors.firstName}
        onChange={(e: any) => setValue("firstName", e.target.value)}
      />
      <div className="w-full relative">
        <div className="w-fit absolute -top-7 right-2 gap-2 flex">
          <Checkbox
            className="h-5 w-5 border-grey border-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-white data-[state=checked]:text-green2"
            checked={isCheckboxChecked}
            id="useSocialName"
            onCheckedChange={(ischeck) => {
              setIsCheckboxChecked(ischeck as boolean);
            }}
          />
          <span>Desejo usar um nome social</span>
        </div>
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
        options={optionsGender}
        error={errors.gender}
        onChange={(e: any) => setValue("gender", e.target.value)}
      />
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
        options={stateOptions}
        error={errors.state}
        onChange={(e: any) => setValue("state", e.target.value)}
      />
      <div className="col-span-1 sm:col-span-2">
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
      <Button type="submit">Salvar</Button>
    </form>
  );
}
