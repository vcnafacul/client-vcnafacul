import fetchWrapper from "@/utils/fetchWrapper";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { FILTROS_VAZIOS } from "@/pages/dashGeo/filtros";
import { getAllGeolocation } from "./getAllGeolocation";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
vi.mock("../urls", () => ({ allGeolocation: "http://api.test/geo" }));
const mockedFetch = vi.mocked(fetchWrapper);
beforeEach(() => mockedFetch.mockReset());

describe("getAllGeolocation (dash de validação)", () => {
  it("⚠️ manda o token: o GET /geo vai exigir login (card 01b)", async () => {
    mockedFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ data: [], page: 1, limit: 40, totalItems: 0 }),
    } as unknown as Response);

    await getAllGeolocation("jwt-do-dash");

    const [url, opcoes] = mockedFetch.mock.calls[0];
    expect((opcoes?.headers as Record<string, string>).Authorization).toBe(
      "Bearer jwt-do-dash",
    );
    expect(new URL(String(url)).searchParams.get("status")).toBe(
      String(StatusEnum.Pending),
    );
  });

  it("manda só os filtros preenchidos, revisões separadas por vírgula", async () => {
    mockedFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ data: [], page: 1, limit: 40, totalItems: 0 }),
    } as unknown as Response);

    await getAllGeolocation("jwt", {
      ...FILTROS_VAZIOS,
      status: StatusEnum.All,
      texto: "  semear ",
      uf: "SP",
      tipo: "0",
      revisoes: ["reportAddress", "reportOther"],
    });

    const params = new URL(String(mockedFetch.mock.calls[0][0])).searchParams;
    expect(Object.fromEntries(params)).toEqual({
      status: "-1",
      text: "semear",
      state: "SP",
      type: "0",
      revisoes: "reportAddress,reportOther",
      page: "1",
      limit: "40",
    });
  });
});
