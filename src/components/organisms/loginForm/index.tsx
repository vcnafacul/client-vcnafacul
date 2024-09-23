/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { DASH, FORGOT_PASSWORD_PATH } from "../../../routes/path";
import Login from "../../../services/auth/login";
import { useAuthStore } from "../../../store/auth";
import Text from "../../atoms/text";
import { FormFieldInput } from "../../molecules/formField";
import FormSubmit from "../formSubmit";

export interface LoginFormProps {
  title: string;
  subtitle: string;
  forgot: string;
  labelSubmit: string;
  formData: FormFieldInput[];
  register?: string;
  onLogin?: (data: any) => void;
}

function LoginForm({
  title,
  subtitle,
  forgot,
  labelSubmit,
  formData,
  onLogin,
  register,
}: LoginFormProps) {
  const { doAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = (data: any) => {
    const id = toast.loading("Entrando ...");
    Login(data.email.toLowerCase(), data.password)
      .then((res) => {
        doAuth(res);
        toast.dismiss(id);
        if (onLogin) onLogin(res);
        else navigate(DASH);
      })
      .catch((e: Error) => {
        toast.update(id, {
          render: `Erro ao tentar fazer login - ${e.message}`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
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
          onSubmit={login}
        />
        <div className="flex justify-between w-full">
          <Link
            to={FORGOT_PASSWORD_PATH}
            className="text-orange w-full mt-5 underline font-bold"
          >
            {forgot}
          </Link>
          <Link
            to={FORGOT_PASSWORD_PATH}
            className="text-orange w-52 mt-5 underline font-bold"
          >
            {register}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
