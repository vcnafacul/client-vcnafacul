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
  materia: number,
  page: number = 1,
  limit: number = 40
): Promise<Paginate<ContentDtoInput>> {
  const subject = materia > -1 ? `&materia=${materia}` : "";
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
  subjectId?: number
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
