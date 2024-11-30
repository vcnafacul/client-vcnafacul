import { updateOrderWaitingList } from "@/services/urls";

export async function updateOrderWaitingListInfo(
  inscriptionId: string,
  studentsId: string[],
  token: string
) {
  const response = await fetch(updateOrderWaitingList, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id: inscriptionId, studentsId }),
  });

  if (response.status !== 200) {
    throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!`);
  }
}
