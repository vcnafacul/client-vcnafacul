import { get_user_info } from "@/services/urls";
import { UserMe } from "@/types/user/userMe";
import fetchWrapper from "@/utils/fetchWrapper";

const nothasActiveInscription = "No active inscription course";
const alreadyInscribed = "User already inscribed";

export async function getUserInfo(
  inscriptionId: string,
  token: string
): Promise<UserMe> {
  const response = await fetchWrapper(get_user_info(inscriptionId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    switch (res.message) {
      case nothasActiveInscription:
        throw "Não há inscrição ativa para esse curso";
      case alreadyInscribed:
        throw "Usuário já realizou inscrição para esse curso";
      default:
        throw res;
    }
  }
  return res;
}
