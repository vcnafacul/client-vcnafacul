import Button from "@/components/molecules/button";
import { DataInscription } from "@/dtos/student/studentInscriptionDTO";
import { format } from "date-fns";

interface PartnerPrepInscriptionStep0Props {
  start: () => void;
  description: string[];
  inscription: DataInscription;
}

export function PartnerPrepInscriptionStep0({
  start,
  description,
  inscription,
}: PartnerPrepInscriptionStep0Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full p-4 bg-fuchsia-50 border-l-4 border-fuchsia-500 rounded-md my-4">
        <div className="flex justify-between gap-2">
          <h3 className="font-semibold text-fuchsia-800 text-lg">
            {inscription.name}
          </h3>
          <div className="flex items-center gap-2 text-fuchsia-700 text-sm font-medium bg-fuchsia-100 p-2 rounded-md w-fit">
            <span>📅 Inscrições:</span>
            <span className="font-semibold">{format(inscription.startDate, "dd/MM/yyyy")}</span>
            <span>→</span>
            <span className="font-semibold">{format(inscription.endDate, "dd/MM/yyyy")}</span>
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

      <Button className="mt-4" onClick={start}>
        Iniciar
      </Button>
    </div>
  );
}
