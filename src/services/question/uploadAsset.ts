import { StatusCodes } from "http-status-codes";
import { questoes } from "../urls";

export async function uploadAsset(
  file: File,
  token: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${questoes}/assets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (response.status !== StatusCodes.OK && response.status !== StatusCodes.CREATED) {
    throw new Error("Erro ao fazer upload do asset");
  }

  const data = await response.json();
  return `asset://${data.assetId}`;
}
