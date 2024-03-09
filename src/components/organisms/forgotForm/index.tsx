import { toast } from "react-toastify";
import { Forgot } from "../../../services/auth/forgot";
import Text from "../../atoms/text";
import { FormFieldInput } from "../../molecules/formField";
import FormSubmit from "../formSubmit";
import { useNavigate } from "react-router-dom";
import { LOGIN_PATH } from "../../../routes/path";
import { useState } from "react";

export interface ForgotFormProps {
  title: string;
  subtitle: string;
  labelSubmit: string;
  formData: FormFieldInput[]
}

export function ForgotForm({ title, subtitle, labelSubmit, formData } : ForgotFormProps){
  const navigate = useNavigate();
  const [disabled, setDisabled] = useState<boolean>(false)
  const forgot = (data: {email: string}) => {
    setDisabled(true)
    const id = toast.loading('Enviando email de redefinição de senha...')
    Forgot(data.email.toLowerCase())
        .then(() => {
          toast.update(id, {render: `Email de redefinição de senha enviado para ${data.email.toLowerCase()}`, type: "success", isLoading: false, autoClose: 3000, });
          navigate(LOGIN_PATH)
        })
        .catch((e: Error) => {
            toast.update(id, {render: e.message, type: "error", isLoading: false, autoClose: 3000, });
            setDisabled(false)
        })
  }
  return (
    <div className="w-full h-[calc(100vh-88px)] flex justify-start items-center flex-col mx-auto">
            <div className="mt-20 max-w-[500px] flex flex-col items-center">
                <Text size="secondary">{title}</Text>
                <Text size="quaternary" className="text-orange my-5">{subtitle}</Text>
                <FormSubmit 
                    className="w-full my-4 flex flex-col gap-4"
                    formFields={formData} 
                    labelSubmit={labelSubmit}
                    onSubmit={forgot}
                    disabled={disabled}
                    />
    </div>
  </div>
  )
}