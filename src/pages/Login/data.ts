import { LoginFormProps } from "../../components/organisms/loginForm";

export const loginForm : LoginFormProps = {
    title: "Entre na sua conta",
    subtitle: "Entre com seu e-mail e senha para acessar a plataforma",
    forgot: "Esqueci minha senha",
    labelSubmit: "Entrar",
    formData: [
        {label: 'E-mail'},
        {label: 'Senha', type: 'password'}
    ]
}