import BLink from "@/components/molecules/bLink";
import { DataInscription } from "@/dtos/student/studentInscriptionDTO";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { HOME_PATH } from "@/routes/path";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, XCircle } from "lucide-react";

interface Props {
  inscription: DataInscription;
  prepCourseName: string;
}

export default function PartnerPrepInscriptionStepPedingOrRejected({
  inscription,
  prepCourseName,
}: Props) {
  const now = new Date();

  const start = new Date(inscription.startDate);
  const end = new Date(inscription.endDate);

  const formattedStart = format(start, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
    locale: ptBR,
  });
  const formattedEnd = format(end, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
    locale: ptBR,
  });

  const isBeforeStart =
    inscription.status === StatusEnum.Pending && now < start;

  const Icon = isBeforeStart ? Clock : XCircle;
  const iconColor = isBeforeStart ? "text-yellow-600" : "text-red-600";
  const textColor = isBeforeStart ? "text-yellow-800" : "text-red-800";
  const dateColor = isBeforeStart ? "text-yellow-800" : "text-red-800";

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
      <Icon className={`w-14 h-14 ${iconColor}`} />

      <h1 className={`text-3xl font-semibold ${textColor}`}>
        {isBeforeStart
          ? "Processo Seletivo Pendente"
          : "Processo Seletivo Encerrado"}
      </h1>

      <p className="text-gray-700 text-base max-w-xl">
        {isBeforeStart ? (
          <>
            O período de inscrições para o cursinho{" "}
            <strong>{prepCourseName}</strong> ainda não começou. Ele terá início
            em:{" "}
            <span className={`font-medium ${dateColor}`}>{formattedStart}</span>
            .
          </>
        ) : (
          <>
            O período de inscrições para o cursinho{" "}
            <strong>{prepCourseName}</strong> foi encerrado. A data final foi:{" "}
            <span className={`font-medium ${dateColor}`}>{formattedEnd}</span>.
          </>
        )}
      </p>

      <div>
        <BLink to={HOME_PATH} className="mt-4 text-base w-96">
          Ir para a Página Inicial
        </BLink>
      </div>
    </div>
  );
}
