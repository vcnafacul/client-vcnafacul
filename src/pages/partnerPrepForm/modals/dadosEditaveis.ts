import { ComplexCondition } from "@/types/partnerPrepForm/condition";
import {
  AnswerCollectionType,
  QuestionForm,
} from "@/types/partnerPrepForm/questionForm";

/** O que o modal de questão edita. */
export interface EditableFormData {
  text: string;
  helpText: string;
  collection: AnswerCollectionType;
  conditions?: ComplexCondition;
  options: string[];
  active: boolean;
}

/**
 * O que o modal edita, a partir da questão — o mesmo ao abrir e ao Cancelar.
 * Antes o Cancelar remontava sem as condições, e a tela passava a dizer
 * "Nenhuma condição definida" (tickets-documentacao, card 25).
 */
export function dadosEditaveis(question: QuestionForm): EditableFormData {
  return {
    text: question.text,
    helpText: question.helpText || "",
    collection: question.collection,
    conditions: question.conditions || undefined,
    options: question.options || [],
    active: question.active,
  };
}
