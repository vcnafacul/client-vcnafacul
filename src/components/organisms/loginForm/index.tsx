import { Link } from "react-router-dom"
import Text from "../../atoms/text"
import Button from "../../molecules/button"
import FormField from "../../molecules/formField"

function LoginForm(){
    return (
        <div className="w-full h-[calc(100vh-88px)] flex justify-start items-center flex-col mx-auto">
            <div className="mt-20 max-w-[500px] flex flex-col items-center">
                <Text size="secondary">Entre na sua conta</Text>
                <Text size="quaternary" className="text-orange my-5">Entre com seu e-mail e senha para acessar a plataforma</Text>
                <FormField label="E-mail" />
                <FormField label="Senha" type="password" visibility={false} />
                <Button hover={true} onClick={() => console.log('Entrar')}>Entrar</Button>
                <Link to='#' className="text-orange w-full mt-5 underline font-bold">Esqueci minha senha</Link>
            </div>
        </div>
    )
}

export default LoginForm