import BLink from "@/components/molecules/bLink";
import { DASH } from "@/routes/path";

export function PartnerPrepInscriptionStepSucess() {
    return (
        <div className="flex flex-col items-center gap-8">
            <span className="text-lg">Sua inscrição foi realizada com sucesso</span>
            <BLink to={DASH}>Página Inicial</BLink>
        </div>
    )
}