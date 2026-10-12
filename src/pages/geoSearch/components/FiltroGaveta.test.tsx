import { TypeMarker } from "@/types/map/marker";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FiltroGaveta } from "./FiltroGaveta";

const TODOS = [TypeMarker.geo, TypeMarker.univPublic];

function montar(filtros = TODOS, onToggle = vi.fn()) {
  render(
    <div>
      <FiltroGaveta filterMarkers={filtros} onToggle={onToggle} />
      <button type="button">fora</button>
    </div>,
  );
  return { onToggle, aba: () => screen.getByRole("button", { name: /filtros/ }) };
}

const card = () => screen.getByRole("group", { name: "Filtros do mapa", hidden: true });

describe("FiltroGaveta", () => {
  it("nasce fechada: só a aba, e o card fora do Tab e do leitor de tela", () => {
    const { aba } = montar();
    expect(aba()).toHaveAccessibleName("Mostrar filtros");
    expect(aba()).toHaveAttribute("aria-expanded", "false");
    expect(aba()).toHaveAttribute("aria-controls", card().id);
    expect(card()).toHaveAttribute("inert");
  });

  it("a aba abre e fecha", () => {
    const { aba } = montar();
    fireEvent.click(aba());
    expect(aba()).toHaveAttribute("aria-expanded", "true");
    expect(aba()).toHaveAccessibleName("Esconder filtros");
    expect(card()).not.toHaveAttribute("inert");
    fireEvent.click(aba());
    expect(aba()).toHaveAttribute("aria-expanded", "false");
  });

  it("tocar fora fecha; tocar dentro, não", () => {
    const { aba } = montar();
    fireEvent.click(aba());
    fireEvent.pointerDown(screen.getByText("Cursinhos Populares"));
    expect(aba()).toHaveAttribute("aria-expanded", "true");
    fireEvent.pointerDown(screen.getByRole("button", { name: "fora" }));
    expect(aba()).toHaveAttribute("aria-expanded", "false");
  });

  it("Esc fecha e devolve o foco à aba", () => {
    const { aba } = montar();
    fireEvent.click(aba());
    fireEvent.keyDown(document, { key: "Escape" });
    expect(aba()).toHaveAttribute("aria-expanded", "false");
    expect(aba()).toHaveFocus();
  });

  it("as opções alternam o filtro", () => {
    const { aba, onToggle } = montar();
    fireEvent.click(aba());
    fireEvent.click(screen.getByText("Universidades Públicas"));
    expect(onToggle).toHaveBeenCalledWith(TypeMarker.univPublic);
  });

  it("com um tipo desligado, a aba mostra o ponto de 'filtrado'", () => {
    const { container } = render(
      <FiltroGaveta filterMarkers={[TypeMarker.geo]} onToggle={vi.fn()} />,
    );
    expect(container.querySelector('[data-slot="filtrando"]')).not.toBeNull();
  });

  it("com tudo ligado, sem o ponto", () => {
    const { container } = render(
      <FiltroGaveta filterMarkers={TODOS} onToggle={vi.fn()} />,
    );
    expect(container.querySelector('[data-slot="filtrando"]')).toBeNull();
  });
});
