import { describe, expect, it, vi } from "vitest";

const f = vi.hoisted(() => vi.fn());
vi.mock("@/utils/fetchWrapper", () => ({ default: f }));

import { getSubscribers } from "./getSubscribers";

const inscrito = (ultimo_email_convocacao: string | null) => ({
  id: "s1",
  socioeconomic: "[]",
  cadastrado_em: "2026-01-01T00:00:00Z",
  data_convocacao: null,
  data_limite_convocacao: null,
  ultimo_email_convocacao,
});

const responder = (corpo: unknown) =>
  f.mockResolvedValue(new Response(JSON.stringify([corpo]), { status: 200 }));

describe("getSubscribers: reenvio pelo ultimo_email_convocacao", () => {
  it("email há 10 minutos → enviado recentemente", async () => {
    responder(inscrito(new Date(Date.now() - 10 * 60 * 1000).toISOString()));
    const [r] = await getSubscribers("t", "i");
    expect(r.sended_email_recently).toBe(true);
  });

  it("email há 2 horas → pode reenviar", async () => {
    responder(inscrito(new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()));
    const [r] = await getSubscribers("t", "i");
    expect(r.sended_email_recently).toBe(false);
  });

  it("sem email → pode reenviar", async () => {
    responder(inscrito(null));
    const [r] = await getSubscribers("t", "i");
    expect(r.sended_email_recently).toBe(false);
  });
});
