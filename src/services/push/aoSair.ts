import { disablePush } from "./push";

/*
  Push no logout (série `pwa-push`, FE-05).

  ⚠️ **Por que observar o store, e não chamar em cada logout.** São 7 lugares
  que limpam o login (tela /logout, useAuth ×2, fetchWrapper ×2,
  protectedRoute ×2) e todos passam pelo `logout()` do store — a transição
  token → vazio pega todos, inclusive os que ainda vão surgir.

  ⚠️ **Por que a marca em `sessionStorage`.** O logout forçado do fetchWrapper
  faz `window.location.href = …` logo depois de limpar o login: a página é
  descarregada e a limpeza assíncrona morre no meio. A marca é gravada de forma
  síncrona, antes da navegação, e a próxima carga termina o serviço. O
  `main.tsx` limpa só o `localStorage` a cada deploy.

  ⚠️ **Não é "sem token = desativa".** O deploy apaga o `localStorage` e
  desloga todo mundo; tratar isso como logout desativaria o push de todos a
  cada release.
*/

const PENDENTE = "push_desativar_ao_sair";
/** O logout nunca espera o push; isto só limita a tentativa. */
export const LIMITE_MS = 2000;

function comLimite<T>(p: Promise<T>, ms: number): Promise<T | undefined> {
  return Promise.race([
    p,
    new Promise<undefined>((r) => setTimeout(() => r(undefined), ms)),
  ]);
}

function marcar() {
  try {
    sessionStorage.setItem(PENDENTE, "1");
  } catch {
    /* modo privado sem storage: segue só com a tentativa imediata */
  }
}

function desmarcar() {
  try {
    sessionStorage.removeItem(PENDENTE);
  } catch {
    /* idem */
  }
}

export function temDesativacaoPendente(): boolean {
  try {
    return sessionStorage.getItem(PENDENTE) === "1";
  } catch {
    return false;
  }
}

/** Tenta desativar; só tira a marca se terminou dentro do limite. */
export async function desativarAoSair(): Promise<void> {
  let terminou = false;
  try {
    await comLimite(
      disablePush().then(() => {
        terminou = true;
      }),
      LIMITE_MS,
    );
  } catch {
    /* fica a marca: tenta de novo na próxima carga */
  }
  if (terminou) desmarcar();
}

/** Chamar no instante em que o token vira vazio (síncrono até `marcar`). */
export function aoSair(): void {
  marcar();
  void desativarAoSair();
}
