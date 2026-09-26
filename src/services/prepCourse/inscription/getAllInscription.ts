import { inscriptionCourse } from "@/services/urls";
import { Inscription } from "@/types/partnerPrepCourse/inscription";
import fetchWrapper from "@/utils/fetchWrapper";
import { Paginate } from "@/utils/paginate";

export async function getAllInscription(
  token: string,
  page: number = 1,
  limit: number = 40
): Promise<Paginate<Inscription>> {
  const url = new URL(inscriptionCourse);
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
    const inscriptions: Paginate<Inscription> = await response.json();
    return {
      /*
        ⚠️ O JSON traz as datas como string ISO, e o tipo `Inscription` diz
        `Date`. Converter aqui faz o tipo dizer a verdade para a tela —
        comparar a string crua com um `Date` dá `NaN` e sempre `false`
        (card 01 da série `tickets/021-dash-v2-processo-seletivo`).
      */
      data: inscriptions.data.map((inscription) => ({
        title: inscription.id,
        ...inscription,
        startDate: new Date(inscription.startDate),
        endDate: new Date(inscription.endDate),
        createdAt: new Date(inscription.createdAt),
        updatedAt: new Date(inscription.updatedAt),
      })),
      page,
      limit,
      totalItems: inscriptions.totalItems,
    };
  }
  throw new Error(`Erro ao tentar recuperar inscrições - Pagina ${page}`);
}
