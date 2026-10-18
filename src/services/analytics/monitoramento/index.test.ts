import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchWrapper = vi.fn();
vi.mock("@/utils/fetchWrapper", () => ({ default: (...a: unknown[]) => fetchWrapper(...a) }));
vi.mock("@/services/urls", () => ({ monitoramento: "http://api/monitoramento" }));

import {
  MonitoramentoIndisponivel,
  MonitoramentoSemPermissao,
  simuladosPorPeriodoDoCursinho,
  ultimosProcessos,
  usuariosPorPerfilDoCursinho,
} from ".";

const resposta = (status: number, corpo: unknown = {}) => ({
  status,
  json: () => Promise.resolve(corpo),
});

describe("serviço do monitoramento por cursinho (044/07)", () => {
  beforeEach(() => fetchWrapper.mockReset());

  it("monta a URL com os parâmetros e omite os vazios", async () => {
    fetchWrapper.mockResolvedValue(resposta(200, []));
    await simuladosPorPeriodoDoCursinho("A", "year" as never, "tk");
    expect(fetchWrapper.mock.calls[0][0]).toBe(
      "http://api/monitoramento/simulados/por-periodo?cursinhoId=A&groupBy=year",
    );
    expect(fetchWrapper.mock.calls[0][1].headers.Authorization).toBe("Bearer tk");

    await usuariosPorPerfilDoCursinho("A", false, "tk");
    expect(fetchWrapper.mock.calls[1][0]).toBe(
      "http://api/monitoramento/usuarios-por-perfil?cursinhoId=A",
    );
    await ultimosProcessos("tk");
    expect(fetchWrapper.mock.calls[2][0]).toBe(
      "http://api/monitoramento/ultimos-processos?limite=10",
    );
  });

  it("502 e 403 viram erros tipados", async () => {
    fetchWrapper.mockResolvedValueOnce(resposta(502));
    await expect(
      simuladosPorPeriodoDoCursinho("A", "month" as never, "tk"),
    ).rejects.toBeInstanceOf(MonitoramentoIndisponivel);
    fetchWrapper.mockResolvedValueOnce(resposta(403));
    await expect(ultimosProcessos("tk", "A")).rejects.toBeInstanceOf(
      MonitoramentoSemPermissao,
    );
  });
});
