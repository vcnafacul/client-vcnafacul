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
