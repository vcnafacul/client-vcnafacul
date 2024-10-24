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
      createdAt: student.createdAt,
      email: student.email,
      cpf: student.cpf,
      rg: student.rg,
      uf: student.uf,
      urgencyPhone: student.urgencyPhone,
      whatsapp: student.whatsapp,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      socialName: student.user.socialName,
      birthday: student.user.birthday,
      gender: student.user.gender === 0 ? "Feminino" :  student.user.gender === 1 ? "Masculino" : "Outro",
      phone: student.user.phone,
      neighborhood: student.user.neighborhood,
      street: student.user.street,
      number: student.user.number,
      complement: student.user.complement,
      postalCode: student.user.postalCode,
      city: student.user.city,
      state: student.user.state,
      socioeconomic: JSON.parse(student.socioeconomic),
    }));
  }
  throw new Error(`Erro ao tentar estudantes inscritos`);
}
