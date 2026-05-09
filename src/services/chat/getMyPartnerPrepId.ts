import { chatMyPartnerPrep } from "../urls";

export async function getMyPartnerPrepId(jwt: string): Promise<string | null> {
  const res = await fetch(chatMyPartnerPrep, {
    method: "GET",
    credentials: "include",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!res.ok) return null;
  const body: { partnerPrepId: string | null } = await res.json();
  return body.partnerPrepId ?? null;
}
