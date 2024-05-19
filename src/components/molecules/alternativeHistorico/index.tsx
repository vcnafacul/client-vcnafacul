import { ReactComponent as Right } from '../../../assets/icons/statusApproved.svg';
import { ReactComponent as Wrong } from '../../../assets/icons/statusRejected.svg';
import { AnswerHistoricoDTO } from "../../../dtos/historico/historicoDTO";
import { Alternativa, Alternatives } from '../../../types/question/alternative';
import Alternative from "../../atoms/alternative";

interface AlternativeHistoricoProps {
    answer: AnswerHistoricoDTO;
}

export function AlternativeHistorico({ answer} : AlternativeHistoricoProps) {

    const status = (label: Alternativa) => {
        if(label === answer.alternativaCorreta) {
            return <Right />
        }
        else if (label === answer.alternativaEstudante)
        return <Wrong />
    }

    return ( 
        
        <div className="flex gap-4">
            {Alternatives.map((alt, index) => (
                <div key={index} className="relative">
                <Alternative key={index} disabled={true} label={alt.label} select={answer?.alternativaEstudante === alt.label} />
                    <div className="absolute -right-1 -bottom-1">
                        {status(alt.label)}
                    </div>
                </div>
            ))}
        </div>


            
     );
}