import { FORGOT_PASSWORD_PATH, REGISTER_PATH } from "@/routes/path";
import { LoginFormProps } from "../../components/organisms/loginForm";

export const loginForm: LoginFormProps = {
  title: "Entre na sua conta",
  subtitle: "Entre com seu e-mail e senha para acessar a plataforma",
  labelSubmit: "Entrar",
  formData: [
    { id: "email", label: "E-mail" },
    { id: "password", label: "Senha", type: "password" },
  ],
};

export const forgotRegister = [
  {
    label: "Esqueci minha senha",
    link: FORGOT_PASSWORD_PATH,
  },
  {
    label: "Não possuo cadastro",
    link: REGISTER_PATH,
  },
];
