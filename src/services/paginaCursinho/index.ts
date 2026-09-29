import fetchWrapper from "@/utils/fetchWrapper";
import { partnerPrepCourse } from "../urls";

export type LinkDaPagina = { titulo: string; url: string };

export type PaginaDoCursinho = {
  slug: string;
  quemSomos: string | null;
  active: boolean;
  nomeDoCursinho: string;
  linksPublicos: LinkDaPagina[];
  linksInternos: LinkDaPagina[];
};

export type SalvarPagina = Omit<PaginaDoCursinho, "nomeDoCursinho">;

const url = `${partnerPrepCourse}/pagina`;

/** A mensagem da api (400/409) vira o texto do erro, para o toast. */
async function falha(response: Response, padrao: string): Promise<never> {
  const corpo = await response.json().catch(() => null);
  const msg = Array.isArray(corpo?.message) ? corpo.message[0] : corpo?.message;
  throw new Error(msg || padrao);
}

export async function getMinhaPagina(token: string): Promise<PaginaDoCursinho> {
  const response = await fetchWrapper(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return falha(response, "Erro ao carregar a página do cursinho");
  return response.json();
}

export async function salvarMinhaPagina(
  token: string,
  pagina: SalvarPagina,
): Promise<PaginaDoCursinho> {
  const response = await fetchWrapper(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(pagina),
  });
  if (!response.ok) return falha(response, "Erro ao salvar a página do cursinho");
  return response.json();
}
