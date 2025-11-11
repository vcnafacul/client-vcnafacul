import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ModalImage from "../../components/atoms/modalImage";
import { AlternativeHistorico } from "../../components/molecules/alternativeHistorico";
import { SimulationHistoryHeader } from "../../components/organisms/simulationHistoryHeader";
import SimulateTemplate from "../../components/templates/simulateTemplate";
import {
  AnswerHistoricoDTO,
  HistoricoDTO,
  QuestaoHistorico,
} from "../../dtos/historico/historicoDTO";
import { QuestionBoxStatus } from "../../enums/simulado/questionBoxStatus";
import { useModals } from "../../hooks/useModal";
import { getHistoricoSimuladoById } from "../../services/historico/getHistoricoSimuladoById";
import { getQuestionImage } from "../../services/question/getQuestionImage";
import { useAuthStore } from "../../store/auth";
import { simulateMetricData } from "./data";

export function SimulationHistory() {
  const { historicId } = useParams();
  const [historic, setHistoric] = useState<HistoricoDTO | null>(null);
  const [answerSelected, setAnswerSelected] =
    useState<AnswerHistoricoDTO | null>(null);
  const [questionSelected, setQuestionSelected] =
    useState<QuestaoHistorico | null>(null);
  const [questionImageUrl, setQuestionImageUrl] = useState<string>("");

  const {
    data: { token },
  } = useAuthStore();

  const modals = useModals(["modalImage"]);

  const getStatus = (answer: AnswerHistoricoDTO) => {
    if (answer.questao === questionSelected?._id)
      return QuestionBoxStatus.active;
    else if (!answer.alternativaEstudante) return QuestionBoxStatus.unread;
    else if (answer.alternativaCorreta === answer.alternativaEstudante)
      return QuestionBoxStatus.isRight;
    return QuestionBoxStatus.solved;
  };

  const selectQuestion = (index: number) => {
    const questionSelected = historic!.simulado.questoes[index];
    setQuestionSelected(questionSelected);
    setAnswerSelected(
      historic!.respostas.find((r) => r.questao === questionSelected._id)!
    );
  };

  useEffect(() => {
    if (!historicId) {
      toast.error("historico ID precisa ser diferente de nulo");
    } else {
      getHistoricoSimuladoById(token, historicId)
        .then((res) => {
          setHistoric(res);
          setQuestionSelected(res.simulado.questoes[0]);
          setAnswerSelected(res!.respostas[0]);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    }
  }, [token]);

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

  if (!historic) return <></>;
  return (
    <>
      <SimulateTemplate
        header={<SimulationHistoryHeader historic={historic} />}
        selectQuestion={selectQuestion}
        questions={historic.simulado.questoes.map((q, index) => ({
          id: q._id,
          number: index,
          status: getStatus(
            historic.respostas.find((r) => r.questao === q._id)!
          ),
        }))}
        legends={simulateMetricData.legends}
        questionSelected={questionSelected!}
        questionImageUrl={questionImageUrl}
        alternative={<AlternativeHistorico answer={answerSelected!} />}
        buttons={[]}
        expandedPhoto={() => modals.modalImage.open()}
      />
      {modals.modalImage.isOpen && (
        <ModalImage
          isOpen={modals.modalImage.isOpen}
          handleClose={() => modals.modalImage.close()}
          image={questionImageUrl}
        />
      )}
    </>
  );
}
