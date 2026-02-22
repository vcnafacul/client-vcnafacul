import { declaredInterest as url } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function declaredInterest(
  files: File[], // Lista de arquivos a serem enviados
  photo: File | null, // Foto da carteirinha
  areaInterest: string[],
  selectedCursos: string[],
  studentId: string,
  token: string // Token de autenticação
) {
  // Validações antes do envio — evitam "Failed to fetch" por dados inválidos
  if (!token?.trim()) {
    throw new Error("Sessão inválida. Faça login novamente para continuar.");
  }
  if (!photo || !(photo instanceof File)) {
    throw new Error("É obrigatório enviar a foto da carteirinha antes de concluir.");
  }
  if (!studentId?.trim()) {
    throw new Error("Dados da inscrição incompletos. Recarregue a página e tente novamente.");
  }
  if (!url || url.startsWith("undefined")) {
    throw new Error("Configuração da aplicação incompleta. Tente novamente mais tarde.");
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  formData.append("photo", photo);

  areaInterest.forEach((interest) => {
    formData.append("areaInterest", interest);
  });

  selectedCursos.forEach((course) => {
    formData.append("selectedCourses", course);
  });

  formData.append("studentId", studentId);

  // Usa fetchWrapper para: credentials, renovação de token e comportamento igual ao restante do app
  const response = await fetchWrapper(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let message = "Ops, ocorreu um problema na requisição. Tente novamente!";
    try {
      const data = await response.json();
      if (data?.message && typeof data.message === "string") {
        message = data.message;
      }
    } catch {
      // mantém mensagem padrão se o corpo não for JSON
    }
    throw new Error(message);
  }
}
