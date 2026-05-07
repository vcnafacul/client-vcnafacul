import { getNews } from "../../../services/news/getNews";
import { News } from "../../../dtos/news/news";

export type NewsCategory = "DESTAQUE" | "NOTÍCIA" | "EVENTO" | "PARCERIA";

export interface NewsItem {
  id: string;
  title: string;
  description?: string;
  category: NewsCategory;
  publishedAt?: string;
  href: string;
}

export const newsFallback: NewsItem[] = [];

function formatPt(date: Date | string | undefined): string | undefined {
  if (!date) return undefined;
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export async function fetchNews(): Promise<NewsItem[]> {
  const res = await getNews();
  const items: News[] = Array.isArray(res)
    ? (res as News[])
    : ((res as { data?: News[] })?.data ?? []);

  const now = Date.now();
  const visible = items
    .filter((n) => n.actived !== false)
    .filter((n) => {
      if (!n.expireAt) return true;
      const exp = new Date(n.expireAt).getTime();
      return Number.isNaN(exp) || exp >= now;
    });

  const sorted = [...visible].sort((a, b) => {
    if (a.destaque === b.destaque) return 0;
    return a.destaque ? -1 : 1;
  });

  const hasExplicitDestaque = sorted.some((n) => n.destaque);

  return sorted.map((n, idx) => {
    const isFeatured = n.destaque || (!hasExplicitDestaque && idx === 0);
    return {
      id: String(n.id),
      title: n.title,
      description: n.description ?? undefined,
      category: isFeatured ? "DESTAQUE" : "NOTÍCIA",
      publishedAt: formatPt(n.createdAt),
      href: "/novidades",
    };
  });
}
