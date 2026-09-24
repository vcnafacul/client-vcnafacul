import { describe, expect, it } from "vitest";
import { abrirNaTrilha, voltarNaTrilha } from "./pilhaDaTrilha";

describe("trilha da linhagem (card 34A)", () => {
  it("abrir empilha", () => {
    expect(abrirNaTrilha(["a"], "b")).toEqual(["a", "b"]);
  });

  it("⚠️ abrir uma questão que já está na pilha VOLTA até ela", () => {
    // Ir e voltar entre v1 e v2 não pode fazer a trilha crescer sem fim.
    expect(abrirNaTrilha(["a", "b", "c"], "a")).toEqual(["a"]);
    expect(abrirNaTrilha(["a", "b", "c"], "b")).toEqual(["a", "b"]);
  });

  it("abrir a própria atual não muda nada", () => {
    expect(abrirNaTrilha(["a", "b"], "b")).toEqual(["a", "b"]);
  });

  it("voltar desempilha", () => {
    expect(voltarNaTrilha(["a", "b", "c"])).toEqual(["a", "b"]);
  });

  it("⚠️ voltar nunca esvazia a trilha", () => {
    expect(voltarNaTrilha(["a"])).toEqual(["a"]);
  });
});
