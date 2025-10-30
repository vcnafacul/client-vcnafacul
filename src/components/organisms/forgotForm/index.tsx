import { useToastAsync } from "@/hooks/useToastAsync";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LOGIN_PATH } from "../../../routes/path";
import { Forgot } from "../../../services/auth/forgot";
import Text from "../../atoms/text";
import { FormFieldInput } from "../../molecules/formField";
import FormSubmit from "../formSubmit";

export interface ForgotFormProps {
  title: string;
  subtitle: string;
  labelSubmit: string;
  formData: FormFieldInput[];
}

export function ForgotForm({
  title,
  subtitle,
  labelSubmit,
  formData,
}: ForgotFormProps) {
  const navigate = useNavigate();
  const executeAsync = useToastAsync();

  const [disabled, setDisabled] = useState<boolean>(false);

  const forgot = async (data: { email: string }) => {
    setDisabled(true);

    await executeAsync({
      action: async () => {
        return await Forgot(data.email.toLowerCase());
      },
      loadingMessage: "Enviando email de redefinição de senha...",
      successMessage: `Email de redefinição de senha enviado para ${data.email.toLowerCase()}`,
      errorMessage: "Erro ao enviar email de redefinição de senha",
      onSuccess: () => {
        navigate(LOGIN_PATH);
      },
      onError: () => {
        setDisabled(false);
      },
    });
  };

  return (
    <div className="w-full h-[calc(100vh-88px)] flex justify-start items-center flex-col mx-auto">
      <div className="mt-20 max-w-[500px] flex flex-col items-center">
        <Text size="secondary">{title}</Text>
        <Text size="quaternary" className="text-orange my-5">
          {subtitle}
        </Text>
        <FormSubmit
          className="w-full my-4 flex flex-col gap-4"
          formFields={formData}
          labelSubmit={labelSubmit}
          onSubmit={forgot}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
