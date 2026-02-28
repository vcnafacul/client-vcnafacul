import { declarationPhoto } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function submitPhoto(
  photo: File,
  studentId: string,
  token: string,
) {
  const formData = new FormData();
  formData.append("photo", photo);
  formData.append("studentId", studentId);

  const response = await fetchWrapper(declarationPhoto, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let message = "Erro ao enviar foto. Tente novamente.";
    try {
      const data = await response.json();
      if (data?.message && typeof data.message === "string") {
        message = data.message;
      }
    } catch {
      // mantém mensagem padrão
    }
    throw new Error(message);
  }
}
