import { describe, expect, it } from "vitest";
import { Roles, RolesLabel } from "@/enums/roles/roles";
import { adminMenuItems } from "@/pages/dash/data";
import { DASH_PUSH } from "@/routes/path";

describe("permissão enviarNotificacao na interface (FE-06)", () => {
  it("é a mesma chave que a api devolve em `permissao`", () => {
    expect(Roles.enviarNotificacao).toBe("enviarNotificacao");
  });

  it("aparece como permissão de PROJETO na lista de funções", () => {
    expect(RolesLabel).toContainEqual({
      value: Roles.enviarNotificacao,
      label: "Enviar Notificações Push",
      isProjectPermission: true,
    });
  });

  it("⚠️ o item do menu só aparece para quem tem a permissão", () => {
    const itens = adminMenuItems.flatMap((m) => m.subMenuList ?? []);
    const item = itens.find((i) => i.link === `/dashboard/${DASH_PUSH}`);
    expect(item?.permissions).toEqual([Roles.enviarNotificacao]);
  });
});
