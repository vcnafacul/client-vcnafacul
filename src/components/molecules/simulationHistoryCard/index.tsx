import { useNavigate } from "react-router-dom";
import { HistoricoDTO } from "../../../dtos/historico/HistoricoDTO";
import { StatusEnum } from "../../../enums/generic/statusEnum";
import { getFormatingTime } from "../../../utils/getFormatingTime";
import { getStatusIcon } from "../../../utils/getStatusIcon";
import SimulationHistoryField from "../../atoms/simulationHistoryField";
import { SIMULATE_METRICS } from "../../../routes/path";

interface SimulationHistoryCardProps {
    historico: HistoricoDTO;
}

function SimulationHistoryCard({ historico } : SimulationHistoryCardProps) {

    const navigate = useNavigate()

    return ( 
        <div className="flex flex-wrap gap-4 bg-white p-4 m-2.5 shadow-md justify-between cursor-pointer" onClick={() => { navigate(`${SIMULATE_METRICS}${historico._id}`) }}>
            <SimulationHistoryField field="Caderno:" value={historico.simulado.tipo.nome} className="min-w-[250px]" />
            <SimulationHistoryField value="questões" field={historico.simulado.tipo.quantidadeTotalQuestao.toString()} className="min-w-[120px]" />
            <SimulationHistoryField field="Tempo:" value={getFormatingTime(historico.tempoRealizado)} className="min-w-[160px]" />
            <SimulationHistoryField field="Aproveitamento:" value={`${(historico.aproveitamento.geral * 100).toFixed(2)}%`} className="min-w-[200px]" />
            <div>{getStatusIcon(historico.questoesRespondidas === historico.simulado.tipo.quantidadeTotalQuestao ? StatusEnum.Approved : StatusEnum.Rejected)}</div>
        </div>
     );
}

export default SimulationHistoryCard;