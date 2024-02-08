/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom"
import Text from "../../atoms/text"
import FormSubmit from "../formSubmit"
import { FormFieldInput } from "../../molecules/formField";
import Login from "../../../services/auth/login";
import { useAuthStore } from "../../../store/auth";
import { useNavigate } from "react-router-dom";
import { DASH, FORGOT_PASSWORD_PATH } from "../../../routes/path";
import { toast } from "react-toastify";

export interface LoginFormProps {
    title: string;
    subtitle: string;
    forgot: string;
    labelSubmit: string;
    formData: FormFieldInput[]
}

function LoginForm({ title, subtitle, forgot, labelSubmit, formData } : LoginFormProps){
    const { doAuth } = useAuthStore()
    const navigate = useNavigate();
    
    const login = (data: any) => {
        Login(data.email.toLowerCase(), data.password)
            .then(res => {
                doAuth(res)
                navigate(DASH);
            })
            .catch((e: Error) => {
                toast.error(`Erro ao tentar fazer login - ${e.message}`)
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
                    onSubmit={login}
                    />
                <Link to={FORGOT_PASSWORD_PATH} className="text-orange w-full mt-5 underline font-bold">{forgot}</Link>
            </div>
        </div>
    )
}

export default LoginForm