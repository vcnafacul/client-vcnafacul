import { QuestionForm } from "@/types/partnerPrepForm/questionForm";
import { SectionForm } from "@/types/partnerPrepForm/sectionForm";

/**
 * Excluir e alterar uma questão dentro da seção — o mesmo para a linha da
 * tabela (desktop) e o card do celular (`SecoesMobile`).
 */
export function useQuestoesDaSecao(
  section: SectionForm,
  setSection: (section: SectionForm) => void,
  aoFicarVazia: () => void,
) {
  const onDeleteQuestion = (questionId: string) => {
    const newQuestions = section.questions.filter((q) => q._id !== questionId);
    section.questions = newQuestions;
    setSection(section);
    if (newQuestions.length === 0) {
      aoFicarVazia();
    }
  };

  const onChangeQuestion = (question: QuestionForm) => {
    section.questions = section.questions.map((q) =>
      q._id === question._id ? question : q
    );
    setSection(section);
  };

  return { onDeleteQuestion, onChangeQuestion };
}
