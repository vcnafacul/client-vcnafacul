import fetchWrapper from "@/utils/fetchWrapper";
import { essay, essayAll, essayImage, essayMy, essayMyCursinho, essayMyStats, essayPrepCourse, essayReview, essayReviews, essaySettings, essaySubmitImage, essayTheme, essayThemeAvailable, essayThemeCurrent } from "../urls";
import { CreateEssayReviewPayload, Essay, EssayListItem, EssayReview, EssaySettingsDto, EssayStats, EssayTheme } from "@/dtos/essay";

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
): Promise<void> {
  const response = await fetchWrapper(`${essayTheme}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (response.status !== 200) throw new Error("Erro ao atualizar tema");
}

export async function deleteTheme(token: string, id: string): Promise<void> {
  const response = await fetchWrapper(`${essayTheme}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200) throw new Error("Erro ao remover tema");
}

export async function getAvailableThemes(token: string): Promise<EssayTheme[]> {
  const response = await fetchWrapper(essayThemeAvailable, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (response.status === 200) return await response.json();
  return [];
}

// ---- Settings ----

export async function getEssaySettings(token: string): Promise<EssaySettingsDto> {
  const response = await fetchWrapper(essaySettings, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200) throw new Error("Erro ao buscar configurações");
  return await response.json();
}

export async function updateEssaySettings(
  token: string,
  data: EssaySettingsDto,
): Promise<EssaySettingsDto> {
  const response = await fetchWrapper(essaySettings, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (response.status !== 200) throw new Error("Erro ao atualizar configurações");
  return await response.json();
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

export async function submitEssayImage(
  token: string,
  themeId: string,
  file: File,
): Promise<Essay> {
  const formData = new FormData();
  formData.append('themeId', themeId);
  formData.append('file', file);

  const response = await fetchWrapper(essaySubmitImage, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (response.status !== 201) throw new Error("Erro ao enviar redação");
  return await response.json();
}

export async function downloadEssayImage(
  token: string,
  essayId: string,
): Promise<void> {
  const response = await fetchWrapper(essayImage(essayId), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200) throw new Error("Erro ao baixar arquivo");

  const blob = await response.blob();
  const contentDisposition = response.headers.get("Content-Disposition");
  const filename =
    contentDisposition?.match(/filename="?(.+?)"?$/)?.[1] ?? `redacao-${essayId}`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

export async function getMyStats(token: string): Promise<EssayStats> {
  const response = await fetchWrapper(essayMyStats, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200) throw new Error("Erro ao buscar estatísticas");
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

// ---- Review endpoints ----

async function fetchEssayList(
  url: string,
  token: string,
  page: number,
  limit: number,
  filters: { themeId?: string; status?: string; search?: string },
): Promise<{ data: EssayListItem[]; total: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.themeId) params.set("themeId", filters.themeId);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  const response = await fetchWrapper(`${url}?${params}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200) throw new Error("Erro ao buscar redacoes");
  return await response.json();
}

export async function getAllEssays(
  token: string,
  page = 1,
  limit = 20,
  filters: { themeId?: string; status?: string; search?: string } = {},
): Promise<{ data: EssayListItem[]; total: number }> {
  return fetchEssayList(essayAll, token, page, limit, filters);
}

export async function getMyCursinhoEssays(
  token: string,
  page = 1,
  limit = 20,
  filters: { themeId?: string; status?: string; search?: string } = {},
): Promise<{ data: EssayListItem[]; total: number }> {
  return fetchEssayList(essayMyCursinho, token, page, limit, filters);
}

export async function getPrepCourseEssays(
  token: string,
  prepCourseId: string,
  page = 1,
  limit = 20,
  filters: { themeId?: string; status?: string; search?: string } = {},
): Promise<{ data: EssayListItem[]; total: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.themeId) params.set("themeId", filters.themeId);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  const response = await fetchWrapper(`${essayPrepCourse(prepCourseId)}?${params}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200) throw new Error("Erro ao buscar redacoes do cursinho");
  return await response.json();
}

export async function getEssayReviews(
  token: string,
  essayId: string,
): Promise<EssayReview[]> {
  const response = await fetchWrapper(essayReviews(essayId), {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200) throw new Error("Erro ao buscar revisoes");
  return await response.json();
}

export async function createHumanReview(
  token: string,
  essayId: string,
  data: CreateEssayReviewPayload,
): Promise<EssayReview> {
  const response = await fetchWrapper(essayReview(essayId), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (response.status !== 201) throw new Error("Erro ao criar revisao");
  return await response.json();
}
