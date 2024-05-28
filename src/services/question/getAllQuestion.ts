/* eslint-disable @typescript-eslint/no-explicit-any */
import { Question, QuestionDto } from "../../dtos/question/questionDTO";
import { StatusEnum } from "../../enums/generic/statusEnum";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { questoes } from "../urls";

export async function getAllQuestions(
  token: string,
  status: StatusEnum,
  text: string = "",
  page: number = 1,
  limit: number = 40,
  materia: string = "",
  frente: string = "",
  prova: string = "",
  enemArea: string = "",
): Promise<Paginate<Question>> {
  const url = new URL(questoes);

  const params: Record<string, string | number> = {
    page,
    limit,
  };
  if (status > StatusEnum.All) params.status = status;
  if (text) params.text = text;
  if (materia) params.materia = materia;
  if (frente) params.frente = frente;
  if (prova) params.prova = prova;
  if (enemArea) params.enemArea = enemArea;
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
    const questoes: Paginate<Question> = await response.json();
    return {
      data: questoes.data.map((questao: QuestionDto) => ({
        title: `${questao._id} ${questao.numero}`,
        ...questao,
      })),
      page,
      limit,
      totalItems: questoes.totalItems,
    };
  }
  const res = await response.json();
  console.log(res);
  throw new Error(`Erro ao tentar recuperar questões - Pagina ${page}`);
}
