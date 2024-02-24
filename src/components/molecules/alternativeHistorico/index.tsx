import { ReactComponent as Right } from '../../../assets/icons/statusApproved.svg';
import { ReactComponent as Wrong } from '../../../assets/icons/statusRejected.svg';
import { AnswerHistoricoDTO } from "../../../dtos/historico/historicoDTO";
import Alternative, { AlternativeProps } from "../../atoms/alternative";

interface AlternativeHistoricoProps extends AlternativeProps {
    answer: AnswerHistoricoDTO;
}

export function AlternativeHistorico({ label, select, answer} : AlternativeHistoricoProps) {


    const status = () => {
        if(label === answer.alternativaCorreta) {
            return <Right />
        }
        else if (label === answer.alternativaEstudante)
        return <Wrong />
    }

    return ( 
        <div className="relative">
            <Alternative disabled={true} label={label} select={select} />
            <div className="absolute -right-1 -bottom-1">
                {status()}
            </div>
        </div>
     );
}