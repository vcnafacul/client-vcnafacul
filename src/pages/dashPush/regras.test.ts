import { describe, expect, it } from "vitest";
import {
  RASCUNHO_VAZIO,
  descricaoDoPublico,
  emailsDoTexto,
  errosDo,
  publicoDo,
} from "./regras";

const ok = {
  ...RASCUNHO_VAZIO,
  title: "Aviso",
  body: "Corpo",
  roleIds: ["r1"],
};

describe("regras da tela de envio", () => {
  it("e-mails: linha, vírgula e ponto e vírgula; sem repetidos; minúsculas", () => {
    expect(emailsDoTexto(" A@x.com\nb@x.com, a@x.com ; \n\n")).toEqual([
      "a@x.com",
      "b@x.com",
    ]);
  });

  it("rascunho válido não tem erros", () => {
    expect(errosDo(ok)).toEqual({});
  });

  it("título e corpo: obrigatórios e com limite (100/500)", () => {
    expect(errosDo({ ...ok, title: " " }).title).toBeDefined();
    expect(errosDo({ ...ok, title: "x".repeat(101) }).title).toBeDefined();
    expect(errosDo({ ...ok, title: "x".repeat(100) }).title).toBeUndefined();
    expect(errosDo({ ...ok, body: "" }).body).toBeDefined();
    expect(errosDo({ ...ok, body: "x".repeat(501) }).body).toBeDefined();
  });

  it("⚠️ link: só caminho do site", () => {
    expect(errosDo({ ...ok, url: "/simulados" }).url).toBeUndefined();
    expect(errosDo({ ...ok, url: "https://golpe.example" }).url).toBeDefined();
    expect(errosDo({ ...ok, url: "//golpe.example" }).url).toBeDefined();
  });

  it("público: função sem escolha e e-mail vazio são erros; todos não", () => {
    expect(errosDo({ ...ok, roleIds: [] }).roleIds).toBeDefined();
    expect(
      errosDo({ ...ok, tipo: "emails", emailsTexto: " , " }).emailsTexto,
    ).toBeDefined();
    expect(errosDo({ ...ok, tipo: "all", roleIds: [] })).toEqual({});
  });

  it("publicoDo monta só os campos do tipo", () => {
    expect(publicoDo({ ...ok, tipo: "all" })).toEqual({ type: "all" });
    expect(publicoDo(ok)).toEqual({ type: "roles", roleIds: ["r1"] });
    expect(
      publicoDo({ ...ok, tipo: "emails", emailsTexto: "A@x.com" }),
    ).toEqual({
      type: "emails",
      emails: ["a@x.com"],
    });
  });

  it("descrição do público no histórico", () => {
    expect(descricaoDoPublico({ type: "all" })).toBe("Todos");
    expect(descricaoDoPublico({ type: "emails", emails: ["a@x", "b@x"] })).toBe(
      "2 e-mails",
    );
    expect(
      descricaoDoPublico({ type: "roles", roleIds: ["r1"] }, () => "Admin"),
    ).toBe("Funções: Admin");
  });
});
