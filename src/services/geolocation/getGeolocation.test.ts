import fetchWrapper from "@/utils/fetchWrapper";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buscarGeoPublico, getGeolocation } from "./getGeolocation";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
const mockedFetch = vi.mocked(fetchWrapper);
beforeEach(() => mockedFetch.mockReset());

const resposta = (status: number, corpo: unknown) =>
  ({ status, json: async () => corpo }) as unknown as Response;

describe("getGeolocation (mapa público)", () => {
  it("⚠️ chama o /geo/public, e não o GET /geo com dados pessoais", async () => {
    mockedFetch.mockResolvedValue(resposta(200, [{ id: "g1" }]));

    const lista = await getGeolocation();

    const url = String(mockedFetch.mock.calls[0][0]);
    expect(url.endsWith("/geo/public")).toBe(true);
    expect(url).not.toContain("status=");
    expect(lista).toEqual([{ id: "g1" }]);
  });

  it("não manda token (é público)", async () => {
    mockedFetch.mockResolvedValue(resposta(200, []));
    await getGeolocation();
    const headers = mockedFetch.mock.calls[0][1]?.headers as Record<
      string,
      string
    >;
    expect(headers.Authorization).toBeUndefined();
  });

  it("falha → lista vazia (o mapa fica sem pins, não quebra)", async () => {
    mockedFetch.mockResolvedValue(resposta(500, {}));
    expect(await getGeolocation()).toEqual([]);
  });
});

describe("buscarGeoPublico (Localiza Cursinho)", () => {
  it("status ≠ 200 lança, para a tela mostrar erro com 'tentar de novo'", async () => {
    mockedFetch.mockResolvedValue(resposta(500, {}));
    await expect(buscarGeoPublico()).rejects.toThrow(/carregar os cursinhos/);
  });
});
