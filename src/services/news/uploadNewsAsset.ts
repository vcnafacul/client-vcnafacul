import { StatusCodes } from "http-status-codes";
import { news } from "../urls";

export async function uploadNewsAsset(
  file: File,
  token: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${news}/assets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (
    response.status !== StatusCodes.OK &&
    response.status !== StatusCodes.CREATED
  ) {
    throw new Error("Erro ao fazer upload do asset");
  }

  const data = await response.json();
  return `asset://${data.assetId}`;
}
