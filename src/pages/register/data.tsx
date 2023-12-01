import { RegisterFormProps } from "../../components/organisms/registerForm";

export const registerForm : RegisterFormProps = {
    title: "Cadastre-se",
    subtitle: "",
    labelSubmit: "Continuar",
    formData: [
        { id: 'email', label: 'E-mail'},
        { id: 'password', label: 'Senha', type: 'password'},
        { id: 'password_confirmation', label: 'Confirmar Senha', type: 'password'},
    ]
}