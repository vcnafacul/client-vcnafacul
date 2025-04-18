import { declaredInterest as url } from "@/services/urls";

export async function declaredInterest(
  files: File[], // Lista de arquivos a serem enviados
  photo: File, // Foto da carteirinha
  areaInterest: string[],
  selectedCursos: string[],
  studentId: string,
  token: string // Token de autenticação
) {
  // Criação de FormData para anexar os arquivos
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
  // Envio da requisição
  const response = await fetch(url, {
    method: "PATCH", // Método HTTP para upload
    headers: {
      Authorization: `Bearer ${token}`, // Cabeçalho com o token JWT
    },
    body: formData, // Corpo da requisição com os arquivos
  });

  // Verificação do status da resposta
  if (response.status !== 200) {
    throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!`);
  }
}
