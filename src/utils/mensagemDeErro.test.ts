import { describe, expect, it } from "vitest";
import { mensagemDeErro } from "./mensagemDeErro";

const padrao = "Erro ao aplicar justificativa";

describe("mensagemDeErro (tickets-documentacao, 07)", () => {
  it("403 diz que falta permissão", () => {
    expect(
      mensagemDeErro({ statusCode: 403, message: "Forbidden resource" }, "aplicar justificativa", padrao),
    ).toBe("Você não tem permissão para aplicar justificativa.");
    expect(mensagemDeErro({ status: 403 }, "atualizar os dados", padrao)).toBe(
      "Você não tem permissão para atualizar os dados.",
    );
  });

  it("outro 4xx mostra a mensagem do servidor", () => {
    expect(
      mensagemDeErro({ statusCode: 400, message: "Data fim deve ser maior" }, "x", padrao),
    ).toBe("Data fim deve ser maior");
    expect(
      mensagemDeErro({ statusCode: 400, message: ["a", "b"] }, "x", padrao),
    ).toBe("a b");
  });

  it("5xx, rede ou desconhecido ficam no texto padrão", () => {
    expect(mensagemDeErro({ statusCode: 500, message: "Internal" }, "x", padrao)).toBe(padrao);
    expect(mensagemDeErro(new Error("Failed to fetch"), "x", padrao)).toBe(padrao);
    expect(mensagemDeErro(undefined, "x", padrao)).toBe(padrao);
  });
});
