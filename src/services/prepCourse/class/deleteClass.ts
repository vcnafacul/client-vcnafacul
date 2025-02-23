import { classes } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function deleteClass(token: string, id: string): Promise<void> {
  const response = await fetchWrapper(`${classes}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 400) {
    const res = await response.json();
    throw new Error(res.message);
  }
  if (response.status !== 200) {
    throw new Error("Erro ao tentar deletar turma");
  }
}
