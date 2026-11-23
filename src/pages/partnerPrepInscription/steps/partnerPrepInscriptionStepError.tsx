import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DASH, HOME_PATH, REGISTRATION_MONITOR } from "@/routes/path";
import { AlertCircle } from "lucide-react";

interface Props {
  message: string;
  /** Já se inscreveu neste processo: o caminho é acompanhar a inscrição. */
  alreadyInscribed?: boolean;
}

export function PartnerPrepInscriptionStepError({
  message,
  alreadyInscribed = false,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 gap-6">
      <AlertCircle className="w-12 h-12 text-warning" />
      <h2 className="text-h1 font-semibold text-foreground">Atenção</h2>
      <p className="text-h3 text-muted-foreground max-w-md">{message}</p>
      {alreadyInscribed ? (
        <Button asChild className="mt-4">
          <Link to={`${DASH}/${REGISTRATION_MONITOR}`}>
            Ir para minhas inscrições
          </Link>
        </Button>
      ) : (
        <Button asChild className="mt-4">
          <Link to={HOME_PATH}>Ir para a Página Inicial</Link>
        </Button>
      )}
    </div>
  );
}
