import { describe, expect, it, vi } from "vitest";
import type { ButtonProps } from "@/components/molecules/button";
import { deriveActions, rotuloDoBotao } from "./deriveActions";

const botao = (children: string, extra: Partial<ButtonProps> = {}): ButtonProps => ({
  children,
  onClick: vi.fn(),
  ...extra,
});

describe("deriveActions", () => {
  it("sem buttons não inventa ação nenhuma", () => {
    expect(deriveActions()).toEqual({ secondary: [] });
    expect(deriveActions([])).toEqual({ secondary: [] });
  });

  it("o primeiro typeStyle primary vira a principal; o resto fica secundário na ordem", () => {
    const { primary, secondary } = deriveActions([
      botao("Relatório", { typeStyle: "secondary" }),
      botao("Sincronizar", { typeStyle: "primary" }),
      botao("Nova Prova", { typeStyle: "quaternary" }),
    ]);

    expect(primary?.label).toBe("Sincronizar");
    expect(secondary.map((a) => a.label)).toEqual(["Relatório", "Nova Prova"]);
  });

  it("a segunda primary desce para secundária — no máximo uma principal", () => {
    const { primary, secondary } = deriveActions([
      botao("A", { typeStyle: "primary" }),
      botao("B", { typeStyle: "primary" }),
    ]);
    expect(primary?.label).toBe("A");
    expect(secondary.map((a) => a.label)).toEqual(["B"]);
  });

  it("sem nenhum primary, tudo vira secundário e não há principal", () => {
    const { primary, secondary } = deriveActions([
      botao("A", { typeStyle: "secondary" }),
      botao("B"),
    ]);
    expect(primary).toBeUndefined();
    expect(secondary).toHaveLength(2);
  });

  it("refused vira destructive; o resto não", () => {
    const { secondary } = deriveActions([
      botao("Limpar filtros", { typeStyle: "refused" }),
      botao("Relatório", { typeStyle: "secondary" }),
    ]);
    expect(secondary[0].destructive).toBe(true);
    expect(secondary[1].destructive).toBe(false);
  });

  it("preserva disabled e dispara o onClick original", () => {
    const aoClicar = vi.fn();
    const { secondary } = deriveActions([
      botao("Sincronizar", { disabled: true, onClick: aoClicar }),
    ]);

    expect(secondary[0].disabled).toBe(true);
    secondary[0].onClick();
    expect(aoClicar).toHaveBeenCalledTimes(1);
  });

  it("botão sem onClick não explode ao ser acionado", () => {
    const { secondary } = deriveActions([{ children: "Sem handler" }]);
    expect(() => secondary[0].onClick()).not.toThrow();
  });

  it("os ids são estáveis pela posição — dois botões podem ter o mesmo rótulo", () => {
    const { secondary } = deriveActions([botao("Editar"), botao("Editar")]);
    expect(secondary.map((a) => a.id)).toEqual(["acao-0", "acao-1"]);
    expect(new Set(secondary.map((a) => a.id)).size).toBe(2);
  });

  it("os ids continuam distintos quando um dos botões virou a principal", () => {
    const { primary, secondary } = deriveActions([
      botao("A"),
      botao("B", { typeStyle: "primary" }),
      botao("C"),
    ]);
    expect(primary?.id).toBe("acao-1");
    expect(secondary.map((a) => a.id)).toEqual(["acao-0", "acao-2"]);
  });
});

describe("rotuloDoBotao", () => {
  it("usa o texto quando children é string ou número", () => {
    expect(rotuloDoBotao("Sincronizar", 0)).toBe("Sincronizar");
    expect(rotuloDoBotao(2024, 0)).toBe("2024");
  });

  it("children em JSX cai num rótulo genérico, nunca em botão sem nome", () => {
    // Um botão com `label: ""` fica invisível para leitor de tela e para o
    // `getByRole("button", { name })` de quem for testar a tela.
    expect(rotuloDoBotao(null, 3)).toBe("Ação 4");
  });
});
