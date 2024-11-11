import fetchWrapper from "@/utils/fetchWrapper";
import { inviteMemberAccept } from "../urls";

export async function InviteMemberAccept(token: string) {
  const response = await fetchWrapper(inviteMemberAccept, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    const res = await response.json();
    throw new Error(res.message);
  }
}
