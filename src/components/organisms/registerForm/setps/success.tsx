import { Link } from "react-router-dom"
import Text from "../../../atoms/text"

function Success(){

    const texts = [
        "Seu pré-cadastro foi realizado com sucesso!",
        "Acesse seu email para confirmar o ser cadastro",
        "Queremos te acompanhar na sua jornada de estudos em direção a Universidade.",
        "Estamos construindo a nossa plataforma! Aguarde!",
        "Assim que a primeira funcionalidade estiver pronta nós vamos te avisar para que você seja um dos primeiros a testá-la!"]
    return (
        <div className="w-full flex flex-col">
            {texts.map((text, index) => (
                <Text key={index} className="m-0" size="tertiary">{text}</Text>
            ))}
            <Link className="w-full text-center text-base mt-6 py-3 px-4 bg-orange text-white font-black rounded"
                target="_blank" to="https://www.instagram.com/vcnafacul/">
                Veja nossos posts no Instagram!
                </Link>
        </div>
    )
}

export default Success
