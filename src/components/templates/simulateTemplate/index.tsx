import { ReactNode } from "react";
import QuestionList, { QuestionProps } from "../../molecules/questionList";
import Legends, { Legend } from "../../molecules/legends";
import IconArea from "../../atoms/iconArea";
import { getIconByTitle } from "../../../pages/mainSimulate/data";
import Text from "../../atoms/text";
import Button from "../../molecules/button";

import { ReactComponent as Report } from '../../../assets/icons/warning.svg'

export interface QuestionTemplate {
    enemArea: string;
    imageId: string;
    numero: number;
}

interface SimulateTemplateProps{
    header: ReactNode;
    questions: QuestionProps[]
    selectQuestion: (number: number) => void;
    questionSelect: QuestionTemplate;
    legends: Legend[];
    setReportProblem?: () => void;
    expandedPhoto: () => void;
    alternative: ReactNode;
    buttons: ReactNode;
}

function SimulateTemplate({ header, selectQuestion, questions, legends, questionSelect, setReportProblem, expandedPhoto, alternative, buttons } : SimulateTemplateProps) {

    const BASE_URL = import.meta.env.VITE_BASE_URL;
    console.log(`${BASE_URL}/images/${questionSelect.imageId}.png`)
    return ( 
        <div className="flex flex-col pb-20">
            <div className="bg-marine my-8">
                <div className="container mx-auto">
                    { header }
                </div>
            </div>
            <div className="container mx-auto flex items-center flex-col max-w-6xl">
                <QuestionList selectQuestion={selectQuestion} questions={questions} />
                <Legends legends={legends}/>
                <div className="flex justify-start w-full items-center">
                    <IconArea icon={getIconByTitle(questionSelect.enemArea) as React.FunctionComponent<React.SVGProps<SVGSVGElement>> }  className="bg-marine" />
                    <Text className="m-0 ">{questionSelect.enemArea}</Text>
                    {setReportProblem ? <Button onClick={setReportProblem} typeStyle="none" size="none"><Report className="w-12 h-12"/></Button> : <></>}
                </div>
                <div className="flex py-4 w-full">
                    <Text size="secondary" className="text-orange m-0">Questao {questionSelect.numero}</Text>
                </div>
                 
                <div onClick={expandedPhoto} className="flex justify-center cursor-pointer my-4 p-8 bg-white rounded-lg">
                    {/* <img className="mr-4 sm:m-0" src={`${BASE_URL}/images/${questionSelect.imageId}.png`} /> */}
                    <img className="mr-4 sm:m-0" src={`https://api.vcnafacul.com.br/images/${questionSelect.imageId}.png`} />
                </div>
                <div className="flex flex-wrap justify-evenly my-4">
                    { alternative }
                    { buttons }
                </div>
            </div>
        </div>
     );
}

export default SimulateTemplate;