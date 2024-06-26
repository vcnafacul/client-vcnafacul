import { DateTime } from "luxon";
import { Link } from "react-router-dom";
import { HistoricoDTO } from "../../../dtos/historico/historicoDTO";
import { StatusEnum } from "../../../enums/generic/statusEnum";
import { SIMULATE_METRICS } from "../../../routes/path";
import { getFormatingTime } from "../../../utils/getFormatingTime";
import { getStatusIcon } from "../../../utils/getStatusIcon";
import SimulationHistoryField from "../../atoms/simulationHistoryField";
import { ToolTip } from "../../atoms/tooltip";

interface SimulationHistoryCardProps {
  historico: HistoricoDTO;
}

function SimulationHistoryCard({ historico }: SimulationHistoryCardProps) {
  return (
    <Link
      className="flex flex-wrap gap-4 bg-white border border-gray-100 border-t-0 rounded p-4 pb-6 pr-12 m-2.5 shadow-md justify-between relative"
      to={`${SIMULATE_METRICS}${historico._id}`}
    >
      <SimulationHistoryField
        field="Caderno:"
        value={historico.simulado.tipo.nome}
        className="md:min-w-[250px]"
      />
      <SimulationHistoryField
        field="Tempo:"
        value={getFormatingTime(historico.tempoRealizado)}
        className="md:min-w-[160px]"
      />
      <SimulationHistoryField
        field="Aproveitamento:"
        value={`${(historico.aproveitamento.geral * 100).toFixed(2)}%`}
        className="md:min-w-[200px]"
      />
      <div className="group absolute right-4 bottom-6">
        {getStatusIcon(
          historico.questoesRespondidas ===
            historico.simulado.tipo.quantidadeTotalQuestao
            ? StatusEnum.Approved
            : StatusEnum.Rejected
        )}
        <ToolTip>
          {historico.questoesRespondidas ===
          historico.simulado.tipo.quantidadeTotalQuestao
            ? "Simulado Completo"
            : "Simulado Incompleto"}
        </ToolTip>
      </div>
      <h1 className="font-bold text-gray-700 text-base sm:absolute bottom-0.5 left-4">
        {DateTime.fromISO(historico.createdAt.toString()).toLocaleString(
          DateTime.DATE_MED
        )}
      </h1>
    </Link>
  );
}

export default SimulationHistoryCard;
