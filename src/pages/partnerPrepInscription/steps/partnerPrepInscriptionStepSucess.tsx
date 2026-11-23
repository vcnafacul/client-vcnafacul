import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HOME_PATH } from "@/routes/path";
import { CheckCircle } from "lucide-react";

export function PartnerPrepInscriptionStepSucess() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 text-center animate-fade-in">
      <CheckCircle className="w-16 h-16 text-success drop-shadow-md" />

      <div>
        <h2 className="text-h1 font-semibold text-foreground">
          Inscrição confirmada!
        </h2>
        <p className="text-body text-muted-foreground mt-2 max-w-md">
          Recebemos sua inscrição no processo seletivo! Obrigado por se
          inscrever 😊 Agora é só aguardar: o cursinho vai analisar todas as
          inscrições e entraremos em contato com o resultado e os próximos
          passos.
        </p>
      </div>

      <Button asChild variant="cta" className="mt-4">
        <Link to={HOME_PATH}>Ir para a Página Inicial</Link>
      </Button>
    </div>
  );
}
