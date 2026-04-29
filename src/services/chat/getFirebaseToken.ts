import { firebaseToken } from "../urls";

export async function getFirebaseToken(jwt: string): Promise<string> {
  const res = await fetch(firebaseToken, {
    method: "POST",
    credentials: "include",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!res.ok) throw new Error("Falha ao obter token Firebase");
  const json = await res.json();
  return json.token;
}
