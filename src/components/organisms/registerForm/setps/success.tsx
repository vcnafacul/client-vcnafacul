import { FaCheckDouble } from "react-icons/fa";
import Text from "../../../atoms/text";

interface Props {
  email: string;
}

function Success({ email }: Props) {
  const texts = [
    "Seu pré-cadastro foi realizado com sucesso!",
    "Queremos te acompanhar na sua jornada de estudos em direção a Universidade.",
  ];
  return (
    <div className="w-full flex flex-col items-center">
      <FaCheckDouble className="fill-green text-[150px] border-2 border-green p-4 rounded-full" />
      <Text size="secondary" className="mt-10">
        Acesse seu email, {email}, para confirmar o seu cadastro
      </Text>
      {texts.map((text, index) => (
        <Text key={index} className="m-0" size="tertiary">
          {text}
        </Text>
      ))}
    </div>
  );
}

export default Success;
