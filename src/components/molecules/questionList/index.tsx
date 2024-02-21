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
}

function QuestionList({ questions, selectQuestion } : QuestionListProps) {


    return (
        <div className="flex w-full flex-wrap">
            {questions.map(question => (
                <QuestionBox key={question.id} number={question.number + 1} status={question.status} onClick={() => { selectQuestion(question.number) }} />
            ))}
        </div>
    ) 
}

export default QuestionList