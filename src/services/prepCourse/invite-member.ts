import fetchWrapper from "@/utils/fetchWrapper";
import { inviteMember } from "../urls";

export async function InviteMember(email: string, token: string) {
  const response = await fetchWrapper(inviteMember, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email }),
  });
  if (response.status === 500) {
    throw new Error("Erro ao enviar convite, tente novamente mais tarde");
  }
  if (response.status !== 201) {
    const res = await response.json();
    throw new Error(res.message);
  }
}
