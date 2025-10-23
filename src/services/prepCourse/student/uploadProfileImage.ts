import { uploadPhotoProfile as url } from "@/services/urls";

export async function uploadProfileImage(
  photo: File, // Foto da carteirinha
  studentId: string,
  token: string // Token de autenticação
) {
  // Criação de FormData para anexar os arquivos
  const formData = new FormData();
  formData.append("file", photo);
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
  return await response.text();
}
