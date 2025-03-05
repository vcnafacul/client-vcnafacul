import { classes } from "@/services/urls";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import fetchWrapper from "@/utils/fetchWrapper";
import { Paginate } from "@/utils/paginate";

export async function getAllClasses(
  token: string,
  page: number = 1,
  limit: number = 100
): Promise<Paginate<ClassEntity>> {
  const url = new URL(classes);

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
    const classes: Paginate<ClassEntity> = await response.json();
    return {
      data: classes.data,
      page,
      limit,
      totalItems: classes.totalItems,
    };
  }
  throw new Error(`Erro ao buscar as turmas  - Pagina ${page}`);
}
