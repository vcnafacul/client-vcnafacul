import { HistoricoDTO } from "../../../dtos/historico/HistoricoDTO";
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
                <div className="w-40 h-40 bg-green3 absolute right-0 -top-20 -z-10 rotate-45" />
                <div className="border border-green3 bg-white">
                    {historical.map((historico) => <SimulationHistoryCard historico={historico} />)}
                </div>
            </div>
        </div>
     );
}

export default SimulationHistory;