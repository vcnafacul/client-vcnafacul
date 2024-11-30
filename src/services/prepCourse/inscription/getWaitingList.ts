import { getWaitingList } from "@/services/urls";

export async function getWaitingListInfo(
  inscriptionId: string,
  token: string
): Promise<
  {
    id: string;
    position: number;
    name: string;
  }[]
> {
  const response = await fetch(`${getWaitingList}/${inscriptionId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!`);
  }

  return await response.json();
}
