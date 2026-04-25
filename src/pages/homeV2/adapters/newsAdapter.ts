import { getNews } from "../../../services/news/getNews";
import { homeContentFile } from "../../../services/urls";
import { News } from "../../../dtos/news/news";

export type NewsCategory = "DESTAQUE" | "NOTÍCIA" | "EVENTO" | "PARCERIA";

export interface NewsItem {
  id: string;
  title: string;
  category: NewsCategory;
  thumbnailUrl?: string;
  publishedAt?: string;
  href: string;
}

export const newsFallback: NewsItem[] = [];

function inferCategory(session: string | undefined | null): NewsCategory {
  const t = (session ?? "").toString().toUpperCase();
  if (t.includes("DESTAQUE")) return "DESTAQUE";
  if (t.includes("EVENTO")) return "EVENTO";
  if (t.includes("PARCEIR")) return "PARCERIA";
  return "NOTÍCIA";
}

function formatPt(date: Date | string | undefined): string | undefined {
  if (!date) return undefined;
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export async function fetchNews(): Promise<NewsItem[]> {
  const res = await getNews();
  const items: News[] = res?.data ?? [];
  return items
    .filter((n) => n.actived !== false)
    .map((n) => ({
      id: String(n.id),
      title: n.title,
      category: inferCategory(n.session),
      thumbnailUrl: n.fileName ? homeContentFile(n.fileName) : undefined,
      publishedAt: formatPt(n.createdAt),
      href: "/novidades",
    }));
}
