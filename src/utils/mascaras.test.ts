import { describe, expect, it } from "vitest";
import {
  mascararCpf,
  mascararEmail,
  mascararRg,
  mascararTelefone,
} from "./mascaras";

describe("máscaras (iguais às da api)", () => {
  it("CPF esconde os 6 primeiros dígitos", () => {
    expect(mascararCpf("123.456.789-01")).toBe("***.***.789-01");
  });

  it("⚠️ CPF salvo só com dígitos também é mascarado; sem 11 dígitos, tudo oculto", () => {
    expect(mascararCpf("12345678901")).toBe("***.***.789-01");
    expect(mascararCpf("123456789")).toBe("***.***.***-**");
  });

  it("RG mostra só o fim", () => {
    expect(mascararRg("12.345.678-9")).toBe("***.***.78-9");
    expect(mascararRg("1234")).toBe("***.***.***-*");
  });

  it("e-mail mostra a primeira e a última letra do usuário", () => {
    expect(mascararEmail("Fernando@Gmail.com")).toBe("f******o@gmail.com");
    expect(mascararEmail("ab@x.com")).toBe("a*@x.com");
  });

  it("telefone mostra DDD e os 4 últimos", () => {
    expect(mascararTelefone("(11) 99999-1234")).toBe("(11) *****-1234");
    expect(mascararTelefone("123")).toBe("(**) *****-****");
  });

  it("vazio fica vazio", () => {
    expect(mascararCpf(undefined)).toBe("");
    expect(mascararEmail(null)).toBe("");
    expect(mascararTelefone("")).toBe("");
  });

  it("⚠️ valor que já veio mascarado da api não muda", () => {
    expect(mascararTelefone("(11) *****-1234")).toBe("(11) *****-1234");
    expect(mascararEmail("f******o@gmail.com")).toBe("f******o@gmail.com");
    expect(mascararCpf("***.***.789-01")).toBe("***.***.789-01");
  });
});
