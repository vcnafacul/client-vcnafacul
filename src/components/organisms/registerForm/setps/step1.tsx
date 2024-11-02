import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import { StepProps } from "..";
import {
  lowercaseLetterRegex,
  specialCaracteresRegex,
  uppercaseLetterRegex,
} from "../../../../pages/register/data";
import { validNewEmail } from "../../../../services/auth/validNewEmail";
import { UserRegister } from "../../../../types/user/userRegister";
import SpanValidate from "../../../atoms/spanValidate";
import Button from "../../../molecules/button";
import { InputFactory } from "../../inputFactory";

interface UseRegisterStep1 {
  email: string;
  password: string;
  password_confirmation: string;
}

interface Step1Props extends StepProps {
  updateData: (data: UserRegister) => void;
}

function Step1({ updateData, dataUser }: Step1Props) {
  const schema = yup
    .object()
    .shape({
      email: yup
        .string()
        .email()
        .required("Por favor, preencha um email valido"),
      password: yup
        .string()
        .required("Senha obrigatória")
        .min(8, "Senha muito curta, deve ter no mínimo 8 caracteres")
        .matches(
          lowercaseLetterRegex,
          "A senha precisa ter pelo menos uma letra minuscula"
        )
        .matches(
          uppercaseLetterRegex,
          "A senha precisa ter pelo menos uma letra maiuscula"
        )
        .matches(
          specialCaracteresRegex,
          "A senha precisa ter pelo menos um caracter especial"
        ),
      password_confirmation: yup
        .string()
        .required("Por favor, confirmação senha obrigatória")
        .oneOf([yup.ref("password")], "Senhas devem coincidir"),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const continueRegister = (data: UseRegisterStep1) => {
    validNewEmail(data.email)
      .then(() => {
        updateData(data as UserRegister);
      })
      .catch((error: Error) => {
        toast.info(error.message);
      });
  };

  const password = watch("password");

  useEffect(() => {
    register("email");
    register("password");
    register("password_confirmation");
  }, []);

  useEffect(() => {
    if (dataUser.email) {
      setValue("email", dataUser.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue]);

  return (
    <form
      onSubmit={handleSubmit(continueRegister)}
      className="flex flex-col gap-4 w-full"
    >
      <InputFactory
        id="email"
        label="Email"
        type="text"
        error={errors.email}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("email", e.target.value)}
      />
      <InputFactory
        id="password"
        label="Senha"
        type="password"
        error={errors.password}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("password", e.target.value)}
      />
      <InputFactory
        id="password_confirmation"
        label="Confirmar Senha"
        type="password"
        error={errors.password_confirmation}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(e: any) => setValue("password_confirmation", e.target.value)}
      />
      <div className="flex gap-4 w-full text-sm justify-between">
        <div className="font-thin text-xs"> Sua senha deve conter:</div>
        <div className="flex flex-col sm:flex-row sm:gap-4">
          <div className="flex flex-col text-sm items-end sm:items-start">
            <SpanValidate
              valid={
                password !== undefined && uppercaseLetterRegex.test(password)
              }
            >
              Letra Maiúscula
            </SpanValidate>
            <SpanValidate
              valid={
                password !== undefined && specialCaracteresRegex.test(password)
              }
            >
              Caractere Especial
            </SpanValidate>
          </div>
          <div className="flex flex-col text-sm items-end sm:items-start">
            <SpanValidate
              valid={
                password !== undefined && lowercaseLetterRegex.test(password)
              }
            >
              Letra Minúscula
            </SpanValidate>
            <SpanValidate
              valid={password !== undefined && password.trim().length >= 8}
            >
              Pelo menos 8 Caracteres
            </SpanValidate>
          </div>
        </div>
      </div>
      <Button type="submit">Continuar</Button>
    </form>
  );
}

export default Step1;
