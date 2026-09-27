import { describe, expect, it } from "vitest";
import {
  BADGE,
  ICONE_PADRAO,
  TITULO_PADRAO,
  destinoDoClique,
  montarNotificacao,
} from "./notificacao";

const ORIGEM = "https://vcnafacul.com.br";

describe("montarNotificacao", () => {
  it("usa título, corpo, url e tag do payload", () => {
    const n = montarNotificacao({
      title: "Redação corrigida",
      body: "Veja sua nota",
      url: "/dashboard/redacoes",
      tag: "abc",
      notificationId: "42",
    });

    expect(n.titulo).toBe("Redação corrigida");
    expect(n.opcoes).toMatchObject({
      body: "Veja sua nota",
      icon: ICONE_PADRAO,
      badge: BADGE,
      tag: "abc",
      data: { url: "/dashboard/redacoes", notificationId: "42" },
    });
  });

  it("⚠️ payload vazio ainda gera notificação (iOS revoga quem não mostra)", () => {
    const n = montarNotificacao({});

    expect(n.titulo).toBe(TITULO_PADRAO);
    expect(n.opcoes.data.url).toBe("/");
    expect(n.opcoes.tag).toBeUndefined();
  });

  it("ícone do payload substitui o padrão", () => {
    expect(montarNotificacao({ icon: "https://x/i.png" }).opcoes.icon).toBe(
      "https://x/i.png",
    );
  });
});

describe("destinoDoClique", () => {
  it("caminho interno vira URL absoluta da origem", () => {
    expect(destinoDoClique("/simulados", ORIGEM)).toBe(`${ORIGEM}/simulados`);
  });

  it("sem url, abre a raiz", () => {
    expect(destinoDoClique(undefined, ORIGEM)).toBe(`${ORIGEM}/`);
  });

  it("⚠️ url de outra origem não abre nada", () => {
    expect(destinoDoClique("https://golpe.example/login", ORIGEM)).toBeNull();
    expect(destinoDoClique("//golpe.example/login", ORIGEM)).toBeNull();
  });

  it("URL absoluta da própria origem é aceita", () => {
    expect(destinoDoClique(`${ORIGEM}/perfil`, ORIGEM)).toBe(`${ORIGEM}/perfil`);
  });
});
