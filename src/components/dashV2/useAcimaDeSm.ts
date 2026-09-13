import { useEffect, useState } from "react";

/** O `sm` **deste** projeto é 768px, não o default do Tailwind. */
export const SM = "(min-width: 768px)";

/**
 * ⚠️ Media query em JS, e não `hidden sm:flex`.
 *
 * Onde o layout **muda de forma** abaixo de `sm` — a ação que sai da barra e
 * entra no `⋯` (`DashToolbar`), a tabela que vira lista empilhada
 * (`DashTable`) — com CSS puro seria preciso renderizar as duas versões e
 * esconder uma. Duas cópias do mesmo conteúdo no DOM é exatamente o tipo de
 * coisa que mente para leitor de tela: ele lê as duas.
 *
 * ⚠️ Esconder uma **coluna** com `hidden md:table-cell` é outro caso e continua
 * sendo CSS — ali nada é duplicado, a coluna simplesmente some.
 *
 * ⚠️ Extraído do `DashToolbar` para o `DashTable` reusar. Um segundo hook igual
 * é como as duas peças começariam a discordar sobre o que é "mobile".
 */
export function useAcimaDeSm(): boolean {
  const [acima, setAcima] = useState(() =>
    typeof window === "undefined" || typeof window.matchMedia !== "function"
      ? true // sem matchMedia (jsdom, SSR) o desktop é o palpite seguro
      : window.matchMedia(SM).matches,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(SM);
    const aoMudar = (e: MediaQueryListEvent) => setAcima(e.matches);
    setAcima(mql.matches);
    mql.addEventListener?.("change", aoMudar);
    return () => mql.removeEventListener?.("change", aoMudar);
  }, []);

  return acima;
}
