import { StatusEnum } from "@/enums/generic/statusEnum";
import { subscribers } from "@/services/urls";
import { Gender } from "@/store/auth";
import {
  StudentCourseFullDtoInput,
  XLSXStudentCourseFull,
} from "@/types/partnerPrepCourse/studentCourseFull";
import fetchWrapper from "@/utils/fetchWrapper";

export async function getSubscribers(
  token: string,
  inscriptionId: string
): Promise<XLSXStudentCourseFull[]> {
  const response = await fetchWrapper(`${subscribers}/${inscriptionId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 200) {
    const data: StudentCourseFullDtoInput[] = await response.json();
    return data.map((student) => ({
      ...student,
      genero:
        student.genero === Gender.Male
          ? "Masculino"
          : student.genero === Gender.Female
          ? "Feminino"
          : "Outro",
      deferido:
        student.deferido === StatusEnum.Approved
          ? "Deferido"
          : student.deferido === StatusEnum.Rejected
          ? "Indeferido"
          : "Pendente de análise",
      isento: student.isento ? "Sim" : "Não",
      matriculado: student.matriculado ? "Sim" : "Não",
      convocado: student.convocado ? "Sim" : "Não",
      convocado_antes: student.convocado_antes ? "Sim" : "Não",
      lista_de_espera: student.lista_de_espera ? "Sim" : "Não",
      cadastrado_em: new Date(student.cadastrado_em),
      nome_guardiao_legal: student.nome_guardiao_legal || "",
      telefone_guardiao_legal: student.telefone_guardiao_legal || "",
      rg_guardiao_legal: student.rg_guardiao_legal || "",
      uf_guardiao_legal: student.uf_guardiao_legal || "",
      cpf_guardiao_legal: student.cpf_guardiao_legal || "",
      parentesco_guardiao_legal: student.parentesco_guardiao_legal || "",
      socioeconomic: JSON.parse(student.socioeconomic),
    }));
  }

  throw new Error(`Erro ao tentar estudantes inscritos`);
}
