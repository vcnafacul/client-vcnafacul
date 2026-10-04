import fetchWrapper from "@/utils/fetchWrapper";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cursinhoProva } from "../urls";
import { editarDadosProvaCursinho } from "./editarDadosProvaCursinho";
import { excluirProvaCursinho } from "./excluirProvaCursinho";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
const mockedFetch = vi.mocked(fetchWrapper);

const resposta = (over: Partial<Response> = {}) =>
  ({ ok: true, status: 200, json: async () => ({}), ...over }) as Response;

beforeEach(() => mockedFetch.mockReset());

describe("serviços da prova do cursinho (card 41)", () => {
  it("editar: PATCH na prova, id encodado, só os dados no corpo", async () => {
    mockedFetch.mockResolvedValue(resposta({ json: async () => ({ nome: "N" }) }));

    await expect(
      editarDadosProvaCursinho("p/1", { ano: 2026 }, "tk"),
    ).resolves.toEqual({ nome: "N" });

    const [url, init] = mockedFetch.mock.calls[0];
    expect(url).toBe(`${cursinhoProva}/p%2F1`);
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(init?.body as string)).toEqual({ ano: 2026 });
  });

  it("excluir: DELETE; a recusa repassa a mensagem da api", async () => {
    mockedFetch.mockResolvedValue(
      resposta({
        ok: false,
        status: 409,
        json: async () => ({ message: "a prova está no evento de simulado" }),
      }),
    );

    await expect(excluirProvaCursinho("p1", "tk")).rejects.toThrow(
      "a prova está no evento de simulado",
    );
    const [url, init] = mockedFetch.mock.calls[0];
    expect(url).toBe(`${cursinhoProva}/p1`);
    expect(init?.method).toBe("DELETE");
  });
});
