/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { useToastAsync } from "../../../hooks/useToastAsync";
import { DASH } from "../../../routes/path";
import Login from "../../../services/auth/login";
import googleAuth from "../../../services/auth/googleAuth";
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
        <div className="w-full flex items-center gap-4 my-2">
          <hr className="flex-1 border-gray-300" />
          <span className="text-sm text-gray-500">ou</span>
          <hr className="flex-1 border-gray-300" />
        </div>
        <button
          type="button"
          onClick={googleAuth}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span className="text-sm font-medium text-gray-700">Entrar com Google</span>
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
