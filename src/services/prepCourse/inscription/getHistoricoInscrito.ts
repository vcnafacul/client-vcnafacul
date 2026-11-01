import { subscribers } from "@/services/urls";
import {
  Documents,
  LogStudent,
} from "@/types/partnerPrepCourse/studentCourseFull";
import fetchWrapper from "@/utils/fetchWrapper";

export interface HistoricoInscrito {
  logs: LogStudent[];
  documents: Documents[];
}

/** Logs e documentos de um inscrito, para o modal de detalhes. */
export async function getHistoricoInscrito(
  inscriptionId: string,
  studentId: string,
  token: string
): Promise<HistoricoInscrito> {
  const response = await fetchWrapper(
    `${subscribers}/${inscriptionId}/student/${studentId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.status !== 200) {
    throw new Error("Erro ao buscar documentos e histórico do aluno");
  }
  return await response.json();
}
