import { updateWaitingList } from "@/services/urls";

export async function updateWaitingListInfo(
  inscriptionId: string,
  studentId: string,
  waitingList: boolean,
  token: string
) {
  const response = await fetch(updateWaitingList, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id: inscriptionId, studentId, waitingList }),
  });

  if (response.status !== 200) {
    throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!`);
  }
}
