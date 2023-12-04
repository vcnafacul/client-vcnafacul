import { Link } from "react-router-dom"
import Text from "../../atoms/text"
import FormSubmit from "../formSubmit"
import { useState } from "react";
import { FormFieldInput } from "../../molecules/formField";
import { createObjectFromFormFieldInput } from "../../../utils/createObject";
import Login from "../../../services/auth/login";
import { useAuthStore } from "../../../store/auth";
import { useNavigate } from "react-router-dom";
import { DASH } from "../../../routes/path";

export interface LoginFormProps {
    title: string;
    subtitle: string;
    forgot: string;
    labelSubmit: string;
    formData: FormFieldInput[]
}

function LoginForm({ title, subtitle, forgot, labelSubmit, formData } : LoginFormProps){

    const [data, setData] = useState(createObjectFromFormFieldInput(formData)) 
    const { doAuth } = useAuthStore()
    const navigate = useNavigate();
    

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputChange = (event: any) => {
        const { name, value } = event.target;
        setData({ ...data, [name]: value });
    };

    const login = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        Login(data.email as string, data.password as string)
            .then(res => {
                doAuth(res)
                navigate(DASH);
            })
            .catch((e: Error) => {
                console.log(e)
                //setError({message: e.message})
            })
            .finally(() => {
                //setLoading(false)
            })
    }

    return (
        <div className="w-full h-[calc(100vh-88px)] flex justify-start items-center flex-col mx-auto">
            <div className="mt-20 max-w-[500px] flex flex-col items-center">
                <Text size="secondary">{title}</Text>
                <Text size="quaternary" className="text-orange my-5">{subtitle}</Text>
                <FormSubmit 
                    className="w-full my-4"
                    formFields={formData} 
                    labelSubmit={labelSubmit}
                    handleOnChange={handleInputChange}
                    onSubmit={login}/>
                <Link to='#' className="text-orange w-full mt-5 underline font-bold">{forgot}</Link>
            </div>
        </div>
    )
}

export default LoginForm