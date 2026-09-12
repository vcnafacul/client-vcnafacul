import { beforeEach, describe, expect, it, vi } from "vitest";
import { getQuestionImage } from "./getQuestionImage";
import { questoes } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

vi.mock("@/utils/fetchWrapper", () => ({
  default: vi.fn(),
}));

const mockedFetch = vi.mocked(fetchWrapper);

/** Base64 de um byte qualquer — só precisa ser decodificável por `atob`. */
const BUFFER_B64 = "AA==";

function okResponse() {
  return {
    status: 200,
    json: async () => ({ buffer: BUFFER_B64, contentType: "image/png" }),
  } as unknown as Response;
}

beforeEach(() => {
  mockedFetch.mockReset();
  mockedFetch.mockResolvedValue(okResponse());
});

function urlChamada() {
  return mockedFetch.mock.calls[0][0] as string;
}

describe("getQuestionImage — key de asset com barra (defeito 3)", () => {
  const ASSET_KEY = "assets/990cdfb0-06c6-48a6-ae84-451fde0184a3.png";

  it("encoda a barra para a key caber no `:id` da rota `@Get(':id/image')`", async () => {
    await getQuestionImage(ASSET_KEY, "tok");

    // Sem o encode a URL ganha um segmento a mais e não casa com nenhuma rota → 404.
    expect(urlChamada()).toBe(
      `${questoes}/assets%2F990cdfb0-06c6-48a6-ae84-451fde0184a3.png/image`
    );
    expect(urlChamada()).not.toContain("/assets/");
  });

  it("preserva o segmento `/image` no fim", async () => {
    await getQuestionImage(ASSET_KEY, "tok");
    expect(urlChamada().endsWith("/image")).toBe(true);
  });
});

describe("getQuestionImage — imageId legado", () => {
  const LEGACY_ID = "990cdfb0-06c6-48a6-ae84-451fde0184a3.png";

  it("mantém a URL do caminho legado sem barra intacta", async () => {
    await getQuestionImage(LEGACY_ID, "tok");
    expect(urlChamada()).toBe(`${questoes}/${LEGACY_ID}/image`);
  });

  it("continua mandando o Bearer token", async () => {
    await getQuestionImage(LEGACY_ID, "tok");
    const init = mockedFetch.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer tok"
    );
  });
});

describe("getQuestionImage — erro", () => {
  it("rejeita quando a resposta não é 200, para o chamador poder sinalizar", async () => {
    mockedFetch.mockResolvedValue({
      status: 404,
      json: async () => ({ message: "Not Found" }),
    } as unknown as Response);

    await expect(getQuestionImage("qualquer", "tok")).rejects.toThrow();
  });
});
