import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchWrapper = vi.hoisted(() => vi.fn());
vi.mock("../../utils/fetchWrapper", () => ({ default: fetchWrapper }));

import { createProva } from "./createProva";
import { createProvaCursinho } from "./createProvaCursinho";

/**
 * tickets/023, card 09 — antes só o 403 lançava: um 404/400 voltava como se
 * fosse a prova criada, e a tela a punha na lista.
 */
const resposta = (status: number, corpo: unknown) => ({
  status,
  ok: status < 400,
  json: async () => corpo,
});

describe.each([
  ["createProva", createProva],
  ["createProvaCursinho", createProvaCursinho],
])("%s", (_n, criar) => {
  beforeEach(() => fetchWrapper.mockReset());

  it.each([400, 403, 404, 500])("%s → lança com a mensagem da api", async (status) => {
    fetchWrapper.mockResolvedValue(resposta(status, { message: "Categoria não encontrada." }));
    await expect(criar(new FormData(), "tok")).rejects.toThrow("Categoria não encontrada.");
  });

  it("201 → a prova", async () => {
    fetchWrapper.mockResolvedValue(resposta(201, { _id: "p1" }));
    await expect(criar(new FormData(), "tok")).resolves.toEqual({ _id: "p1" });
  });
});
