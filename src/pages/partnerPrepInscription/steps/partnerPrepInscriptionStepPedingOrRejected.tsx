import { DataInscription } from "@/dtos/student/studentInscriptionDTO";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface Props {
  inscription: DataInscription;
  prepCourseName: string;
}

export default function PartnerPrepInscriptionStepPedingOrRejected({
  inscription,
  prepCourseName,
}: Props) {
  const navigate = useNavigate();
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

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">
        {isBeforeStart
          ? "🕒 Processo Seletivo Pendente"
          : "🚫 Processo Seletivo Encerrado"}
      </h1>

      <p className="text-lg mb-8 max-w-xl">
        {isBeforeStart
          ? `O período de inscrições para o cursinho ${prepCourseName} iniciará no dia ${formattedStart}.`
          : `O período de inscrições para o cursinho ${prepCourseName} encerrou no dia ${formattedEnd}.`}
      </p>

      <button
        onClick={() => navigate("/")}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Voltar para a tela principal
      </button>
    </div>
  );
}
