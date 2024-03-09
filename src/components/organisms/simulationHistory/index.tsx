import { HistoricoDTO } from "../../../dtos/historico/historicoDTO";
import Text from "../../atoms/text";
import SimulationHistoryCard from "../../molecules/simulationHistoryCard";

interface SimulationHistoryProps {
    historical: HistoricoDTO[]
}

function SimulationHistory({ historical } : SimulationHistoryProps) {
    return ( 
        <div className="w-full px-4 my-10">
            <Text size="primary" className="text-start">Histórico de Simulados</Text>
            <Text size="tertiary" className="text-start text-gray-500">Veja aqui todos os simulados que você já realizou.</Text>
            <div className="relative ">
                <div className="w-40 h-40 bg-lightGreen absolute right-0 -top-20 -z-10 rotate-45" />
                <div className="border border-lightGreen bg-white">
                    {historical.map((historico) => <SimulationHistoryCard historico={historico} key={historico._id} />)}
                </div>
            </div>
        </div>
     );
}

export default SimulationHistory;