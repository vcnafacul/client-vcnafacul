import { ClassEntityOutput } from "@/dtos/classes/classOutput";
import { classes } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function editClass(
  token: string,
  entity: ClassEntityOutput & { id: string }
): Promise<void> {
  const response = await fetchWrapper(classes, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: entity.id,
      name: entity.name,
      description: entity.description,
    }),
  });
  if (response.status === 400) {
    const res = await response.json();
    throw new Error(res.message);
  }
  if (response.status !== 200) {
    throw new Error("Erro ao tentar editar turma");
  }
}
