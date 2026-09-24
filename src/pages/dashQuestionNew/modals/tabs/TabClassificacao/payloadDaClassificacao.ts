import type { UpdateClassificationData } from "@/services/question/updateClassification";
import type { ClassificacaoFormData } from "./schema";

/**
 * O corpo do `PATCH :id/classification`.
 *
 * ⚠️ **Questão sem vínculo não manda `prova` nem `numero`** (card 02 de
 * `area-enem-da-questao`): o ms só salva a classificação, sem fábrica. Com
 * vínculo, manda o editado — e o ms recusa se faltar, porque quem decide o
 * caminho é o estado da questão, não este corpo.
 */
export function payloadDaClassificacao(
  questaoId: string,
  formData: ClassificacaoFormData,
  temVinculo: boolean,
): UpdateClassificationData {
  return {
    _id: questaoId,
    ...(temVinculo ? { prova: formData.prova, numero: formData.numero } : {}),
    enemArea: formData.enemArea,
    materia: formData.materia,
    frente1: formData.frente1,
    frente2: formData.frente2 || undefined,
    frente3: formData.frente3 || undefined,
    provaClassification: formData.provaClassification,
    subjectClassification: formData.subjectClassification,
    reported: formData.reported,
  };
}
