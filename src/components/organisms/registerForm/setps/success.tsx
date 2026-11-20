import { textContact } from "@/pages/register/data";
import { CheckCheck } from "lucide-react";
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
      <CheckCheck size={150} className="text-success border-2 border-success p-4 rounded-full" />
      <Text size="secondary" className="mt-10">
        Acesse seu email, {email}, para confirmar o seu cadastro
      </Text>
      {texts.map((text, index) => (
        <Text key={index} className="m-0" size="tertiary">
          {text}
        </Text>
      ))}
      <Text
        size="quaternary"
        className="mt-3 md:mt-3 text-body text-muted-foreground leading-7 md:leading-7"
      >
        <div>{textContact.text}</div>
        <span>{textContact.email}</span>
      </Text>
    </div>
  );
}

export default Success;
