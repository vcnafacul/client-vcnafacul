import { describe, expect, it } from "vitest";
import { opcoesLimpas, opcoesRepetidas } from "./opcoes";
import { motivoDoErro } from "./motivoDoErro";

describe("opções da questão (tickets-documentacao, 26)", () => {
  it("limpa espaços nas pontas e tira as vazias", () => {
    expect(opcoesLimpas([" Sim ", "", "Não", "  "])).toEqual(["Sim", "Não"]);
  });

  it("⚠️ 'Sim' e 'Sim ' são a mesma opção", () => {
    expect(opcoesRepetidas(["Sim", "Sim ", "Não"])).toEqual(["Sim"]);
    expect(opcoesRepetidas(["Sim", "Não"])).toEqual([]);
  });
});

describe("motivoDoErro (tickets-documentacao, 26)", () => {
  it("usa a mensagem do servidor (texto ou lista)", () => {
    expect(
      motivoDoErro({ statusCode: 400, message: "Questão de referência inativa" }, "x"),
    ).toBe("Questão de referência inativa");
    expect(motivoDoErro({ statusCode: 400, message: ["a", "b"] }, "x")).toBe("a b");
    expect(motivoDoErro(new Error("Seção com questões"), "x")).toBe(
      "Seção com questões",
    );
  });

  it("5xx, rede ou desconhecido: texto padrão", () => {
    expect(motivoDoErro({ statusCode: 500, message: "boom" }, "padrão")).toBe("padrão");
    expect(motivoDoErro(new Error("Failed to fetch"), "padrão")).toBe("padrão");
    expect(motivoDoErro(undefined, "padrão")).toBe("padrão");
  });
});
