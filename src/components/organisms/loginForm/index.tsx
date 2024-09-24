/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
