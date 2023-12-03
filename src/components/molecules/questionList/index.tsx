import { QuestionBoxStatus } from "../../../enums/simulado/questionBoxStatus"
import QuestionBox from "../../atoms/questionBox"

interface QuestionProps {
    number: number;
    status: QuestionBoxStatus;
    id: string | number;
}

interface QuestionListProps {
    questions: QuestionProps[]
    selectQuestion: (number: number) => void;
}

function QuestionList({ questions, selectQuestion } : QuestionListProps) {

    const getStyle = (status: QuestionBoxStatus) => {
        if(status === QuestionBoxStatus.unsolved) return 'unsolved'
        if(status === QuestionBoxStatus.solved) return 'solved'
        if(status === QuestionBoxStatus.active) return 'active'
        return 'unread'
    }
    return (
        <div className="container mx-4 sm:mx-auto flex flex-wrap">
            {questions.map(question => (
                <QuestionBox key={question.id} number={question.number + 1} status={getStyle(question.status)} onClick={() => { selectQuestion(question.number) }} />
            ))}
        </div>
    ) 
}

export default QuestionList