import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useToastAsync } from "../../../hooks/useToastAsync";
import {
  lowercaseLetterRegex,
  specialCaracteresRegex,
  uppercaseLetterRegex,
} from "../../../pages/register/data";
import { LOGIN_PATH } from "../../../routes/path";
import { ResetPassword } from "../../../services/auth/resetPassword";
import SpanValidate from "../../atoms/spanValidate";
import Text from "../../atoms/text";
import Button from "../../molecules/button";
import FormField, { FormFieldInput } from "../../molecules/formField";

export interface ResetFormProps {
  title: string;
  subtitle: string;
  labelSubmit: string;
  formData: FormFieldInput[];
}

interface ResetFormTokenProps extends ResetFormProps {
  token: string;
}

export function ResetForm({
  title,
  subtitle,
  formData,
  token,
}: ResetFormTokenProps) {
  const navigate = useNavigate();
  const [disabled, setDisabled] = useState<boolean>(false);
  const executeAsync = useToastAsync();

  const schema = yup
    .object()
    .shape({
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
  } = useForm({
    resolver: yupResolver(schema),
  });

  const password = watch("password");

  const reset = async (data: {
    password: string;
    password_confirmation: string;
  }) => {
    setDisabled(true);

    await executeAsync({
      action: () => ResetPassword(data.password, token),
      loadingMessage: "Resetando senha...",
      successMessage: "Senha resetada com sucesso",
      errorMessage: (e) => e.message,
      onSuccess: () => navigate(LOGIN_PATH),
      onError: () => setDisabled(false),
    });
  };
  return (
    <div className="w-full h-[calc(100vh-88px)] flex justify-start items-center flex-col mx-auto">
      <div className="mt-20 max-w-[500px] flex flex-col items-center">
        <Text size="secondary">{title}</Text>
        <Text size="quaternary" className="text-orange my-5">
          {subtitle}
        </Text>
        <form onSubmit={handleSubmit(reset)} className="flex flex-col gap-4">
          <FormField
            register={register}
            id={formData[0].id}
            key={formData[0].id}
            label={formData[0].label}
            type={formData[0].type}
            visibility={formData[0].visibility}
          />
          <div className="flex gap-4 w-full text-sm">
            <div className="font-thin text-xs"> Sua senha deve conter:</div>
            <div className="flex flex-col text-sm">
              <SpanValidate
                valid={
                  password !== undefined && uppercaseLetterRegex.test(password)
                }
              >
                Letra Maiúscula
              </SpanValidate>
              <SpanValidate
                valid={
                  password !== undefined &&
                  specialCaracteresRegex.test(password)
                }
              >
                Caractere Especial
              </SpanValidate>
            </div>
            <div className="flex flex-col text-sm">
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
          <FormField
            register={register}
            id={formData[1].id}
            key={formData[1].id}
            label={formData[1].label}
            type={formData[0].type}
            error={errors["password_confirmation"]}
          />
          <Button disabled={disabled} type="submit">
            Continuar
          </Button>
        </form>
      </div>
    </div>
  );
}
