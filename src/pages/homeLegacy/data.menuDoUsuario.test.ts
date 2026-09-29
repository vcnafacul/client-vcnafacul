import { describe, expect, it } from "vitest";
import { DASH } from "@/routes/path";
import { header, userNavigationLogged } from "./data";

describe("menu do usuário logado", () => {
  it("Painel do Estudante, Meu Perfil e Sair, nesta ordem", () => {
    expect(userNavigationLogged.map((i) => i.Home_Menu_Item_id.name)).toEqual([
      "Painel do Estudante",
      "Meu Perfil",
      "Sair",
    ]);
    expect(userNavigationLogged[0].Home_Menu_Item_id.link).toBe(DASH);
  });

  it("o Painel do Estudante não é mais link do header", () => {
    expect(
      header.pageLinks.some((l) => l.Home_Menu_Item_id.name === "Painel do Estudante"),
    ).toBe(false);
  });
});
