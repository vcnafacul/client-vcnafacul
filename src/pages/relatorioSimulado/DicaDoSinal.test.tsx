import { fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ATRASO_MS, DicaDoSinal, posicaoDaDica } from "./DicaDoSinal";

describe("posicaoDaDica", () => {
  const janela = { largura: 1440, altura: 900 };
  const badge = (over: Partial<DOMRect> = {}) =>
    ({ top: 400, bottom: 424, right: 900, left: 800, ...over }) as DOMRect;

  it("⚠️ abre ACIMA do badge quando há espaço", () => {
    const p = posicaoDaDica(badge(), janela, 80);

    expect(p.top).toBeLessThan(400);
  });

  it("⚠️ abre ABAIXO quando não cabe acima", () => {
    // Nas primeiras linhas da tabela não há espaço no topo, e a caixa sairia
    // pela borda da janela.
    const p = posicaoDaDica(badge({ top: 20, bottom: 44 }), janela, 80);

    expect(p.top).toBeGreaterThan(44);
  });

  it("⚠️ alinha à DIREITA do badge — a coluna é a penúltima", () => {
    // Crescendo para a direita, 288px sairiam da tela.
    const p = posicaoDaDica(badge({ right: 900 }), janela, 80);

    expect(p.left).toBe(900 - 288);
  });

  it("⚠️ não sai pela ESQUERDA em janela estreita", () => {
    // Alinhar à direita de um badge perto da borda esquerda jogaria a caixa
    // para fora — trocaria um corte por outro.
    const p = posicaoDaDica(badge({ right: 100 }), { largura: 360, altura: 640 }, 80);

    expect(p.left).toBeGreaterThanOrEqual(0);
  });

  it("⚠️ não sai pela DIREITA quando o badge está colado na borda", () => {
    const p = posicaoDaDica(badge({ right: 1438 }), janela, 80);

    expect(p.left + 288).toBeLessThanOrEqual(1440);
  });
});

describe("DicaDoSinal", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  const montar = (texto = "A alternativa D foi marcada por menos de 5%.") =>
    render(
      <DicaDoSinal texto={texto}>
        <span>Distrator</span>
      </DicaDoSinal>,
    );

  const passarMouse = (el: HTMLElement) => fireEvent.mouseEnter(el);
  const avancar = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

  it(`⚠️ NÃO abre antes de ${ATRASO_MS}ms`, () => {
    // Sem atraso a dica pisca ao arrastar o ponteiro pela tabela, e cinco
    // badges por linha viram um estroboscópio.
    montar();
    passarMouse(screen.getByText("Distrator"));

    avancar(ATRASO_MS - 50);

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it(`abre depois de ${ATRASO_MS}ms`, () => {
    montar();
    passarMouse(screen.getByText("Distrator"));

    avancar(ATRASO_MS);

    expect(screen.getByRole("tooltip")).toHaveTextContent("alternativa D");
  });

  it("⚠️ sair antes do prazo CANCELA — não abre atrasado", () => {
    // Atravessar a tabela rápido abriria uma caixa 300ms depois de o ponteiro
    // já ter ido embora.
    montar();
    const alvo = screen.getByText("Distrator");
    passarMouse(alvo);

    avancar(100);
    fireEvent.mouseLeave(alvo);
    avancar(ATRASO_MS);

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("sair depois de aberta fecha", () => {
    montar();
    const alvo = screen.getByText("Distrator");
    passarMouse(alvo);
    avancar(ATRASO_MS);

    fireEvent.mouseLeave(alvo);

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  describe("⚠️ o corte que motivou este conserto", () => {
    it("a caixa vai para o BODY, não para dentro da célula", () => {
      /*
        O `DashTable` embrulha toda célula não-primária num
        `span.block.truncate`, e `truncate` inclui `overflow: hidden` — que
        cortava a caixa. Nenhum `z-index` resolve: o overflow corta antes de o
        empilhamento entrar na conta.
      */
      const { container } = montar();
      passarMouse(screen.getByText("Distrator"));
      avancar(ATRASO_MS);

      expect(container.querySelector('[role="tooltip"]')).toBeNull();
      expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull();
    });

    it("⚠️ é `fixed`, com coordenadas de viewport", () => {
      // `absolute` voltaria a ser contido pelo primeiro ancestral posicionado —
      // e o portal por si só não basta se a posição for relativa.
      montar();
      passarMouse(screen.getByText("Distrator"));
      avancar(ATRASO_MS);

      const dica = screen.getByRole("tooltip");
      expect(dica.className).toContain("fixed");
      expect(dica.style.top).not.toBe("");
      expect(dica.style.left).not.toBe("");
    });
  });

  it("⚠️ `pointer-events-none` — senão a caixa rouba o hover e pisca", () => {
    montar();
    passarMouse(screen.getByText("Distrator"));
    avancar(ATRASO_MS);

    expect(screen.getByRole("tooltip").className).toContain(
      "pointer-events-none",
    );
  });

  it("⚠️ não sai na impressão", () => {
    montar();
    passarMouse(screen.getByText("Distrator"));
    avancar(ATRASO_MS);

    expect(screen.getByRole("tooltip").className).toContain("print:hidden");
  });

  it("⚠️ desmontar com o timer vivo não avisa estado em componente morto", () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    const { unmount } = montar();
    passarMouse(screen.getByText("Distrator"));

    avancar(100);
    unmount();
    avancar(ATRASO_MS);

    expect(erro).not.toHaveBeenCalled();
    erro.mockRestore();
  });

  it("o conteúdo embrulhado continua renderizando", () => {
    montar();

    expect(screen.getByText("Distrator")).toBeInTheDocument();
  });
});
