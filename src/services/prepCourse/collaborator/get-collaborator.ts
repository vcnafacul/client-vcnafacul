import { collaborator } from "@/services/urls";
import { Collaborator } from "@/types/partnerPrepCourse/collaborator";
import fetchWrapper from "@/utils/fetchWrapper";
import { Paginate } from "@/utils/paginate";

export async function getCollaborator(
  token: string,
  page: number = 1,
  limit: number = 40
): Promise<Paginate<Collaborator>> {
  const url = new URL(collaborator);
  const params: Record<string, string | number> = {
    page,
    limit,
  };
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key].toString())
  );

  const response = await fetchWrapper(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 200) {
    const collaborators: Paginate<Collaborator> = await response.json();
    return {
      data: collaborators.data,
      page,
      limit,
      totalItems: collaborators.totalItems,
    };
  }
  throw new Error(`Erro ao tentar recuperar colaboradores - Pagina ${page}`);
}

/**
 * Todos os colaboradores do cursinho, página por página (o servidor limita o
 * `limit`). A tela filtra por matéria/frente e busca no client, então precisa
 * da lista inteira — com uma página só, quem passava de 100 nunca aparecia.
 */
export async function getTodosOsColaboradores(
  token: string,
  porPagina = 100,
): Promise<Collaborator[]> {
  const todos: Collaborator[] = [];
  for (let page = 1; ; page++) {
    const { data, totalItems } = await getCollaborator(token, page, porPagina);
    todos.push(...data);
    if (data.length === 0 || todos.length >= totalItems) return todos;
  }
}
