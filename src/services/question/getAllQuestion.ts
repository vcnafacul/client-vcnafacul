import { QuestionCardBase } from "@/dtos/question/questionV2Dto";
import type { FilterValues } from "@/pages/dashQuestionNew/components/filtrosDoBanco";
import { StatusEnum } from "../../enums/generic/statusEnum";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { questoes } from "../urls";

/**
 * A listagem do banco de questões. Desde o tickets/043 recebe os filtros num
 * objeto (a lista posicional já tinha 10 argumentos). Só vai na URL o que está
 * preenchido: `todas` (anuladas), revisões vazias e "sem imagem" desmarcado não vão.
 */
export async function getAllQuestions(
  token: string,
  filtros: Partial<FilterValues> = {},
  page: number = 1,
  limit: number = 40,
): Promise<Paginate<QuestionCardBase>> {
  const url = new URL(questoes);

  const params: Record<string, string | number> = { page, limit };
  const f = filtros;
  if (f.status !== undefined && f.status > StatusEnum.All) params.status = f.status;
  if (f.filterText) params.text = f.filterText;
  if (f.materia) params.materia = f.materia;
  if (f.frente) params.frente = f.frente;
  if (f.prova) params.prova = f.prova;
  if (f.enemArea) params.enemArea = f.enemArea;
  if (f.anulada && f.anulada !== "todas") params.anulada = f.anulada;
  if (f.exame) params.exame = f.exame;
  if (f.categoria) params.categoria = f.categoria;
  if (f.revisoes?.length) params.revisoes = f.revisoes.join(",");
  if (f.semImagem) params.semImagem = "true";
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
    const questoes: Paginate<QuestionCardBase> = await response.json();
    return questoes;
  }
  throw new Error(`Erro ao tentar recuperar questões - Pagina ${page}`);
}
