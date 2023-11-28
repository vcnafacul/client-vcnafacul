import Text from "../../atoms/text"
import FormField from "../../molecules/formField"

function LoginForm(){
    return (
        <div className="w-full h-[calc(100vh-88px)] flex justify-start items-center flex-col mx-auto">
            <div className="mt-20 max-w-[500px]">
                <Text size="secondary">Entre na sua conta</Text>
                <Text size="quaternary" className="text-orange my-5">Entre com seu e-mail e senha para acessar a plataforma</Text>
                <FormField label="E-mail" />
                <FormField label="Senha" type="password" visibility={false} />
            </div>
        </div>
    )
}

export default LoginForm