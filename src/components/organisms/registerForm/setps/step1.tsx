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
import { Button } from "@/components/ui/button";
import { SenhaInput } from "@/components/formulario/senha-input";
import { Field, FormLegend } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface UseRegisterStep1 {
  email: string;
  password: string;
  password_confirmation: string;
}

interface Step1Props extends StepProps {
  /** Cadastro pelo convite: o email vem do convite e não se troca. */
  emailTravado?: string;
  updateData: (data: UserRegister) => void;
}

function Step1({ updateData, dataUser, emailTravado }: Step1Props) {
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
    if (emailTravado) data = { ...data, email: emailTravado };
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
    if (emailTravado) {
      setValue("email", emailTravado);
    } else if (dataUser.email) {
      setValue("email", dataUser.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue]);

  return (
    <form
      onSubmit={handleSubmit(continueRegister)}
      noValidate
      className="flex flex-col gap-4 w-full"
    >
      <FormLegend />
      {emailTravado ? (
        <p data-email-travado className="text-body">
          Email: <strong>{emailTravado}</strong>
        </p>
      ) : (
        <Field label="Email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e: any) => setValue("email", e.target.value)}
          />
        </Field>
      )}
      <Field label="Senha" required error={errors.password?.message}>
        <SenhaInput
          id="password"
          autoComplete="new-password"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setValue("password", e.target.value)}
        />
      </Field>
      <Field
        label="Confirmar Senha"
        required
        error={errors.password_confirmation?.message}
      >
        <SenhaInput
          id="password_confirmation"
          autoComplete="new-password"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setValue("password_confirmation", e.target.value)}
        />
      </Field>
      <div className="flex gap-4 w-full text-body justify-between">
        <div className="font-normal text-caption"> Sua senha deve conter:</div>
        <div className="flex flex-col sm:flex-row sm:gap-4">
          <div className="flex flex-col text-body items-end sm:items-start">
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
          <div className="flex flex-col text-body items-end sm:items-start">
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
      <Button className="w-full" variant="primary" size="lg" type="submit">Continuar</Button>
    </form>
  );
}

export default Step1;
