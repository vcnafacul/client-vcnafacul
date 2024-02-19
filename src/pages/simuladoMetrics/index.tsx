import { useParams } from "react-router-dom";
import { HeaderSimulateMetrics } from "../../components/organisms/headerSimulateMetrics";
import SimulateTemplate from "../../components/templates/simulateTemplate";

export function SimulateMetrics() {

    const { historicId } = useParams();


    
    return ( 
        <SimulateTemplate
            header={<HeaderSimulateMetrics />}
        />
     );
}