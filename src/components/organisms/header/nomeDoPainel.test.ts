import { describe, expect, it } from "vitest";
import { userNavigationLogged } from "@/pages/homeLegacy/data";
import { comNomeDoPainel, ehColaborador } from "./nomeDoPainel";

const nomes = (colaborador: boolean) =>
  comNomeDoPainel(userNavigationLogged, colaborador).map(
    (i) => i.Home_Menu_Item_id.name,
  );

describe("nome do painel no menu do usuário", () => {
  it("aluno comum vê Painel do Estudante", () => {
    expect(
      ehColaborador(["common", "student"], { visualizarMinhasInscricoes: true }),
    ).toBe(false);
    expect(nomes(false)).toEqual(["Painel do Estudante", "Meu Perfil", "Sair"]);
  });

  it("colaborador de cursinho vê Painel do Colaborador", () => {
    expect(ehColaborador(["common", "collaborator"], {})).toBe(true);
    expect(nomes(true)).toEqual(["Painel do Colaborador", "Meu Perfil", "Sair"]);
  });

  it("equipe do projeto (permissão além das de aluno) também é colaborador", () => {
    expect(ehColaborador(["common"], { validarQuestao: true })).toBe(true);
    expect(ehColaborador(["common"], { validarQuestao: false })).toBe(false);
  });
});
