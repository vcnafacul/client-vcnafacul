import { useEffect, useState } from "react"

/** O `sm` deste projeto é 768px, não o padrão do Tailwind (tickets/059 §2.6). */
export const SM_QUERY = "(min-width: 768px)"

/**
 * Media query em JS onde o layout muda de forma abaixo de 768 (tabela que vira
 * cartões, ação que entra no `⋯`): com CSS as duas versões ficariam no DOM e o
 * leitor de tela leria as duas. Esconder uma coluna continua sendo CSS.
 */
export function useAboveSm(): boolean {
  const [acima, setAcima] = useState(() =>
    typeof window === "undefined" || typeof window.matchMedia !== "function"
      ? true // sem matchMedia (jsdom, SSR) o desktop é o palpite seguro
      : window.matchMedia(SM_QUERY).matches
  )

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return
    const mql = window.matchMedia(SM_QUERY)
    const aoMudar = (e: MediaQueryListEvent) => setAcima(e.matches)
    setAcima(mql.matches)
    mql.addEventListener?.("change", aoMudar)
    return () => mql.removeEventListener?.("change", aoMudar)
  }, [])

  return acima
}
