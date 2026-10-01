import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { lazy, ReactNode, Suspense, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
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
  /** Quantas já foram respondidas — o resumo da grade recolhida no celular. */
  respondidas?: number;
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
  respondidas,
}: SimulateTemplateProps) {
  const hasTextContent = !!questionSelected.textoQuestao;
  const acimaDeSm = useAcimaDeSm();
  // No celular abre em texto (ajusta à tela; a imagem pequena pede zoom).
  const [displayMode, setDisplayMode] = useState<"image" | "text">(() =>
    acimaDeSm ? "image" : "text",
  );
  // ⚠️ Questão sem versão em texto mostra a imagem, mesmo no modo texto —
  // senão a troca para uma questão só com imagem deixava a caixa vazia.
  const modo = hasTextContent ? displayMode : "image";
  /*
    No celular a grade (8 por linha, ~12 linhas em 90 questões, ~480px) vinha
    antes de cada questão: fica recolhida, com um resumo, e fecha ao escolher.
  */
  const [gradeAberta, setGradeAberta] = useState(false);
  const mostrarGrade = acimaDeSm || gradeAberta;
  const escolherQuestao = (numero: number) => {
    selectQuestion(numero);
    if (!acimaDeSm) setGradeAberta(false);
  };

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
        {!acimaDeSm && (
          <button
            type="button"
            onClick={() => setGradeAberta(!gradeAberta)}
            aria-expanded={gradeAberta}
            className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 h-11 text-sm font-medium text-marine"
          >
            <span>
              Questões
              {respondidas !== undefined &&
                ` · ${respondidas}/${questions.length} respondidas`}
            </span>
            <FiChevronDown
              className={`h-5 w-5 transition-transform ${gradeAberta ? "rotate-180" : ""}`}
            />
          </button>
        )}
        {mostrarGrade && (
          <>
            <QuestionList selectQuestion={escolherQuestao} questions={questions} />
            <Legends legends={legends} />
          </>
        )}
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
                setDisplayMode(modo === "image" ? "text" : "image")
              }
              className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              {modo === "image" ? "Ver texto" : "Ver imagem"}
            </button>
          )}
        </div>

        {modo === "image" ? (
          <div
            onClick={expandedPhoto}
            className="flex justify-center p-2 sm:p-8 my-4 bg-white rounded-lg cursor-pointer w-full"
          >
            <img
              className="max-w-full"
              src={questionImageUrl}
              alt="Questão"
            />
          </div>
        ) : (
          <div className="w-full p-3 sm:p-6 my-4 bg-white rounded-lg border border-gray-200">
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

        <div className="flex flex-wrap gap-4 my-4 justify-evenly w-full">
          {alternative}
          {buttons}
        </div>
      </div>
    </div>
  );
}

export default SimulateTemplate;
