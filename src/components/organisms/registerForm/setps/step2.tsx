/* eslint-disable @typescript-eslint/no-explicit-any */
import ControlCalendar from "@/components/atoms/controlCalendar";
import { optionsGender, stateOptions } from "@/pages/register/data";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import { StepProps } from "..";
import { Gender } from "../../../../store/auth";
import { UserRegister } from "../../../../types/user/userRegister";
import Button from "../../../molecules/button";
import { InputFactory } from "../../inputFactory";

interface UseRegisterStep2 {
  firstName: string;
  lastName: string;
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
        .required("campo obrigatório"),
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
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const registerSubmit = (data: UseRegisterStep2) => {
    data.birthday = new Date(data.birthday).toISOString();
    const id = toast.loading("Cadastrando ... ");
    onRegister({ ...dataUser, ...(data as UserRegister) })
      .then(() => {
        toast.update(id, {
          render: "Cadastro realizado com sucesso",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        next();
      })
      .catch((error: Error) => {
        toast.update(id, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
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
      <InputFactory
        id="lastName"
        label="Sobrenome"
        type="text"
        error={errors.lastName}
        onChange={(e: any) => setValue("lastName", e.target.value)}
      />
      <InputFactory
        id="socialName"
        label="Nome Social"
        type="text"
        error={errors.socialName}
        onChange={(e: any) => setValue("socialName", e.target.value)}
      />
      <InputFactory
        id="gender"
        label="Gênero"
        type="select"
        options={optionsGender}
        error={errors.gender}
        onChange={(e: any) => setValue("gender", e.target.value)}
      />
      <ControlCalendar control={control} label="Data de Nascimento" />
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
            href="/Termos%20de%20Uso.pdf"
            target="_blank"
          >
            termos de uso
          </a>{" "}
          e{" "}
          <a
            className="font-black text-grey"
            onClick={(e) => e.stopPropagation()}
            href="/Pol%C3%ADtica%20de%20Privacidade.pdf"
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
