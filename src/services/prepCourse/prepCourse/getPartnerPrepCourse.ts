import { partnerPrepCourse } from "@/services/urls";
import { PartnerPrepCourse } from "@/types/partnerPrepCourse/partnerPrepCourse";
import fetchWrapper from "@/utils/fetchWrapper";
import { Paginate } from "@/utils/paginate";

/** Uma página; lança se a api não responder 200. */
async function buscarPagina(
  token: string,
  page: number,
  limit: number,
): Promise<Paginate<PartnerPrepCourse>> {
  const url = new URL(partnerPrepCourse);
  const params: Record<string, string | number> = {
    page,
    limit,
  };
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key].toString())
  );
  const res = await fetchWrapper(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status !== 200) {
    throw new Error("Erro ao buscar cursinhos parceiros");
  }
  return await res.json();
}

/** Como sempre foi: em erro, devolve a página vazia (quem já usa conta com isso). */
export async function getPartnerPrepCourse(
  token: string,
  page: number = 1,
  limit: number = 100
): Promise<Paginate<PartnerPrepCourse>> {
  try {
    return await buscarPagina(token, page, limit);
  } catch {
    return {
      data: [] as PartnerPrepCourse[],
      page: 1,
      limit: 0,
      totalItems: 0,
    };
  }
}

/**
 * Todos os cursinhos parceiros, página por página, e **lança** em erro — a
 * lista V2 mostra "tentar de novo" em vez de uma lista vazia que parece real.
 */
export async function getTodosOsCursinhos(
  token: string,
  porPagina = 100,
): Promise<PartnerPrepCourse[]> {
  const todos: PartnerPrepCourse[] = [];
  for (let page = 1; ; page++) {
    const { data, totalItems } = await buscarPagina(token, page, porPagina);
    todos.push(...data);
    if (data.length === 0 || todos.length >= totalItems) return todos;
  }
}

export default getPartnerPrepCourse;
