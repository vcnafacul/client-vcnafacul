/**
 * O convite para instalar o app só existe no build de PRODUÇÃO (tickets/029,
 * pedido do Fernando em 2026-09-30) — como o push, que também só funciona lá.
 *
 * O build de prod é `vite build` (modo `production`); homol é
 * `--mode homologation`; local é `development`. Sem variável nova de ambiente.
 */
export function conviteDeInstalacaoLigado(): boolean {
  return import.meta.env.MODE === "production";
}
