import { QuestionBoxStatus } from "../../../enums/simulado/questionBoxStatus"
import QuestionBox from "../../atoms/questionBox"

interface QuestionProps {
    number: number;
    status: QuestionBoxStatus;
    id: string | number;
}

interface QuestionListProps {
    questions: QuestionProps[]
}

function QuestionList({ questions } : QuestionListProps) {

    const getStyle = (status: QuestionBoxStatus) => {
        if(status === QuestionBoxStatus.unsolved) return 'unsolved'
        if(status === QuestionBoxStatus.solved) return 'solved'
        if(status === QuestionBoxStatus.active) return 'active'
        return 'unread'
    }
    return (
        <div className="container mx-auto flex flex-wrap">
            {questions.map(question => (
                <QuestionBox key={question.id} number={question.number} status={getStyle(question.status)} />
            ))}
        </div>
    ) 
}

export default QuestionList