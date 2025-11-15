/* eslint-disable @typescript-eslint/no-explicit-any */
import ControlCalendar from "@/components/atoms/controlCalendar";
import { useToastAsync } from "@/hooks/useToastAsync";
import {
  linkSocialName,
  optionsGender,
  socialNameCheckbox,
  stateOptions,
} from "@/pages/register/data";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { StepProps } from "..";
import { Gender } from "../../../../store/auth";
import { UserRegister } from "../../../../types/user/userRegister";
import Button from "../../../molecules/button";
import { InputFactory } from "../../inputFactory";

interface UseRegisterStep2 {
  firstName: string;
  lastName: string;
  socialName?: string;
  phone: string;
  birthday: string;
  city: string;
  lgpd: NonNullable<boolean>;
  state: string;
  gender: Gender;
}

interface Step2Props extends StepProps {
  dataUser: UserRegister;
  next: () => void;
  back: () => void;
  onRegister: (data: UserRegister) => Promise<void>;
}

function Step2({ dataUser, next, back, onRegister }: Step2Props) {
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  const executeAsync = useToastAsync();

  const schema = yup
    .object()
    .shape({
      firstName: yup.string().required("Por favor, informe seu nome"),
      lastName: yup.string().required("Por favor, informe seu sobrenome"),
      socialName: yup.string(),
      phone: yup.string().required("campo obrigatório"),
      gender: yup.number().required(),
      birthday: yup
        .string()
        .nullable()
        .transform((curr, orig) => (orig === "" ? null : curr))
        .required("Campo obrigatório")
        .test("age", "Você deve ter no mínimo 14 anos", (value) => {
          if (!value) return false;
          const today = new Date();
          const birthDate = new Date(value);
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          const dayDiff = today.getDate() - birthDate.getDate();

          if (
            age > 14 ||
            (age === 14 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
          ) {
            return true;
          }
          return false;
        }),
      city: yup.string().required("campo obrigatório"),
      state: yup.string().required(),
      lgpd: yup
        .boolean()
        .oneOf([true], "Você deve aceitar os termos e políticas")
        .required("Por favor, confirmação necessária"),
    })
    .required();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      socialName: "",
      lastName: "",
    },
  });

  const firstName = watch("firstName");
  const socialName = watch("socialName");
  const lastName = watch("lastName");

  const getDisplayName = () => {
    const nameToUse = isCheckboxChecked && socialName ? socialName : firstName;
    return `${nameToUse} ${lastName}`.trim();
  };

  const registerSubmit = async (data: UseRegisterStep2) => {
    if (!isCheckboxChecked) {
      data.socialName = "";
    }
    data.birthday = new Date(data.birthday).toISOString();

    await executeAsync({
      action: () => onRegister({ ...dataUser, ...(data as UserRegister) }),
      loadingMessage: "Cadastrando ... ",
      successMessage: "Cadastro realizado com sucesso",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => next(),
    });
  };

  useEffect(() => {
    register("firstName");
    register("lastName");
    register("socialName");
    register("phone");
    register("gender");
    register("birthday");
    register("city");
    register("state");
    register("lgpd");
  }, []);

  return (
    <form
      onSubmit={handleSubmit(registerSubmit)}
      className="w-full flex flex-col gap-4"
    >
      <InputFactory
        id="firstName"
        label="Nome"
        type="text"
        error={errors.firstName}
        onChange={(e: any) => setValue("firstName", e.target.value)}
      />
      <div className="flex flex-col w-full items-start justify-start">
        <div>
          <InputFactory
            id="socialNameCheckbox"
            label=""
            type="checkbox"
            checkboxs={["Desejo utilizar o Nome Social"]}
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
      <InputFactory
        id="socialName"
        label="Nome Social"
        type="text"
        disabled={!isCheckboxChecked}
        error={errors.socialName}
        onChange={(e: any) => setValue("socialName", e.target.value)}
      />
      <InputFactory
        id="lastName"
        label="Sobrenome"
        type="text"
        error={errors.lastName}
        onChange={(e: any) => setValue("lastName", e.target.value)}
      />
      <span className="text-xs text-grey font-semibold mb-4">
        Esta é uma pré-visualização do nome que será utilizado na plataforma:{" "}
        {getDisplayName()}
      </span>
      <InputFactory
        id="gender"
        label="Gênero"
        type="select"
        options={optionsGender}
        error={errors.gender}
        onChange={(e: any) => setValue("gender", e.target.value)}
      />
      <ControlCalendar
        control={control}
        label="Data de Nascimento"
        error={errors.birthday}
      />
      <InputFactory
        id="phone"
        label="Telefone"
        type="text"
        error={errors.phone}
        onChange={(e: any) => setValue("phone", e.target.value)}
      />
      <InputFactory
        id="city"
        label="Cidade"
        type="text"
        error={errors.city}
        onChange={(e: any) => setValue("city", e.target.value)}
      />
      <InputFactory
        id="state"
        label="Estado"
        type="select"
        options={stateOptions}
        error={errors.state}
        onChange={(e: any) => setValue("state", e.target.value)}
      />
      <div className="flex w-full gap-2 justify-center my-2">
        <input type="checkbox" {...register("lgpd")} />
        <span>
          Eu li e aceito os{" "}
          <a
            className="font-black text-grey"
            onClick={(e) => e.stopPropagation()}
            href="/docs/Termos%20de%20Uso.pdf"
            target="_blank"
          >
            termos de uso
          </a>{" "}
          e{" "}
          <a
            className="font-black text-grey"
            onClick={(e) => e.stopPropagation()}
            href="/docs/Pol%C3%ADtica%20de%20Privacidade.pdf"
            target="_blank"
          >
            políticas de privacidade
          </a>
        </span>
      </div>
      <div className="text-red w-full text-center">
        {errors["lgpd"]?.message}
      </div>
      <div className="flex gap-4">
        <Button type="button" onClick={back}>
          Voltar
        </Button>
        <Button type="submit">Cadastrar</Button>
      </div>
    </form>
  );
}

export default Step2;
