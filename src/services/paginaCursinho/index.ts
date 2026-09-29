import fetchWrapper from "@/utils/fetchWrapper";
import { cursinhoPagina, partnerPrepCourse } from "../urls";

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

// ---- Página pública (tickets/025, card 07) ----

export type RedeSocial =
  | "site"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "youtube"
  | "twitter"
  | "tiktok";

export type PaginaPublica = {
  cursinhoId: string;
  slug: string;
  nome: string;
  localizacao: string;
  quemSomos: string;
  redes: { rede: RedeSocial; url: string }[];
  linksPublicos: LinkDaPagina[];
  colaboradores: { name: string; description: string | null; image: string | null }[];
  impacto: {
    estudantesAtendidos: number;
    estudantesAtivos: number;
    questoesAprovadas: number | null;
    processosSeletivos: number;
  };
};

const publica = (slug: string) => `${cursinhoPagina}/${encodeURIComponent(slug)}`;

/** `null` = página não existe ou está desativada (a api dá o mesmo 404). */
export async function getPaginaPublica(slug: string): Promise<PaginaPublica | null> {
  const response = await fetchWrapper(publica(slug), { method: "GET" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Erro ao carregar a página do cursinho");
  return response.json();
}

/** `null` = sem vínculo com o cursinho (403): a seção não aparece. */
export async function getLinksInternos(
  slug: string,
  token: string,
): Promise<LinkDaPagina[] | null> {
  const response = await fetchWrapper(`${publica(slug)}/links-internos`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  return response.json();
}
