import { ClassEntityOutput } from "@/dtos/classes/classOutput";
import { classes } from "@/services/urls";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import fetchWrapper from "@/utils/fetchWrapper";

export async function createClass(
  token: string,
  entity: ClassEntityOutput
): Promise<ClassEntity> {
  const response = await fetchWrapper(classes, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: entity.name,
      description: entity.description,
      startDate: entity.range[0],
      endDate: entity.range[1],
      year: entity.year,
    }),
  });
  if (response.status === 400) {
    const res = await response.json();
    throw new Error(res.message);
  }
  if (response.status !== 201) {
    throw new Error("Erro ao tentar criar turma");
  }
  const res = await response.json();
  return {
    id: res.id,
    name: res.name,
    description: res.description,
    startDate: res.startDate,
    endDate: res.endDate,
    year: res.year,
    number_students: 0,
  } as ClassEntity;
}
