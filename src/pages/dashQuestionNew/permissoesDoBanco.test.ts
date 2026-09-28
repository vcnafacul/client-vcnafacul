import { describe, expect, it } from "vitest";
import {
  podeCriarAPartir,
  podeEditarQuestao,
  podeVerBanco,
} from "./permissoesDoBanco";

describe("permissões do banco de questões (023 · 08)", () => {
  it.each([
    ["visualizarQuestao", true, false, false],
    ["visualizarQuestoesCursinho", true, false, false],
    ["editarQuestoesCursinho", true, true, true],
    ["criarQuestao", false, true, true],
    ["validarQuestao", false, true, false],
    ["gerenciarEstudantes", false, false, false],
  ])("%s → ver %s, editar %s, criar a partir %s", (perm, ver, editar, criar) => {
    const p = { [perm]: true };
    expect(podeVerBanco(p)).toBe(ver);
    expect(podeEditarQuestao(p)).toBe(editar);
    expect(podeCriarAPartir(p)).toBe(criar);
  });

  it("sem permissões (ou undefined): nada", () => {
    expect(podeVerBanco(undefined)).toBe(false);
    expect(podeEditarQuestao({})).toBe(false);
  });
});
