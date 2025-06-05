import BLink from "@/components/molecules/bLink";
import { HOME_PATH } from "@/routes/path";
import { AlertCircle } from "lucide-react";

interface Props {
  message: string;
}

export function PartnerPrepInscriptionStepError({ message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 gap-6">
      <AlertCircle className="w-12 h-12 text-orange-500" />
      <h1 className="text-3xl font-semibold text-gray-800">Atenção</h1>
      <p className="text-lg text-gray-600 max-w-md">{message}</p>
      <BLink to={HOME_PATH} className="mt-4 text-base">
        Ir para a Página Inicial
      </BLink>
    </div>
  );
}
