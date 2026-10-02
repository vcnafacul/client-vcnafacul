import { describe, expect, it } from "vitest";
import type { ConversationDoc } from "@/services/firebase/conversations";
import {
  conversaAbertaDoDestino,
  conversasVisiveis,
  cooldownDoDestino,
  naoLidasDoEstudante,
  nomeDoDestino,
} from "./conversasDoEstudante";

const AGORA = Date.UTC(2026, 9, 2, 12);
const MIN = 60_000;
const DIA = 24 * 60 * MIN;
const ts = (ms: number) => ({ toMillis: () => ms });

const conversa = (o: Partial<ConversationDoc> & { id: string }) =>
  ({
    userId: "u1",
    userName: "Ana",
    status: "open",
    unreadCountStudent: 0,
    unreadCountSupport: 0,
    lastMessageAt: ts(AGORA - MIN),
    ...o,
  }) as ConversationDoc;

describe("conversasVisiveis", () => {
  it("abertas primeiro, mais recente em cima; encerradas há mais de 7 dias saem", () => {
    const lista = conversasVisiveis(
      [
        conversa({
          id: "fechada-2d",
          status: "closed",
          closedAt: ts(AGORA - 2 * DIA),
          lastMessageAt: ts(AGORA - 2 * DIA),
        }),
        conversa({ id: "aberta-velha", lastMessageAt: ts(AGORA - 3 * DIA) }),
        conversa({
          id: "fechada-8d",
          status: "closed",
          closedAt: ts(AGORA - 8 * DIA),
          lastMessageAt: ts(AGORA - 8 * DIA),
        }),
        conversa({ id: "aberta-nova", lastMessageAt: ts(AGORA - MIN) }),
      ],
      AGORA,
    );
    expect(lista.map((c) => c.id)).toEqual([
      "aberta-nova",
      "aberta-velha",
      "fechada-2d",
    ]);
  });
});

describe("conversaAbertaDoDestino", () => {
  const lista = [
    conversa({ id: "cursinho-A", partnerPrepId: "A" }),
    // Documento antigo, sem o campo: é do projeto.
    conversa({ id: "projeto", partnerPrepId: undefined }),
    conversa({ id: "B-fechada", partnerPrepId: "B", status: "closed" }),
  ];

  it("acha a aberta de cada destino; sem o campo conta como projeto", () => {
    expect(conversaAbertaDoDestino(lista, "A")?.id).toBe("cursinho-A");
    expect(conversaAbertaDoDestino(lista, null)?.id).toBe("projeto");
    expect(conversaAbertaDoDestino(lista, "B")).toBeNull();
  });
});

describe("cooldownDoDestino", () => {
  it("15 min depois da última encerrada do MESMO destino; um não bloqueia o outro", () => {
    const lista = [
      conversa({
        id: "a",
        partnerPrepId: "A",
        status: "closed",
        closedAt: ts(AGORA - 5 * MIN),
      }),
      conversa({
        id: "p",
        partnerPrepId: null,
        status: "closed",
        closedAt: ts(AGORA - 20 * MIN),
      }),
    ];
    expect(cooldownDoDestino(lista, "A", AGORA)).toBe(AGORA + 10 * MIN);
    expect(cooldownDoDestino(lista, null, AGORA)).toBeNull();
    expect(cooldownDoDestino(lista, "B", AGORA)).toBeNull();
  });
});

describe("naoLidasDoEstudante e nomeDoDestino", () => {
  it("soma todas as conversas; projeto x cursinho", () => {
    const lista = [
      conversa({ id: "1", unreadCountStudent: 2 }),
      conversa({
        id: "2",
        unreadCountStudent: 3,
        partnerPrepId: "A",
        cursinhoName: "Cursinho Alfa",
      }),
    ];
    expect(naoLidasDoEstudante(lista)).toBe(5);
    expect(nomeDoDestino(lista[0])).toBe("Suporte Você na Facul");
    expect(nomeDoDestino(lista[1])).toBe("Cursinho Alfa");
  });
});
