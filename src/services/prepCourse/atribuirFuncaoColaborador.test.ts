import fetchWrapper from "@/utils/fetchWrapper";
import { partnerPrepCourse } from "@/services/urls";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { atribuirFuncaoColaborador } from "./atribuirFuncaoColaborador";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
const mockedFetch = vi.mocked(fetchWrapper);

const resposta = (status: number, corpo: unknown = {}) =>
  ({ status, json: async () => corpo }) as unknown as Response;

beforeEach(() => mockedFetch.mockReset());

describe("atribuirFuncaoColaborador (convite 02)", () => {
  it("⚠️ usa a rota do CURSINHO, não o user/updateRole da plataforma", async () => {
    mockedFetch.mockResolvedValue(resposta(200));

    await atribuirFuncaoColaborador("ana", "r1", "tok");

    const [url, init] = mockedFetch.mock.calls[0];
    expect(url).toBe(`${partnerPrepCourse}/collaborator-role`);
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(init?.body as string)).toEqual({
      userId: "ana",
      roleId: "r1",
    });
  });

  it("⚠️ a recusa traz o MOTIVO do servidor — não um erro genérico", async () => {
    mockedFetch.mockResolvedValue(
      resposta(403, {
        message: "Você não pode trocar a sua própria função.",
      }),
    );

    await expect(atribuirFuncaoColaborador("eu", "r1", "tok")).rejects.toThrow(
      "Você não pode trocar a sua própria função.",
    );
  });

  it("sem corpo legível, cai numa mensagem padrão", async () => {
    mockedFetch.mockResolvedValue({
      status: 500,
      json: async () => {
        throw new Error("não é json");
      },
    } as unknown as Response);

    await expect(atribuirFuncaoColaborador("ana", "r1", "tok")).rejects.toThrow(
      "Erro ao trocar a função do colaborador",
    );
  });
});
