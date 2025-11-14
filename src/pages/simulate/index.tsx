import HeaderSimulate from "../../components/molecules/headerSimulate";
import { QuestionBoxStatus } from "../../enums/simulado/questionBoxStatus";

import Text from "../../components/atoms/text";
import Button from "../../components/molecules/button";

import { useModals } from "@/hooks/useModal";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ReactComponent as Report } from "../../assets/icons/warning.svg";
import Alternative from "../../components/atoms/alternative";
import ModalImage from "../../components/atoms/modalImage";
import SimulateTemplate from "../../components/templates/simulateTemplate";
import { DASH, SIMULADO } from "../../routes/path";
import { getQuestionImage } from "../../services/question/getQuestionImage";
import { answerSimulado } from "../../services/simulado/answerSimulado";
import { useAuthStore } from "../../store/auth";
import { Answer, AnswerSimulado, useSimuladoStore } from "../../store/simulado";
import { Alternatives } from "../../types/question/alternative";
import { ModalType } from "../../types/simulado/modalType";
import { simulateData } from "./data";
import ModalReportProblem from "./modals/ModalReportProblem";
import ModalInfo from "./modals/modalInfo";

function Simulate() {
  const {
    data,
    setActive,
    setAnswer,
    nextQuestion,
    confirm,
    priorQuestion,
    isFinish,
    setFinish,
  } = useSimuladoStore();
  const navigate = useNavigate();
  const [tryFinish, setTryFinish] = useState<boolean>(false);
  const [reportModal, setReportModal] = useState<boolean>(false);
  const [questionProblem, setQuestionProblem] = useState<boolean>(false);
  const [questionImageUrl, setQuestionImageUrl] = useState<string>("");
  const {
    data: { token },
  } = useAuthStore();

  const modals = useModals(["modalReportProblem", "modalImage"]);

  const questionSelected = data.questions[data.questionActive];

  // Memoiza a função de status para evitar recriação
  const getStatus = useCallback(
    (viewed: boolean, resolved: boolean, actived: boolean) => {
      if (actived) return QuestionBoxStatus.active;
      else if (resolved) return QuestionBoxStatus.solved;
      else if (viewed) return QuestionBoxStatus.unsolved;
      return QuestionBoxStatus.unread;
    },
    []
  );

  // Memoiza a função de encerrar
  const Encerrar = useCallback(() => {
    const res: Answer[] = data.questions
      .filter((q) => !!q.answered)
      .map((q) => {
        return {
          questao: q._id,
          alternativaEstudante: q.answered!,
        };
      });
    const tempoRealizado = Math.floor(
      (new Date(data.finished).getTime() - new Date(data.started).getTime()) /
        (1000 * 60)
    );
    const body: AnswerSimulado = {
      idSimulado: data._id,
      respostas: res,
      tempoRealizado: tempoRealizado,
    };

    answerSimulado(body, token)
      .catch((error: Error) => {
        toast.error(error.message);
      })
      .finally(() => {
        navigate(`${DASH}/${SIMULADO}`);
      });
  }, [data.questions, data.finished, data.started, data._id, token, navigate]);

  // Memoiza a função de confirmar questão
  const confirmQuestion = useCallback(() => {
    confirm();
    isFinish();
    const solvedCount = data.questions.reduce(
      (acc, obj) => (obj.solved ? acc + 1 : acc),
      0
    );
    if (solvedCount + 1 === data.questions.length) {
      setTryFinish(true);
    }
  }, [confirm, isFinish, data.questions]);

  // Memoiza os modais para evitar recriação
  const dataModal: ModalType[] = useMemo(
    () => [
      {
        show: !data.finish! && tryFinish && !reportModal,
        title: "Deseja realmente finalizar seu simulado?",
        subTitle: "Você não respondeu todas as questões",
        buttons: [
          {
            onClick: () => setTryFinish(false),
            type: "secondary",
            children: "Nao",
          },
          {
            onClick: () => setFinish(),
            children: "Sim",
          },
        ],
      },
      {
        show: data.finish! && tryFinish && !reportModal,
        title: "Parabens!!! Ocorreu tudo certo com seu simulado?",
        subTitle:
          "Reporte possíveis erros ou traga sugestões para a contínua melhoria da plataforma",
        buttons: [
          {
            onClick: () => Encerrar(),
            children: "Confirmar e Enviar",
          },
          {
            onClick: () => setReportModal(true),
            type: "secondary",
            children: (
              <div className="flex items-center gap-2">
                <span>Reportar problema</span>
                <Report className="w-6 h-6" />
              </div>
            ),
          },
        ],
      },
      {
        show: reportModal && tryFinish,
        title: "Qual tipo de problema gostaria de reportar?",
        subTitle:
          "ocorreu algum problema com alguma questão especifica ou um bug na plataforma?",
        buttons: [
          {
            onClick: () => setTryFinish(false),
            type: "secondary",
            children: (
              <div className="flex items-center gap-2 justify-center">
                <span>Reportar problema</span>
                <Report className="w-6 h-6 transition-all duration-300" />
              </div>
            ),
          },
          {
            onClick: () => {
              setQuestionProblem(false);
              modals.modalReportProblem.open();
            },
            type: "secondary",
            children: (
              <div className="flex items-center gap-2 justify-center">
                <span>Reportar questão</span>
                <Report className="w-6 h-6 transition-all duration-300 group-hover:h-8" />
              </div>
            ),
          },
          {
            onClick: () => setReportModal(false),
            children: <span>Voltar</span>,
          },
        ],
      },
    ],
    [
      data.finish,
      tryFinish,
      reportModal,
      setFinish,
      Encerrar,
      modals.modalReportProblem,
    ]
  );

  const FinishReport = useMemo(() => {
    return dataModal.map((modal, index) => {
      if (modal.show) return <ModalInfo key={index} modal={modal} />;
      else return null;
    });
  }, [dataModal]);

  const ReportProblem = useMemo(() => {
    return !modals.modalReportProblem.isOpen ? null : (
      <ModalReportProblem
        isOpen={modals.modalReportProblem.isOpen}
        handleClose={() => {
          modals.modalReportProblem.close();
        }}
        questionProblem={questionProblem}
        idQuestion={questionSelected._id}
        numberQuestion={questionSelected.numero + 1}
      />
    );
  }, [
    modals.modalReportProblem.isOpen,
    questionProblem,
    questionSelected._id,
    questionSelected.numero,
    modals.modalReportProblem,
  ]);

  const QuestionImageModal = useMemo(() => {
    return !modals.modalImage.isOpen ? null : (
      <ModalImage
        isOpen={modals.modalImage.isOpen}
        handleClose={() => modals.modalImage.close()}
        image={questionImageUrl}
      />
    );
  }, [modals.modalImage.isOpen, questionImageUrl, modals.modalImage]);

  useEffect(() => {
    if (data.questions.length === 0) {
      navigate(SIMULADO);
      toast.warn("Não há Simulado a serem respondido", { theme: "dark" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez ao montar o componente

  useEffect(() => {
    if (questionSelected?.imageId && token) {
      getQuestionImage(questionSelected.imageId, token)
        .then((blob) => {
          const imageUrl = URL.createObjectURL(blob);
          setQuestionImageUrl(imageUrl);
        })
        .catch((error) => {
          toast.error("Erro ao carregar imagem da questão");
          console.error(error);
        });

      // Cleanup da URL anterior
      return () => {
        if (questionImageUrl) {
          URL.revokeObjectURL(questionImageUrl);
        }
      };
    }
  }, [questionSelected?.imageId, token]);

  if (data.questions.length > 0)
    return (
      <>
        <SimulateTemplate
          header={
            <HeaderSimulate
              simulateName={data.title}
              onClick={() => {
                setTryFinish(true);
              }}
            />
          }
          selectQuestion={(number: number) => {
            setActive(number);
          }}
          questions={data.questions.map((quest) => ({
            id: quest._id,
            number: quest.numero,
            status: getStatus(
              quest.viewed,
              quest.solved,
              data.questionActive === quest.numero
            ),
          }))}
          legends={simulateData.legends}
          questionSelected={questionSelected}
          questionImageUrl={questionImageUrl}
          setReportProblem={() => {
            setQuestionProblem(true);
            modals.modalReportProblem.open();
          }}
          expandedPhoto={() => modals.modalImage.open()}
          alternative={
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Text
                size="secondary"
                className="m-0 text-orange w-60 text-start"
              >
                {simulateData.alternativeText}
              </Text>
              <div className="flex gap-4">
                {Alternatives.map((alt, index) => (
                  <Alternative
                    key={index}
                    onClick={() => setAnswer(alt.label)}
                    disabled={data.finish}
                    label={alt.label}
                    select={questionSelected.answered === alt.label}
                  />
                ))}
              </div>
            </div>
          }
          buttons={
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                onClick={priorQuestion}
                typeStyle="secondary"
                className="w-44"
              >
                Voltar
              </Button>
              <Button onClick={nextQuestion} className="w-44">
                Pular
              </Button>
              <Button
                onClick={confirmQuestion}
                disabled={questionSelected.answered === undefined}
                className="transition-all duration-300 bg-lightGreen border-lightGreen w-44 hover:border-green2 hover:bg-green2"
              >
                Confirmar
              </Button>
            </div>
          }
        />
        {FinishReport}
        {ReportProblem}
        {QuestionImageModal}
      </>
    );
}

export default Simulate;
