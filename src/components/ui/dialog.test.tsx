import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Button } from "./button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function Exemplo(props: {
  banner?: React.ReactNode;
  status?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  onOpenChange?: (o: boolean) => void;
  explicitBody?: boolean;
}) {
  const corpo = <p>Conteúdo do corpo</p>;
  return (
    <Dialog open onOpenChange={props.onOpenChange}>
      <DialogContent size={props.size} banner={props.banner}>
        <DialogHeader>
          <DialogTitle>Título</DialogTitle>
          <DialogDescription>Descrição</DialogDescription>
        </DialogHeader>
        {props.explicitBody ? <DialogBody>{corpo}</DialogBody> : corpo}
        <DialogFooter status={props.status}>
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  beforeEach(() => mockMatchMedia(false));

  it("renderiza o banner entre o cabeçalho e o corpo", () => {
    render(<Exemplo banner={<div>2 problemas impedem salvar</div>} />);
    const cabecalho = screen.getByText("Título");
    const banner = screen.getByText("2 problemas impedem salvar");
    const corpo = screen.getByText("Conteúdo do corpo");
    const seguinte = Node.DOCUMENT_POSITION_FOLLOWING;
    expect(cabecalho.compareDocumentPosition(banner) & seguinte).toBeTruthy();
    expect(banner.compareDocumentPosition(corpo) & seguinte).toBeTruthy();
  });

  it("renderiza o status dentro de um aria-live polite", () => {
    render(<Exemplo status="12 presentes · 3 ausentes" />);
    const vivo = screen.getByText("12 presentes · 3 ausentes").closest('[aria-live="polite"]');
    expect(vivo).not.toBeNull();
  });

  it.each([false, true])("cabeçalho e rodapé ficam fora do corpo que rola (corpo explícito: %s)", (explicitBody) => {
    render(<Exemplo explicitBody={explicitBody} />);
    const corpo = screen.getByText("Conteúdo do corpo").closest('[data-slot="dialog-body"]') as HTMLElement;
    expect(corpo).not.toBeNull();
    expect(corpo.className).toContain("overflow-y-auto");
    expect(corpo.contains(screen.getByText("Título"))).toBe(false);
    expect(corpo.contains(screen.getByRole("button", { name: "Salvar" }))).toBe(false);
  });

  it("Esc fecha", async () => {
    const onOpenChange = vi.fn();
    render(<Exemplo onOpenChange={onOpenChange} />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("o botão de fechar tem nome acessível", () => {
    render(<Exemplo />);
    expect(within(screen.getByRole("dialog")).getByRole("button", { name: "Fechar" })).toBeTruthy();
  });

  it("abaixo de 768 o conteúdo recebe a classe de tela cheia", () => {
    mockMatchMedia(true);
    render(<Exemplo />);
    const classes = screen.getByRole("dialog").className;
    expect(classes).toContain("max-sm:h-dvh");
    expect(classes).toContain("max-sm:rounded-none");
  });

  it("a partir de 768 limita a altura a calc(100dvh-2rem)", () => {
    render(<Exemplo />);
    expect(screen.getByRole("dialog").className).toContain("sm:max-h-[calc(100dvh-2rem)]");
  });

  it("md é o tamanho padrão e size muda a largura", () => {
    const { unmount } = render(<Exemplo />);
    expect(screen.getByRole("dialog").className).toContain("max-w-form");
    unmount();
    render(<Exemplo size="lg" />);
    expect(screen.getByRole("dialog").className).toContain("max-w-[800px]");
  });

  it("a tela cheia no celular vence a largura e a altura passadas por quem usa", () => {
    render(
      <Dialog open>
        <DialogContent className="w-[calc(100%-2rem)] max-w-5xl max-h-[90dvh]">
          <DialogTitle>Título</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    const classes = screen.getByRole("dialog").className.split(/\s+/);
    for (const c of ["max-sm:w-full", "max-sm:max-w-none", "max-sm:max-h-none", "max-sm:h-dvh", "max-sm:left-0"]) {
      expect(classes).toContain(c);
    }
  });

  it("sem cabeçalho nem rodapé, os filhos não ganham um corpo que rola", () => {
    render(
      <Dialog open>
        <DialogContent className="p-0 flex flex-col">
          <DialogTitle>Título</DialogTitle>
          <div className="overflow-y-auto">Área própria</div>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByRole("dialog").querySelector('[data-slot="dialog-body"]')).toBeNull();
  });

  it("um DialogBody explícito continua sendo o contêiner que rola, mesmo sem cabeçalho", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogBody>Rola aqui</DialogBody>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText("Rola aqui").className).toContain("overflow-y-auto");
  });
});
