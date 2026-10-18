import { QuestionBoxStatus } from "../../../enums/simulado/questionBoxStatus";
import QuestionBox from "../../atoms/questionBox";

export interface QuestionProps {
    number: number;
    status: QuestionBoxStatus;
    id: string | number;
}

interface QuestionListProps {
    questions: QuestionProps[]
    selectQuestion: (number: number) => void;
    /** tickets/042: no resultado, a anulada abre. */
    anuladaAbre?: boolean;
}

function QuestionList({ questions, selectQuestion, anuladaAbre = false } : QuestionListProps) {


    return (
        <div className="flex w-full flex-wrap">
            {questions.map(question => (
                <QuestionBox key={question.id} number={question.number + 1} status={question.status} abreQuandoAnulada={anuladaAbre} onClick={() => { selectQuestion(question.number) }} />
            ))}
        </div>
    ) 
}

export default QuestionList