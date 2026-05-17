/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { useToastAsync } from "../../../hooks/useToastAsync";
import { DASH } from "../../../routes/path";
import Login from "../../../services/auth/login";
import { useAuthStore } from "../../../store/auth";
import Text from "../../atoms/text";
import { FormFieldInput } from "../../molecules/formField";
import FormSubmit from "../formSubmit";

export interface LoginFormProps {
  title: string;
  subtitle: string;
  labelSubmit: string;
  formData: FormFieldInput[];
  onLogin?: (data: any) => void;
}

function LoginForm({
  title,
  subtitle,
  labelSubmit,
  formData,
  onLogin,
}: LoginFormProps) {
  const { doAuth } = useAuthStore();
  const navigate = useNavigate();
  const executeAsync = useToastAsync();

  const login = async (data: any) => {
    await executeAsync({
      action: () => Login(data.email.toLowerCase(), data.password),
      loadingMessage: "Entrando...",
      successMessage: "Login realizado com sucesso!",
      errorMessage: (e) => `Erro ao tentar fazer login - ${e.message}`,
      onSuccess: (res) => {
        doAuth(res);
        if (onLogin) onLogin(res);
        else navigate(DASH);
      },
    });
  };

  return (
    <div className="w-full flex justify-start items-center flex-col mx-auto">
      <div className="mt-20 max-w-[500px] flex flex-col items-center">
        <Text size="secondary">{title}</Text>
        <Text size="quaternary" className="text-orange my-5">
          {subtitle}
        </Text>
        <FormSubmit
          className="w-full my-4 flex flex-col gap-4"
          formFields={formData}
          labelSubmit={labelSubmit}
          onSubmit={login}
        />
      </div>
    </div>
  );
}

export default LoginForm;
