import { useEffect, useRef, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { cn } from "@/lib/utils";
import { dashV2 } from "./tokens";
import type { DashFilterBarProps } from "./types";

/**
 * ⚠️ 250ms. Hoje o `Filter` do V1 dispara `onChange` a cada tecla e a tela
 * refiltra a lista inteira a cada caractere.
 */
export const DEBOUNCE_BUSCA_MS = 250;

/**
 * Faixa de filtros — **acima da tabela e separada da toolbar de ações**.
 *
 * ⚠️ É aqui que "Limpar filtros" mora. Em `dashProvas` ele é um botão vermelho
 * no meio dos botões de ação, e ele nem é ação de registro: é controle de
 * filtro. Aqui é link de texto, na ponta direita da própria faixa.
 */
export function DashFilterBar({
  search,
  children,
  activeCount = 0,
  onClear,
}: DashFilterBarProps) {
  const valorExterno = search?.value ?? "";
  const [rascunho, setRascunho] = useState(valorExterno);

  // A tela é dona do valor; se ela mudar por fora (reset de filtros, URL), o
  // campo acompanha.
  useEffect(() => {
    setRascunho(valorExterno);
  }, [valorExterno]);

  // `onChange` vive numa ref para o debounce não reiniciar quando a tela
  // recria o callback a cada render.
  const aoMudarRef = useRef(search?.onChange);
  useEffect(() => {
    aoMudarRef.current = search?.onChange;
  });

  useEffect(() => {
    if (rascunho === valorExterno) return;
    const id = setTimeout(() => aoMudarRef.current?.(rascunho), DEBOUNCE_BUSCA_MS);
    return () => clearTimeout(id);
  }, [rascunho, valorExterno]);

  const mostrarLimpar = activeCount > 0 && !!onClear;

  return (
    <div
      data-testid="dash-filter-bar"
      className={cn(
        "flex flex-wrap items-center gap-3 border-b px-4 py-2",
        dashV2.surface,
        dashV2.border,
      )}
    >
      {search ? (
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <CiSearch
            aria-hidden="true"
            className={cn("pointer-events-none absolute left-2 top-2 h-5 w-5", dashV2.text.muted)}
          />
          <input
            type="search"
            aria-label={search.placeholder ?? "Buscar"}
            placeholder={search.placeholder ?? "Buscar"}
            value={rascunho}
            onChange={(e) => setRascunho(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || !search.onSubmit) return;
              // Entrega o que está no campo e não espera o debounce.
              if (rascunho !== valorExterno) aoMudarRef.current?.(rascunho);
              search.onSubmit(rascunho);
            }}
            className={cn(
              "h-9 w-full rounded-md border pl-8 pr-3 text-sm outline-none",
              dashV2.border,
              dashV2.surface,
              dashV2.text.primary,
              dashV2.focus,
            )}
          />
        </div>
      ) : null}

      {children}

      {/*
        ⚠️ Some quando não há filtro — não fica desabilitado. Desabilitado ocupa
        o espaço, pede uma leitura e não serve para nada.
      */}
      {mostrarLimpar ? (
        <button
          type="button"
          onClick={onClear}
          className={cn(
            "ml-auto shrink-0 rounded-sm text-sm underline-offset-2 hover:underline",
            dashV2.text.primary,
            dashV2.focus,
          )}
        >
          Limpar filtros ({activeCount})
        </button>
      ) : null}
    </div>
  );
}

export default DashFilterBar;
