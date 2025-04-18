import BLink from "@/components/molecules/bLink";
import { HOME_PATH } from "@/routes/path";
import { CheckCircle } from "lucide-react";

export function PartnerPrepInscriptionStepSucess() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 text-center animate-fade-in">
      <CheckCircle className="w-16 h-16 text-green-600 drop-shadow-md" />

      <div>
        <h2 className="text-2xl font-semibold text-gray-800">
          Inscrição confirmada!
        </h2>
        <p className="text-sm text-gray-600 mt-2 max-w-md">
          Sua inscrição foi realizada com sucesso. Estamos felizes em ter você
          com a gente! 😊
        </p>
      </div>

      <BLink to={HOME_PATH} className="mt-4 text-base">
        Ir para a Página Inicial
      </BLink>
    </div>
  );
}
