import { Children, useEffect, useId, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAcimaDeSm } from "./useAcimaDeSm";
import type { DashFilterBarProps } from "./types";

/**
 * ⚠️ 400ms (tickets/059 D22): cada busca refiltra a lista inteira ou baixa
 * tudo de novo do servidor. O `Filter` do V1 disparava a cada tecla.
 */
export const DEBOUNCE_BUSCA_MS = 400;

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
  actions,
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

  // D22: abaixo de 768 só a busca fica à mostra; o resto fica atrás de "Mais
  // filtros (N)". O hook decide só se o botão existe; os campos continuam
  // montados (`hidden`), para o que foi digitado e o debounce em curso
  // sobreviverem a recolher, e para o `aria-controls` apontar para um id real.
  const acimaDeSm = useAcimaDeSm();
  const [aberto, setAberto] = useState(false);
  const idDosFiltros = useId();
  const temFiltros = Children.toArray(children).length > 0;
  const recolhido = !acimaDeSm && temFiltros;
  // A busca ativa já está na tela; o botão conta só o que ele esconde.
  const escondidos = Math.max(0, activeCount - (valorExterno.trim() ? 1 : 0));
  const sufixo = escondidos > 0 ? ` (${escondidos})` : "";

  return (
    <div
      data-testid="dash-filter-bar"
      className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-2"
    >
      {search ? (
        // No celular a busca ocupa a linha inteira e os filtros descem; a
        // partir de 768px (o `sm` do projeto) volta a dividir a linha.
        <div className="min-w-0 flex-1 basis-full sm:max-w-xs sm:basis-auto">
          <Input
            type="search"
            leading={<Search aria-hidden="true" />}
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
          />
        </div>
      ) : null}

      {recolhido ? (
        <Button
          type="button"
          variant="outline"
          aria-expanded={aberto}
          aria-controls={idDosFiltros}
          onClick={() => setAberto(!aberto)}
        >
          {aberto ? "Menos filtros" : "Mais filtros"}
          {sufixo}
        </Button>
      ) : null}

      {recolhido ? (
        <div
          id={idDosFiltros}
          hidden={!aberto}
          className="flex basis-full flex-col gap-3 [&[hidden]]:hidden"
        >
          {children}
        </div>
      ) : (
        children
      )}

      {/*
        ⚠️ Some quando não há filtro — não fica desabilitado. Desabilitado ocupa
        o espaço, pede uma leitura e não serve para nada.
      */}
      {mostrarLimpar || actions ? (
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {actions}
          {mostrarLimpar ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onClear}
              className="shrink-0 text-foreground hover:underline"
            >
              Limpar filtros ({activeCount})
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default DashFilterBar;
