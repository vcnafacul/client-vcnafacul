import { ResetFormProps } from "../../components/organisms/resetForm";

export const resetForm : ResetFormProps = {
    title: "Redefinir senha",
    subtitle: "Informe sua nova senha",
    labelSubmit: "Enviar",
    formData: [
      { id: 'password', label: 'Senha', type: 'password'},
      { id: 'password_confirmation', label: 'Confirmar Senha', type: 'password'},
    ]
}