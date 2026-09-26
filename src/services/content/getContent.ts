import {
  ContentDtoInput,
  ContentDtoInputOrder,
} from "../../dtos/content/contentDtoInput";
import { StatusContent } from "../../enums/content/statusContent";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { content } from "../urls";

export async function getContent(
  token: string,
  status: StatusContent,
  materia: string,
  page: number = 1,
  limit: number = 40
): Promise<Paginate<ContentDtoInput>> {
  const subject = materia ? `&materia=${materia}` : "";
  const response = await fetchWrapper(
    `${content}?status=${status}${subject}&page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar Conteúdos Cadastradas ${res.message}`);
  }
  return res;
}

export async function getContentOrder(
  token: string,
  status?: StatusContent,
  subjectId?: string
): Promise<ContentDtoInputOrder[]> {
  const subject = subjectId ? `&subjectId=${subjectId}` : "";
  const statusQuery = status ? `status=${status}` : "";
  const response = await fetchWrapper(
    `${content}/order?${statusQuery}${subject}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(
      `Erro ao buscar Conteúdos Cadastradas em Ordem ${res.message}`
    );
  }
  return res;
}

/**
 * Todas as páginas de demandas do filtro, numa lista só.
 *
 * ⚠️ O `DashListTemplate` pagina e ordena em memória, e não pede a próxima
 * página no scroll como o V1 fazia. Com só a primeira página, ordenar por
 * "Cadastrado em" ordenaria 100 de N e mentiria sobre o resto — mesmo motivo
 * do `getTodasAsInscricoes`.
 */
export async function getTodoConteudo(
  token: string,
  status: StatusContent,
  materia: string,
  porPagina: number = 100,
): Promise<ContentDtoInput[]> {
  const todos: ContentDtoInput[] = [];
  for (let page = 1; ; page++) {
    const { data, totalItems } = await getContent(
      token,
      status,
      materia,
      page,
      porPagina,
    );
    todos.push(...data);
    // Página vazia também para: um `totalItems` inconsistente não vira laço infinito
    if (data.length === 0 || todos.length >= totalItems) return todos;
  }
}
