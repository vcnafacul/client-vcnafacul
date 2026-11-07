import * as yup from "yup";
import { describe, expect, it } from "vitest";
import { socialLinksSchema } from "./socialLinks";

const schema = yup.object(socialLinksSchema);
const valida = (campo: keyof typeof socialLinksSchema, valor: string) =>
  socialLinksSchema[campo].isValidSync(valor);

describe("socialLinksSchema", () => {
  it.each([
    ["instagram", "https://www.instagram.com/cursinho"],
    ["instagram", "instagram.com/cursinho/"],
    ["facebook", "https://m.facebook.com/cursinho"],
    ["facebook", "fb.com/cursinho"],
    ["youtube", "https://youtube.com/@cursinho"],
    ["youtube", "https://youtu.be/abc123"],
    ["linkedin", "https://br.linkedin.com/company/cursinho"],
    ["twitter", "https://twitter.com/cursinho"],
    ["twitter", "x.com/cursinho"],
    ["tiktok", "https://www.tiktok.com/@cursinho"],
    ["site", "cursinho.org.br"],
    ["site", "https://cursinho.org.br/inscricoes?ano=2027"],
  ] as const)("%s aceita %s", (campo, valor) => {
    expect(valida(campo, valor)).toBe(true);
  });

  it.each([
    ["instagram", "@cursinho"],
    ["instagram", "https://facebook.com/cursinho"],
    ["instagram", "https://instagram.com"],
    ["instagram", "https://instagram.com.golpe.io/cursinho"],
    ["facebook", "cursinho"],
    ["youtube", "https://vimeo.com/cursinho"],
    ["twitter", "https://fox.com/cursinho"],
    ["tiktok", "tiktok/cursinho"],
    ["site", "cursinho"],
    ["site", "https://cursinho org.br"],
  ] as const)("%s recusa %s", (campo, valor) => {
    expect(valida(campo, valor)).toBe(false);
  });

  it("vazio continua permitido", () => {
    expect(schema.isValidSync({ site: "", instagram: null })).toBe(true);
  });

  it("completa o https:// e tira espaços", () => {
    expect(
      schema.cast({
        instagram: " instagram.com/cursinho ",
        site: "http://a.org",
      }),
    ).toMatchObject({
      instagram: "https://instagram.com/cursinho",
      site: "http://a.org",
    });
  });
});
