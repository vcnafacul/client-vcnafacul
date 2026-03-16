import { lazy, ReactNode, Suspense, useState } from "react";
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

const RichTextRenderer = lazy(
  () => import("../../atoms/richTextRenderer/RichTextRenderer")
);

export interface QuestionTemplate {
  _id: string;
  enemArea: string;
  imageId: string;
  numero: number;
  textoQuestao?: string;
  pergunta?: string;
  textoAlternativaA?: string;
  textoAlternativaB?: string;
  textoAlternativaC?: string;
  textoAlternativaD?: string;
  textoAlternativaE?: string;
  contentFormat?: "plain" | "markdown";
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

const ALTERNATIVA_LETRAS = ["A", "B", "C", "D", "E"] as const;

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
  const hasTextContent = !!questionSelected.textoQuestao;
  const [displayMode, setDisplayMode] = useState<"image" | "text">("image");

  const alternativaTextos = hasTextContent
    ? {
        A: questionSelected.textoAlternativaA,
        B: questionSelected.textoAlternativaB,
        C: questionSelected.textoAlternativaC,
        D: questionSelected.textoAlternativaD,
        E: questionSelected.textoAlternativaE,
      }
    : null;

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
        <div className="flex w-full py-4 items-center justify-between">
          <Text size="secondary" className="m-0 text-orange">
            Questao{" "}
            {questions.find((q) => q.id === questionSelected._id)!.number + 1}
          </Text>
          {hasTextContent && (
            <button
              onClick={() =>
                setDisplayMode((m) => (m === "image" ? "text" : "image"))
              }
              className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              {displayMode === "image" ? "Ver texto" : "Ver imagem"}
            </button>
          )}
        </div>

        {displayMode === "image" ? (
          <div
            onClick={expandedPhoto}
            className="flex justify-center p-8 my-4 bg-white rounded-lg cursor-pointer"
          >
            <img
              className="mr-4 sm:m-0"
              src={questionImageUrl}
              alt="Questão"
            />
          </div>
        ) : (
          <div className="w-full p-6 my-4 bg-white rounded-lg border border-gray-200">
            <Suspense
              fallback={<div className="h-20 bg-gray-100 animate-pulse rounded" />}
            >
              <RichTextRenderer
                content={questionSelected.textoQuestao || ""}
                contentFormat={questionSelected.contentFormat || "plain"}
              />
              {questionSelected.pergunta && (
                <div className="mt-4 font-semibold">
                  <RichTextRenderer
                    content={questionSelected.pergunta}
                    contentFormat={questionSelected.contentFormat || "plain"}
                  />
                </div>
              )}
              {alternativaTextos && (
                <div className="mt-4 space-y-2">
                  {ALTERNATIVA_LETRAS.map((letra) => (
                    <div key={letra} className="flex gap-2">
                      <span className="font-bold min-w-[24px]">{letra})</span>
                      <RichTextRenderer
                        content={alternativaTextos[letra] || ""}
                        contentFormat={
                          questionSelected.contentFormat || "plain"
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </Suspense>
          </div>
        )}

        <div className="flex flex-wrap gap-4 my-4 justify-evenly">
          {alternative}
          {buttons}
        </div>
      </div>
    </div>
  );
}

export default SimulateTemplate;
