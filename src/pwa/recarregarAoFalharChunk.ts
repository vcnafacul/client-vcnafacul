const CHAVE = "chunk-reload-em";
/** Abaixo disso, a falha é do build novo também: recarregar viraria loop. */
const INTERVALO_MINIMO_MS = 10_000;

type Dependencias = {
  janela: Pick<Window, "addEventListener">;
  armazenamento: Pick<Storage, "getItem" | "setItem">;
  recarregar: () => void;
  agora: () => number;
};

/**
 * Aba aberta durante um deploy continua com o index antigo, que aponta para
 * chunks que o deploy apagou (`rsync --delete` em `assets/`). Ao abrir uma
 * rota `lazy`, o import dá 404 e a tela quebra. O Vite avisa com
 * `vite:preloadError`: recarregar busca o index novo.
 *
 * ⚠️ Uma vez a cada 10s no máximo: se o chunk falhar de novo logo depois do
 * reload, o erro segue para a tela em vez de recarregar sem parar.
 */
export function recarregarAoFalharChunk({
  janela,
  armazenamento,
  recarregar,
  agora,
}: Dependencias): void {
  janela.addEventListener("vite:preloadError", (evento) => {
    const ultimo = Number(armazenamento.getItem(CHAVE) ?? 0);
    if (agora() - ultimo < INTERVALO_MINIMO_MS) return;

    armazenamento.setItem(CHAVE, String(agora()));
    evento.preventDefault();
    recarregar();
  });
}

export function iniciarRecargaAoFalharChunk(): void {
  recarregarAoFalharChunk({
    janela: window,
    armazenamento: sessionStorage,
    recarregar: () => window.location.reload(),
    agora: Date.now,
  });
}
