import { Button } from "@/components/ui/button";
import { DataInscription } from "@/dtos/student/studentInscriptionDTO";
import { getTermOfUse } from "@/services/prepCourse/termOfUse";
import { useAuthStore } from "@/store/auth";
import { format } from "date-fns";
import { useState } from "react";

interface PartnerPrepInscriptionStep0Props {
  start: () => void;
  description: string[];
  inscription: DataInscription;
  partnerId: string;
}

export function PartnerPrepInscriptionStep0({
  start,
  description,
  inscription,
  partnerId,
}: PartnerPrepInscriptionStep0Props) {
  const {
    data: { token },
  } = useAuthStore();

  const [accepted, setAccepted] = useState(false);

  async function handleOpenTerm() {
    try {
      await getTermOfUse(partnerId, token);
    } catch (err) {
      console.error("Erro ao buscar termo:", err);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full p-3 md:p-4 bg-info-muted border-l-4 border-info rounded-md my-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <h3 className="font-semibold text-foreground text-h3">
            {inscription.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1 md:gap-2 text-foreground text-caption font-medium bg-muted p-2 rounded-md w-fit">
            <span>📅 Inscrições:</span>
            <span className="font-semibold whitespace-nowrap">
              {format(inscription.startDate, "dd/MM/yyyy")}
            </span>
            <span>→</span>
            <span className="font-semibold whitespace-nowrap">
              {format(inscription.endDate, "dd/MM/yyyy")}
            </span>
          </div>
        </div>

        <p className="mt-2 text-foreground text-caption font-medium">
          {inscription.description}
        </p>
      </div>

      {description.map((text, index) => (
        <p key={index} className="text-prose text-justify">
          {text}
        </p>
      ))}

      <div className="flex items-start gap-2 mt-4">
        <input
          type="checkbox"
          id="accept"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-1"
        />
        <label htmlFor="accept" className="text-body text-foreground">
          Li e aceito o{" "}
          <button
            type="button"
            onClick={handleOpenTerm}
            className="text-primary underline hover:text-primary/80"
          >
            Termo de Uso
          </button>{" "}
          e a{" "}
          <a
            href="https://vcnafacul.com.br/docs/Política_de_Privacidade.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80"
          >
            Política de Privacidade
          </a>
        </label>
      </div>

      <Button variant="primary" size="lg" className="w-full mt-4" onClick={start} disabled={!accepted}>
        Iniciar
      </Button>
    </div>
  );
}
