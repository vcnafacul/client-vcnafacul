import { sendWaitingList } from "@/services/urls";

export async function sendEmailWaitingList(
  inscriptionId: string,
  token: string
): Promise<void> {
  const response = await fetch(`${sendWaitingList}/${inscriptionId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!`);
  }
}
