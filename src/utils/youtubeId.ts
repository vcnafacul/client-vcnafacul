/**
 * Id do vídeo a partir de um link do YouTube — e só de VÍDEO NORMAL:
 * `youtube.com/watch?v=<id>` (com www, m ou sem) e `youtu.be/<id>`.
 *
 * ⚠️ Shorts, live e embed são recusados de propósito (decisão do Fernando,
 * tickets/049): a lição é um vídeo comum. Nada é consultado no YouTube.
 *
 * Cópia idêntica da api (`simulado/content/youtube-id.ts`), com o mesmo teste.
 */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export function extrairYoutubeId(url: string): string | null {
  let u: URL;
  try {
    u = new URL((url ?? "").trim());
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^(www|m)\./, "");

  let id: string | null = null;
  if (host === "youtube.com" && u.pathname === "/watch") {
    id = u.searchParams.get("v");
  } else if (host === "youtu.be") {
    id = u.pathname.split("/")[1] || null;
  }
  return id && VIDEO_ID.test(id) ? id : null;
}
