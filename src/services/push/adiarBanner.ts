/*
  "Agora não" do banner de notificações (FE-04).

  ⚠️ **Cookie, não `localStorage`.** O `main.tsx` limpa o `localStorage` a
  cada deploy — com ele, o banner voltaria a cada release. O cookie não é
  lido pelo servidor (o front é estático); só vive 30 dias no navegador.
*/
const NOME = "push_banner_adiado";
export const DIAS_ADIADO = 30;

export function bannerAdiado(): boolean {
  return document.cookie.split("; ").some((c) => c === `${NOME}=1`);
}

export function adiarBanner(): void {
  const segundos = DIAS_ADIADO * 24 * 60 * 60;
  document.cookie = `${NOME}=1; max-age=${segundos}; path=/; SameSite=Lax`;
}

export type AlcanceDoBanner = "off" | "colaboradores" | "todos";

/**
 * Rollout do banner (QA-01): `off` no começo (só quem entra em "Minha conta"
 * ativa), depois `colaboradores`, depois `todos`. Valor desconhecido = `off`.
 */
export function alcanceDoBanner(): AlcanceDoBanner {
  const v = import.meta.env.VITE_PUSH_BANNER;
  return v === "colaboradores" || v === "todos" ? v : "off";
}
