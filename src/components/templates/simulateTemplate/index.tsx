import { ReactNode } from "react";
import QuestionList, { QuestionProps } from "../../molecules/questionList";
import Legends, { Legend } from "../../molecules/legends";
import IconArea from "../../atoms/iconArea";
import { getIconByTitle } from "../../../pages/mainSimulate/data";
import Text from "../../atoms/text";
import Button from "../../molecules/button";

import { ReactComponent as Report } from '../../../assets/icons/warning.svg'

export interface QuestionTemplate {
    _id: string;
    enemArea: string;
    imageId: string;
    numero: number;
}

interface SimulateTemplateProps{
    header: ReactNode;
    questions: QuestionProps[]
    selectQuestion: (number: number) => void;
    questionSelected: QuestionTemplate;
    legends: Legend[];
    setReportProblem?: () => void;
    expandedPhoto: () => void;
    alternative: ReactNode;
    buttons: ReactNode;
}

function SimulateTemplate({ header, selectQuestion, questions, legends, questionSelected, setReportProblem, expandedPhoto, alternative, buttons } : SimulateTemplateProps) {

    const BASE_URL = import.meta.env.VITE_BASE_URL;
    return ( 
        <div className="flex flex-col pb-20">
            <div className="my-8 bg-marine">
                <div className="container mx-auto">
                    { header }
                </div>
            </div>
            <div className="container flex flex-col items-center max-w-6xl mx-auto">
                <QuestionList selectQuestion={selectQuestion} questions={questions} />
                <Legends legends={legends}/>
                <div className="flex items-center justify-start w-full">
                    <IconArea icon={getIconByTitle(questionSelected.enemArea) as React.FunctionComponent<React.SVGProps<SVGSVGElement>> }  className="bg-marine" />
                    <Text className="m-0 ">{questionSelected.enemArea}</Text>
                    {setReportProblem ? <Button onClick={setReportProblem} typeStyle="none"><Report className="w-12 h-12"/></Button> : <></>}
                </div>
                <div className="flex w-full py-4">
                    <Text size="secondary" className="m-0 text-orange">Questao {questions.find(q => q.id === questionSelected._id)!.number + 1}</Text>
                </div>
                 
                <div onClick={expandedPhoto} className="flex justify-center p-8 my-4 bg-white rounded-lg cursor-pointer">
                    <img className="mr-4 sm:m-0" src={`${BASE_URL}/images/${questionSelected.imageId}.png`} />
                </div>
                <div className="flex flex-wrap gap-4 my-4 justify-evenly">
                    { alternative }
                    { buttons }
                </div>
            </div>
        </div>
     );
}

export default SimulateTemplate;