import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";

import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "./alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "./sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

beforeAll(() => {
  // O jsdom não tem PointerEvent; sem ele o `pointerType` do toque se perde.
  if (!("PointerEvent" in window)) {
    class PointerEventShim extends MouseEvent {
      pointerType: string;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerType = init.pointerType ?? "";
      }
    }
    Object.defineProperty(window, "PointerEvent", { value: PointerEventShim, configurable: true });
  }
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.scrollIntoView ??= () => {};
});

describe("Tooltip", () => {
  it("abre ao tocar, e fecha ao tocar de novo", async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Ajuda</TooltipTrigger>
          <TooltipContent>Texto da ajuda</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const gatilho = screen.getByText("Ajuda");
    fireEvent.pointerDown(gatilho, { pointerType: "touch" });
    fireEvent.click(gatilho);
    await waitFor(() => expect(screen.getAllByText("Texto da ajuda").length).toBeGreaterThan(0));
    fireEvent.pointerDown(gatilho, { pointerType: "touch" });
    fireEvent.click(gatilho);
    await waitFor(() => expect(screen.queryByText("Texto da ajuda")).toBeNull());
  });

  it("abre no foco", async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Ajuda</TooltipTrigger>
          <TooltipContent>Texto da ajuda</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    fireEvent.focusIn(screen.getByText("Ajuda"));
    await waitFor(() => expect(screen.getAllByText("Texto da ajuda").length).toBeGreaterThan(0));
  });
});

describe("DropdownMenu", () => {
  it("abre com itens, rótulo, atalho e item destrutivo", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Ações</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Prova</DropdownMenuLabel>
          <DropdownMenuItem>
            Editar <DropdownMenuShortcut>E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Excluir prova</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    const gatilho = screen.getByText("Ações");
    fireEvent.keyDown(gatilho, { key: "Enter" });
    const excluir = await screen.findByRole("menuitem", { name: "Excluir prova" });
    expect(excluir.className).toContain("text-destructive");
    expect(excluir.className).toContain("min-h-11");
    expect(screen.getByText("Prova")).toBeTruthy();
  });
});

describe("Sheet", () => {
  it.each(["right", "left"] as const)("abre do lado %s com botão Fechar", (side) => {
    render(
      <Sheet open>
        <SheetContent side={side}>
          <SheetTitle>Detalhes</SheetTitle>
          <SheetDescription>Resumo</SheetDescription>
        </SheetContent>
      </Sheet>
    );
    const dialogo = screen.getByRole("dialog");
    expect(dialogo.className).toContain(side === "right" ? "right-0" : "left-0");
    expect(screen.getByRole("button", { name: "Fechar" })).toBeTruthy();
  });
});

describe("AlertDialog", () => {
  it("é pequeno e a ação pode ser destrutiva", () => {
    render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogTitle>Excluir prova</AlertDialogTitle>
          <AlertDialogDescription>Não dá para desfazer.</AlertDialogDescription>
          <AlertDialogAction variant="destructive">Excluir prova</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(screen.getByRole("alertdialog").className).toContain("max-w-[400px]");
    expect(screen.getByRole("button", { name: "Excluir prova" }).className).toContain("bg-destructive");
  });
});
