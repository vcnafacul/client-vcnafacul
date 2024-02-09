import { ForgotFormProps } from "../../components/organisms/forgotForm";

export const forgotForm : ForgotFormProps = {
    title: "Esqueceu sua senha?",
    subtitle: "Digite seu e-mail e enviaremos instruções para redefinir sua senha.",
    labelSubmit: "Enviar",
    formData: [
        { id: 'email', label: 'E-mail'},
    ]
}