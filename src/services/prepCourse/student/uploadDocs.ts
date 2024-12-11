import { uploadDocuments } from "@/services/urls";

export async function uploadDocs(
  files: File[], // Lista de arquivos a serem enviados
  token: string // Token de autenticação
) {
  // Criação de FormData para anexar os arquivos
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  // Envio da requisição
  const response = await fetch(uploadDocuments, {
    method: "POST", // Método HTTP para upload
    headers: {
      Authorization: `Bearer ${token}`, // Cabeçalho com o token JWT
    },
    body: formData, // Corpo da requisição com os arquivos
  });

  // Verificação do status da resposta
  if (response.status !== 201) {
    throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!`);
  }
}
