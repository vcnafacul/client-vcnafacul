import Button from "@/components/molecules/button";
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
      <div className="w-full p-4 bg-fuchsia-50 border-l-4 border-fuchsia-500 rounded-md my-4">
        <div className="flex justify-between gap-2">
          <h3 className="font-semibold text-fuchsia-800 text-lg">
            {inscription.name}
          </h3>
          <div className="flex items-center gap-2 text-fuchsia-700 text-sm font-medium bg-fuchsia-100 p-2 rounded-md w-fit">
            <span>📅 Inscrições:</span>
            <span className="font-semibold">
              {format(inscription.startDate, "dd/MM/yyyy")}
            </span>
            <span>→</span>
            <span className="font-semibold">
              {format(inscription.endDate, "dd/MM/yyyy")}
            </span>
          </div>
        </div>

        <p className="mt-2 text-fuchsia-700 text-sm font-medium">
          {inscription.description}
        </p>
      </div>

      {description.map((text, index) => (
        <p key={index} className="text-base text-justify">
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
        <label htmlFor="accept" className="text-sm text-gray-700">
          Li e aceito o{" "}
          <button
            type="button"
            onClick={handleOpenTerm}
            className="text-fuchsia-700 underline hover:text-fuchsia-900"
          >
            Termo de Uso
          </button>{" "}
          e a{" "}
          <a
            href="https://vcnafacul.com.br/docs/Política_de_Privacidade.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fuchsia-700 underline hover:text-fuchsia-900"
          >
            Política de Privacidade
          </a>
        </label>
      </div>

      <Button className="mt-4" onClick={start} disabled={!accepted}>
        Iniciar
      </Button>
    </div>
  );
}
