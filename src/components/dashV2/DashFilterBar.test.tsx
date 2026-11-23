import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DashFilterBar } from "./DashFilterBar";

/** O `sm` do projeto é 768px; o jsdom não tem `matchMedia`, então a largura é injetada. */
function larguraDeTela(acimaDeSm: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      media: query,
      matches: query === "(min-width: 768px)" ? acimaDeSm : !acimaDeSm,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  larguraDeTela(true);
});
afterEach(() => vi.useRealTimers());

function digitar(campo: HTMLElement, texto: string) {
  fireEvent.change(campo, { target: { value: texto } });
}

describe("DashFilterBar — busca com debounce", () => {
  it("não dispara onChange antes dos 400ms", () => {
    const onChange = vi.fn();
    render(<DashFilterBar search={{ value: "", onChange, placeholder: "Buscar prova" }} />);
    const campo = screen.getByLabelText("Buscar prova");

    digitar(campo, "e");
    act(() => void vi.advanceTimersByTime(399));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("três teclas em sequência viram UMA chamada, com o valor final", () => {
    // ⚠️ O `Filter` do V1 dispara a cada tecla e a tela refiltra a lista inteira
    // a cada caractere. Este é o teste que impede isso de voltar.
    const onChange = vi.fn();
    render(<DashFilterBar search={{ value: "", onChange, placeholder: "Buscar prova" }} />);
    const campo = screen.getByLabelText("Buscar prova");

    digitar(campo, "e");
    act(() => void vi.advanceTimersByTime(50));
    digitar(campo, "en");
    act(() => void vi.advanceTimersByTime(50));
    digitar(campo, "ene");
    act(() => void vi.advanceTimersByTime(400));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("ene");
  });

  it("digitação em rajada nunca passa de uma chamada por 400ms", () => {
    const onChange = vi.fn();
    render(<DashFilterBar search={{ value: "", onChange }} />);
    const campo = screen.getByLabelText("Buscar");

    // 10 teclas em 200ms — sem debounce seriam 10 chamadas.
    for (let i = 1; i <= 10; i++) {
      digitar(campo, "a".repeat(i));
      act(() => void vi.advanceTimersByTime(20));
    }
    act(() => void vi.advanceTimersByTime(400));

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("o campo mostra o que foi digitado na hora, sem esperar o debounce", () => {
    // O debounce é do `onChange`, não da digitação: um campo que engasga é
    // corrupção silenciosa de outro tipo.
    const onChange = vi.fn();
    render(<DashFilterBar search={{ value: "", onChange }} />);
    const campo = screen.getByLabelText("Buscar") as HTMLInputElement;

    digitar(campo, "abc");

    expect(campo.value).toBe("abc");
  });

  it("valor trocado por fora sincroniza o campo sem disparar onChange", () => {
    const onChange = vi.fn();
    const { rerender } = render(<DashFilterBar search={{ value: "ene", onChange }} />);
    rerender(<DashFilterBar search={{ value: "", onChange }} />);
    act(() => void vi.advanceTimersByTime(500));

    expect((screen.getByLabelText("Buscar") as HTMLInputElement).value).toBe("");
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("DashFilterBar — limpar filtros", () => {
  it("não aparece com activeCount 0", () => {
    render(<DashFilterBar activeCount={0} onClear={vi.fn()} />);
    expect(screen.queryByText(/Limpar filtros/)).toBeNull();
  });

  it("não aparece com activeCount indefinido", () => {
    render(<DashFilterBar onClear={vi.fn()} />);
    expect(screen.queryByText(/Limpar filtros/)).toBeNull();
  });

  it("aparece com a contagem quando há filtro ativo, e chama onClear", () => {
    const onClear = vi.fn();
    render(<DashFilterBar activeCount={3} onClear={onClear} />);

    const link = screen.getByRole("button", { name: "Limpar filtros (3)" });
    fireEvent.click(link);

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("é link de texto marine, sem vermelho e sem peso de botão", () => {
    // ⚠️ No V1 ele é um botão vermelho no meio das ações de registro — e ele
    // nem é ação de registro.
    render(<DashFilterBar activeCount={2} onClear={vi.fn()} />);
    const link = screen.getByRole("button", { name: "Limpar filtros (2)" });

    expect(link.className).toContain("text-foreground");
    expect(link.className).toContain("hover:underline");
    expect(link.className).not.toMatch(/bg-red|text-red/);
  });
});

describe("DashFilterBar — D22: filtros recolhidos abaixo de 768", () => {
  const filtros = (
    <>
      <select aria-label="Ano">
        <option>2024</option>
      </select>
      <select aria-label="Status">
        <option>Todos</option>
      </select>
    </>
  );

  it("abaixo de 768 só a busca aparece, e 'Mais filtros (2)' revela os outros campos", () => {
    larguraDeTela(false);
    render(
      <DashFilterBar search={{ value: "", onChange: vi.fn() }} activeCount={2}>
        {filtros}
      </DashFilterBar>,
    );

    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.queryByLabelText("Ano")).toBeNull();
    expect(screen.queryByLabelText("Status")).toBeNull();

    const botao = screen.getByRole("button", { name: "Mais filtros (2)" });
    expect(botao).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(botao);

    expect(screen.getByLabelText("Ano")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Menos filtros (2)" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("a busca ativa não entra na conta do botão (ela já está na tela)", () => {
    larguraDeTela(false);
    render(
      <DashFilterBar search={{ value: "ene", onChange: vi.fn() }} activeCount={3}>
        {filtros}
      </DashFilterBar>,
    );
    expect(screen.getByRole("button", { name: "Mais filtros (2)" })).toBeInTheDocument();
  });

  it("sem filtro ativo o botão é só 'Mais filtros'", () => {
    larguraDeTela(false);
    render(
      <DashFilterBar search={{ value: "", onChange: vi.fn() }}>{filtros}</DashFilterBar>,
    );
    expect(screen.getByRole("button", { name: "Mais filtros" })).toBeInTheDocument();
  });

  it("sem filtros além da busca não há botão", () => {
    larguraDeTela(false);
    render(<DashFilterBar search={{ value: "", onChange: vi.fn() }} />);
    expect(screen.queryByRole("button", { name: /Mais filtros/ })).toBeNull();
  });

  it("a partir de 768 os campos ficam na linha e não há botão", () => {
    larguraDeTela(true);
    render(
      <DashFilterBar search={{ value: "", onChange: vi.fn() }} activeCount={2}>
        {filtros}
      </DashFilterBar>,
    );
    expect(screen.getByLabelText("Ano")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Mais filtros/ })).toBeNull();
  });

  it("'Limpar filtros' continua à mostra com os filtros recolhidos", () => {
    larguraDeTela(false);
    render(
      <DashFilterBar search={{ value: "", onChange: vi.fn() }} activeCount={2} onClear={vi.fn()}>
        {filtros}
      </DashFilterBar>,
    );
    expect(screen.getByRole("button", { name: "Limpar filtros (2)" })).toBeInTheDocument();
  });
});

describe("DashFilterBar — foco e composição", () => {
  it("o campo de busca usa o anel laranja, e nenhum anel azul sobra", () => {
    render(<DashFilterBar search={{ value: "", onChange: vi.fn() }} activeCount={1} onClear={vi.fn()} />);

    // O campo com ícone leva o anel na casca (`has-[input:focus-visible]`).
    const casca = screen.getByLabelText("Buscar").parentElement!;
    expect(casca.className).toContain("has-[input:focus-visible]:ring-ring");
    const limpar = screen.getByRole("button", { name: "Limpar filtros (1)" });
    expect(limpar.className).toContain("focus-visible:ring-ring");
    for (const el of [casca, limpar]) {
      expect(el.className).not.toMatch(/ring-blue|focus:ring-blue|outline-blue/);
    }
  });

  it("renderiza os filtros da tela passados como children", () => {
    render(
      <DashFilterBar>
        <select aria-label="Ano">
          <option>2024</option>
        </select>
      </DashFilterBar>,
    );
    expect(screen.getByLabelText("Ano")).toBeInTheDocument();
  });

  it("sem `search` não renderiza campo de busca", () => {
    render(<DashFilterBar activeCount={1} onClear={vi.fn()} />);
    expect(screen.queryByRole("searchbox")).toBeNull();
  });
});

describe("DashFilterBar — Enter na busca (tela de usuários 03)", () => {
  it("⚠️ Enter entrega o texto DO CAMPO, sem esperar o debounce", async () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const { container } = render(
      <DashFilterBar search={{ value: "", onChange, onSubmit }} />,
    );
    const campo = container.querySelector("input[type='search']")!;

    fireEvent.change(campo, { target: { value: "Maria Silva" } });
    fireEvent.keyDown(campo, { key: "Enter" });

    expect(onSubmit).toHaveBeenCalledWith("Maria Silva");
    expect(onChange).toHaveBeenCalledWith("Maria Silva");
  });

  it("sem onSubmit, Enter não faz nada", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DashFilterBar search={{ value: "", onChange }} />,
    );

    fireEvent.keyDown(container.querySelector("input[type='search']")!, {
      key: "Enter",
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});
