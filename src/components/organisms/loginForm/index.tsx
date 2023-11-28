import { Link } from "react-router-dom"
import Text from "../../atoms/text"
import { FormFieldProps } from "../../molecules/formField"
import Form from "../form"

export interface LoginFormProps {
    title: string;
    subtitle: string;
    forgot: string;
    labelSubmit: string;
    formData: FormFieldProps[]
}

function LoginForm({ title, subtitle, forgot, labelSubmit, formData } : LoginFormProps){

    const login = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        console.log('Entrar')
    }

    return (
        <div className="w-full h-[calc(100vh-88px)] flex justify-start items-center flex-col mx-auto">
            <div className="mt-20 max-w-[500px] flex flex-col items-center">
                <Text size="secondary">{title}</Text>
                <Text size="quaternary" className="text-orange my-5">{subtitle}</Text>
                <Form 
                    className="w-full my-4"
                    formFields={formData} 
                    labelSubmit={labelSubmit}
                    onSubmit={login}/>
                <Link to='#' className="text-orange w-full mt-5 underline font-bold">{forgot}</Link>
            </div>
        </div>
    )
}

export default LoginForm