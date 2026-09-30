/*
  "Agora não" do convite de instalação (tickets/029, R3).

  ⚠️ Cookie, não `localStorage` — o `main.tsx` limpa o `localStorage` a cada
  deploy (mesmo motivo do `adiarBanner` das notificações). Nome próprio: adiar
  um banner não adia o outro.
*/
const NOME = "app_banner_adiado";
export const DIAS_ADIADO = 30;

export function bannerDoAppAdiado(): boolean {
  return document.cookie.split("; ").some((c) => c === `${NOME}=1`);
}

export function adiarBannerDoApp(): void {
  const segundos = DIAS_ADIADO * 24 * 60 * 60;
  document.cookie = `${NOME}=1; max-age=${segundos}; path=/; SameSite=Lax`;
}
