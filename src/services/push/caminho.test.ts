import { describe, expect, it } from "vitest";
import { caminhoInterno } from "./caminho";

describe("caminhoInterno (clique no toast de primeiro plano)", () => {
  it("caminho do site vira rota do router", () => {
    expect(caminhoInterno("/simulados?x=1#a")).toBe("/simulados?x=1#a");
    expect(caminhoInterno(`${window.location.origin}/perfil`)).toBe("/perfil");
  });

  it("sem url → raiz", () => {
    expect(caminhoInterno(undefined)).toBe("/");
  });

  it("⚠️ url de fora do site → não navega", () => {
    expect(caminhoInterno("https://golpe.example/x")).toBeNull();
    expect(caminhoInterno("//golpe.example/x")).toBeNull();
  });
});
