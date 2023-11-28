import { Link } from "react-router-dom"
import Text from "../../atoms/text"
import { FormFieldProps } from "../../molecules/formField"
import Form from "../form"

function LoginForm(){

    const formData : FormFieldProps[] = [
        {label: 'E-mail'},
        {label: 'Senha', type: 'password'}
    ]

    const login = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        console.log('Entrar')
    }

    return (
        <div className="w-full h-[calc(100vh-88px)] flex justify-start items-center flex-col mx-auto">
            <div className="mt-20 max-w-[500px] flex flex-col items-center">
                <Text size="secondary">Entre na sua conta</Text>
                <Text size="quaternary" className="text-orange my-5">Entre com seu e-mail e senha para acessar a plataforma</Text>
                <Form 
                    className="w-full my-4"
                    formFields={formData} 
                    labelSubmit="Entrar"
                    onSubmit={login}/>
                <Link to='#' className="text-orange w-full mt-5 underline font-bold">Esqueci minha senha</Link>
            </div>
        </div>
    )
}

export default LoginForm