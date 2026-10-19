import { fireEvent, render, screen } from "@testing-library/react";
import { cloneElement, createContext, useContext, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

/*
  ⚠️ Dublê do Popover: o Popper do Radix custa segundos de CPU no jsdom (memória
  radix-popper-lento-no-jsdom). Este arquivo levou 24,6 s no CI do client#940/#941
  e travou o worker do Vitest ("Timeout calling onTaskUpdate"). O que se testa
  aqui é a busca e a escolha, não o posicionamento.
*/
vi.mock("@/components/ui/popover", () => {
  const Ctx = createContext<{ open: boolean; set: (v: boolean) => void }>({
    open: false,
    set: () => {},
  });
  return {
    Popover: ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (v: boolean) => void; children: ReactNode }) => (
      <Ctx.Provider value={{ open, set: onOpenChange }}>{children}</Ctx.Provider>
    ),
    PopoverTrigger: ({ children }: { children: ReactElement<{ onClick?: () => void }> }) => {
      const { open, set } = useContext(Ctx);
      return cloneElement(children, { onClick: () => set(!open) });
    },
    PopoverContent: ({ children }: { children: ReactNode }) =>
      useContext(Ctx).open ? <div>{children}</div> : null,
  };
});
import { SeletorDeCursinho } from ".";

const cursinhos = [
  { id: "a", name: "Cursinho Alfa" },
  { id: "b", name: "Pré-Vestibular São José" },
];

describe("SeletorDeCursinho (044/06)", () => {
  it("mostra o escolhido, busca e devolve o id; 'Todos' devolve null", () => {
    const onChange = vi.fn();
    render(<SeletorDeCursinho cursinhos={cursinhos} valor="a" onChange={onChange} />);
    const gatilho = screen.getByRole("button", { name: "Cursinho do monitoramento" });
    expect(gatilho).toHaveTextContent("Cursinho Alfa");

    fireEvent.click(gatilho);
    fireEvent.change(screen.getByPlaceholderText("Buscar cursinho"), {
      target: { value: "sao jose" },
    });
    expect(screen.queryByText("Cursinho Alfa", { selector: "li span" })).toBeNull();
    expect(screen.queryByText("Todos os cursinhos", { selector: "li span" })).toBeNull();
    fireEvent.click(screen.getByText("Pré-Vestibular São José"));
    expect(onChange).toHaveBeenLastCalledWith("b");

    fireEvent.click(gatilho);
    fireEvent.click(screen.getByText("Todos os cursinhos", { selector: "li span" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});
