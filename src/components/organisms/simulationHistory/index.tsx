import { Link } from "react-router-dom";
import { HistoricoDTO } from "../../../dtos/historico/historicoDTO";
import SimulationHistoryCard from "../../molecules/simulationHistoryCard";
import { DASH, SIMULADO_HISTORIES } from "../../../routes/path";

interface SimulationHistoryProps {
  historical: HistoricoDTO[];
}

function SimulationHistory({ historical }: SimulationHistoryProps) {
  return (
    <div className="w-full px-4 my-10">
      <h2 className="text-h1 text-foreground mb-6 text-start">
        Histórico de Simulados
      </h2>
      <p className="text-body mb-6 text-start text-muted-foreground">
        Veja aqui todos os simulados que você já realizou.
        Para mais detalhes, <Link className="text-success font-extrabold" to={`${DASH}/${SIMULADO_HISTORIES}`}>clique aqui.</Link>
      </p>
      <div className="relative ">
        <div className="w-40 h-40 bg-success absolute right-0 -top-20 -z-10 rotate-45" />
        <div className="border border-success bg-white">
          {historical.map((historico) => (
            <SimulationHistoryCard historico={historico} key={historico._id} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SimulationHistory;
