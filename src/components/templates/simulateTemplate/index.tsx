import { ReactNode } from "react";
import { getIconByTitle } from "../../../pages/mainSimulate/data";
import IconArea from "../../atoms/iconArea";
import Text from "../../atoms/text";
import Button from "../../molecules/button";
import Legends, { Legend } from "../../molecules/legends";
import QuestionList, { QuestionProps } from "../../molecules/questionList";

import { ReactComponent as Report } from "../../../assets/icons/warning.svg";
import {
  getColorEnemArea,
  getTextColorEnemArea,
} from "../../../utils/colorEnemArea";

export interface QuestionTemplate {
  _id: string;
  enemArea: string;
  imageId: string;
  numero: number;
}

interface SimulateTemplateProps {
  header: ReactNode;
  questions: QuestionProps[];
  selectQuestion: (number: number) => void;
  questionSelected: QuestionTemplate;
  questionImageUrl: string;
  legends: Legend[];
  setReportProblem?: () => void;
  expandedPhoto: () => void;
  alternative: ReactNode;
  buttons: ReactNode;
}

function SimulateTemplate({
  header,
  selectQuestion,
  questions,
  legends,
  questionSelected,
  questionImageUrl,
  setReportProblem,
  expandedPhoto,
  alternative,
  buttons,
}: SimulateTemplateProps) {
  return (
    <div className="flex flex-col pb-20">
      <div className="my-8 bg-marine">
        <div className="container mx-auto">{header}</div>
      </div>
      <div className="container flex flex-col items-center max-w-6xl mx-auto px-4">
        <QuestionList selectQuestion={selectQuestion} questions={questions} />
        <Legends legends={legends} />
        <div className="flex items-center justify-start w-full">
          <IconArea
            icon={
              getIconByTitle(
                questionSelected.enemArea
              ) as React.FunctionComponent<React.SVGProps<SVGSVGElement>>
            }
            className={`${getColorEnemArea(questionSelected.enemArea)}`}
          />
          <Text
            className={`${getTextColorEnemArea(
              questionSelected.enemArea
            )} mx-4 mb-0 sm:whitespace-nowrap w-fit`}
          >
            {questionSelected.enemArea}
          </Text>
          {setReportProblem ? (
            <Button onClick={setReportProblem} typeStyle="none">
              <Report className="w-12 h-12" />
            </Button>
          ) : (
            <></>
          )}
        </div>
        <div className="flex w-full py-4">
          <Text size="secondary" className="m-0 text-orange">
            Questao{" "}
            {questions.find((q) => q.id === questionSelected._id)!.number + 1}
          </Text>
        </div>

        <div
          onClick={expandedPhoto}
          className="flex justify-center p-8 my-4 bg-white rounded-lg cursor-pointer"
        >
          <img className="mr-4 sm:m-0" src={questionImageUrl} alt="Questão" />
        </div>
        <div className="flex flex-wrap gap-4 my-4 justify-evenly">
          {alternative}
          {buttons}
        </div>
      </div>
    </div>
  );
}

export default SimulateTemplate;
