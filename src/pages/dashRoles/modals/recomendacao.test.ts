import { describe, expect, it } from "vitest";
import { EditRoleDto } from "@/dtos/roles/editRole";
import { motivoSemRecomendacao, passosDoSalvar } from "./recomendacao";

const perfil = (over: Partial<EditRoleDto> = {}) =>
  ({ id: "r1", name: "Revisor", alterarPermissao: false, ...over }) as EditRoleDto;

describe("perfil recomendado", () => {
  it("perfil comum do projeto pode", () => {
    expect(motivoSemRecomendacao(perfil())).toBeNull();
  });

  it("aluno e perfil com Alterar Permissão não podem", () => {
    expect(motivoSemRecomendacao(perfil({ name: "aluno" }))).toMatch(/aluno/);
    expect(motivoSemRecomendacao(perfil({ alterarPermissao: true }))).toMatch(
      /Alterar Permissão/,
    );
  });

  it("desmarcar vai antes do perfil; marcar vai depois", () => {
    expect(passosDoSalvar(false, false)).toEqual(["perfil"]);
    expect(passosDoSalvar(true, true)).toEqual(["perfil"]);
    expect(passosDoSalvar(false, true)).toEqual(["perfil", "recomendar"]);
    expect(passosDoSalvar(true, false)).toEqual(["desrecomendar", "perfil"]);
  });
});
