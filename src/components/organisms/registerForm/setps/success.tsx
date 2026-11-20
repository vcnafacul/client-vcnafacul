import { textContact } from "@/pages/register/data";
import { CheckCheck } from "lucide-react";

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
      <p className="text-prose text-foreground mb-6 text-center mt-10">
        Acesse seu email, {email}, para confirmar o seu cadastro
      </p>
      {texts.map((text) => (
        <p key={text} className="text-body text-foreground text-center m-0">
          {text}
        </p>
      ))}
      <p className="text-body text-muted-foreground mb-3 mt-3 text-center leading-7">
        <span className="block">{textContact.text}</span>
        <span className="block">{textContact.email}</span>
      </p>
    </div>
  );
}

export default Success;
