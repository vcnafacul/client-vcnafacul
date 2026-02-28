import { declarationDocuments } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function submitDocuments(
  files: File[],
  studentId: string,
  token: string,
) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("studentId", studentId);

  const response = await fetchWrapper(declarationDocuments, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let message = "Erro ao enviar documentos. Tente novamente.";
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
