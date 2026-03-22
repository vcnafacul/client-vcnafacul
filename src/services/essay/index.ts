import fetchWrapper from "@/utils/fetchWrapper";
import { essay, essayMy, essayTheme, essayThemeCurrent } from "../urls";
import { Essay, EssayTheme } from "@/dtos/essay";

// ---- Themes ----

export async function getCurrentTheme(token: string): Promise<EssayTheme | null> {
  const response = await fetchWrapper(essayThemeCurrent, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (response.status === 200) return await response.json();
  return null;
}

export async function getThemes(
  token: string,
  page = 1,
  limit = 10,
): Promise<{ data: EssayTheme[]; total: number }> {
  const response = await fetchWrapper(`${essayTheme}?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200) throw new Error("Erro ao buscar temas");
  return await response.json();
}

export async function createTheme(
  token: string,
  data: Omit<EssayTheme, "id" | "createdAt" | "active">,
): Promise<EssayTheme> {
  const response = await fetchWrapper(essayTheme, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (response.status !== 201) throw new Error("Erro ao criar tema");
  return await response.json();
}

export async function updateTheme(
  token: string,
  id: string,
  data: Partial<EssayTheme>,
): Promise<EssayTheme> {
  const response = await fetchWrapper(`${essayTheme}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (response.status !== 200) throw new Error("Erro ao atualizar tema");
  return await response.json();
}

export async function deleteTheme(token: string, id: string): Promise<void> {
  const response = await fetchWrapper(`${essayTheme}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200) throw new Error("Erro ao remover tema");
}

// ---- Essays ----

export async function createEssay(
  token: string,
  themeId: string,
  title?: string,
  text?: string,
): Promise<Essay> {
  const response = await fetchWrapper(essay, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ themeId, title, text }),
  });
  if (response.status !== 201) throw new Error("Erro ao criar redacao");
  return await response.json();
}

export async function updateDraftEssay(
  token: string,
  essayId: string,
  title: string,
  text: string,
): Promise<void> {
  const response = await fetchWrapper(`${essay}/${essayId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title, text }),
  });
  if (response.status !== 200) throw new Error("Erro ao atualizar rascunho");
}

export async function submitEssay(
  token: string,
  essayId: string,
  title: string,
  text: string,
): Promise<Essay> {
  const response = await fetchWrapper(`${essay}/${essayId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title, text }),
  });
  if (response.status !== 201) throw new Error("Erro ao submeter redacao");
  return await response.json();
}

export async function getMyEssays(
  token: string,
  page = 1,
  limit = 10,
): Promise<{ data: Essay[]; total: number }> {
  const response = await fetchWrapper(`${essayMy}?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200) throw new Error("Erro ao buscar redacoes");
  return await response.json();
}

export async function getEssayById(token: string, id: string): Promise<Essay> {
  const response = await fetchWrapper(`${essay}/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200) throw new Error("Erro ao buscar redacao");
  return await response.json();
}
