import { ReactNode } from "react";
import QuestionList, { QuestionProps } from "../../molecules/questionList";
import Legends, { Legend } from "../../molecules/legends";
import IconArea from "../../atoms/iconArea";
import { getIconByTitle } from "../../../pages/mainSimulate/data";
import { Question } from "../../../store/simulado";
import Text from "../../atoms/text";
import Button from "../../molecules/button";

import { ReactComponent as Report } from '../../../assets/icons/warning.svg'

interface SimulateTemplateProps{
    header: ReactNode;
    questions: QuestionProps[]
    selectQuestion: (number: number) => void;
    questionSelect: Question;
    legends: Legend[];
    setReportProblem: () => void;
    expandedPhoto: () => void;
    alternative: ReactNode;
    buttons: ReactNode;
}

function SimulateTemplate({ header, selectQuestion, questions, legends, questionSelect, setReportProblem, expandedPhoto, alternative, buttons } : SimulateTemplateProps) {

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    return ( 
        <div className="flex flex-col">
            <div className="bg-marine my-8">
                <div className="container mx-auto">
                    { header }
                </div>
            </div>
            <div className="container mx-auto ">
                <QuestionList selectQuestion={selectQuestion}
                        questions={questions} />
                <Legends legends={legends}/>
                <div className="flex gap-4 justify-start">
                    <IconArea icon={getIconByTitle(questionSelect.enemArea) as React.FunctionComponent<React.SVGProps<SVGSVGElement>> }  className="bg-marine" />
                    <Text className="m-0 text-start w-full">{questionSelect.enemArea}</Text>
                    <Button typeStyle="none" size="none"><Report className="w-15 h-15" /></Button>
                </div>
                <div className="flex my-4 gap-4">
                    <Text size="secondary" className="text-orange m-0">Questao {questionSelect.number + 1}</Text>
                    <Report className="w-10 h-8 cursor-pointer" onClick={setReportProblem}/>
                </div>
                <div onClick={expandedPhoto} className="w-full flex justify-center cursor-pointer my-4">
                    <img className="mr-4 sm:m-0" src={`${BASE_URL}/images/${questionSelect.imageId}.png`} />
                </div>
                <div className="flex flex-wrap justify-evenly">
                    { alternative }
                    { buttons }
                </div>
            </div>
        </div>
     );
}

export default SimulateTemplate;