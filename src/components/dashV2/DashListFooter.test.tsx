import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashListFooter } from "./DashListFooter";
import { intervaloDaPagina, totalDePaginas } from "./paginacao";

const texto = () =>
  screen.getByTestId("dash-list-footer").querySelector("p")!.textContent;

describe("intervaloDaPagina", () => {
  it("primeira página cheia", () => {
    expect(intervaloDaPagina(1, 25, 128)).toEqual({ inicio: 1, fim: 25 });
  });

  it("página do meio", () => {
    expect(intervaloDaPagina(3, 25, 128)).toEqual({ inicio: 51, fim: 75 });
  });

  it("⚠️ última página: o fim é o total, não pagina × pageSize", () => {
    // `6 * 25` é 150. Sem o `Math.min` o rodapé anuncia "126–150 de 128".
    expect(intervaloDaPagina(6, 25, 128)).toEqual({ inicio: 126, fim: 128 });
  });

  it("total menor que uma página", () => {
    expect(intervaloDaPagina(1, 25, 3)).toEqual({ inicio: 1, fim: 3 });
  });

  it("total exatamente múltiplo do pageSize não perde nem inventa linha", () => {
    expect(intervaloDaPagina(4, 25, 100)).toEqual({ inicio: 76, fim: 100 });
  });
});

describe("totalDePaginas", () => {
  it("arredonda para cima", () => {
    expect(totalDePaginas(128, 25)).toBe(6);
    expect(totalDePaginas(100, 25)).toBe(4);
  });

  it("nunca é zero — página 1 existe mesmo sem registro", () => {
    // Zero páginas faria a `pagina` ser fixada em 0 e o intervalo virar "0–0".
    expect(totalDePaginas(0, 25)).toBe(1);
  });
});

describe("DashListFooter", () => {
  const montar = (pagina: number, total: number, onPageChange = vi.fn()) => {
    render(
      <DashListFooter
        pagina={pagina}
        pageSize={25}
        total={total}
        onPageChange={onPageChange}
      />,
    );
    return onPageChange;
  };

  it("mostra o intervalo da página corrente", () => {
    montar(1, 128);
    expect(texto()).toBe("Mostrando 1–25 de 128");
  });

  it("⚠️ na última página o intervalo para no total", () => {
    montar(6, 128);
    expect(texto()).toBe("Mostrando 126–128 de 128");
  });

  it("some inteiro sem nenhum registro — o vazio da tabela já explicou", () => {
    render(
      <DashListFooter pagina={1} pageSize={25} total={0} onPageChange={vi.fn()} />,
    );
    expect(screen.queryByTestId("dash-list-footer")).toBeNull();
  });

  it("com uma página só, fica a contagem sem controles de navegação", () => {
    montar(1, 3);
    expect(texto()).toBe("Mostrando 1–3 de 3");
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("clicar num número pede a página ao dono do estado", () => {
    const onPageChange = montar(1, 128);
    fireEvent.click(screen.getByText("6"));
    expect(onPageChange).toHaveBeenCalledWith(6);
  });

  it("a contagem é anunciada — trocar de página não move o foco", () => {
    montar(1, 128);
    expect(screen.getByTestId("dash-list-footer").querySelector("p")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });
});
