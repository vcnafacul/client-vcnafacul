import { Prova } from "../../dtos/prova/prova";
import fetchWrapper from "../../utils/fetchWrapper";
import { provaById } from "../urls";

export async function getProvaById(id: string, token: string): Promise<Prova> {
  const response = await fetchWrapper(provaById(id), {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar Prova ${res.message}`);
  }
  return res;
}
