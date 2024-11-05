import { subscribers } from "@/services/urls";
import {
  StudentCourseFull,
  StudentCourseFullDTO,
} from "@/types/partnerPrepCourse/studentCourseFull";
import fetchWrapper from "@/utils/fetchWrapper";

export async function getSubscribers(
  token: string,
  inscriptionId: string
): Promise<StudentCourseFull[]> {
  const response = await fetchWrapper(`${subscribers}/${inscriptionId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 200) {
    const data: StudentCourseFullDTO[] = await response.json();
    return data.map((student) => ({
      cadastrado_em: new Date(student.createdAt),
      email: student.email,
      cpf: student.cpf,
      rg: student.rg,
      uf: student.uf,
      telefone_emergencia: student.urgencyPhone,
      whatsapp: student.whatsapp,
      nome: student.user.firstName,
      sobrenome: student.user.lastName,
      nome_social: student.user.socialName,
      data_nascimento: student.user.birthday,
      genero: student.user.gender === 0 ? "Masculino" :  student.user.gender === 1 ? "Feminino" : "Outro",
      telefone: student.user.phone,
      bairro: student.user.neighborhood,
      rua: student.user.street,
      numero: student.user.number,
      complemento: student.user.complement,
      CEP: student.user.postalCode,
      cidade: student.user.city,
      estado: student.user.state,
      nome_guardiao_legal: student.legalGuardian.fullName,
      telefone_guardiao_legal: student.legalGuardian.phone,
      rg_guardiao_legal: student.legalGuardian.rg || "",
      uf_guardiao_legal: student.legalGuardian.uf || "",
      cpf_guardiao_legal: student.legalGuardian.cpf,
      parentesco_guardiao_legal: student.legalGuardian.family_relationship,
      socioeconomic: JSON.parse(student.socioeconomic),
    }));
  }
  throw new Error(`Erro ao tentar estudantes inscritos`);
}
