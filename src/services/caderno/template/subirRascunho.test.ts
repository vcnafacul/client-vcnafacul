import { beforeEach, describe, expect, it, vi } from "vitest";
import { cadernoTemplate } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";
import { subirRascunho } from "./subirRascunho";

vi.mock("@/utils/fetchWrapper", () => ({ default: vi.fn() }));
const mockedFetch = vi.mocked(fetchWrapper);

const arquivo = new File(["PKconteudo"], "projeto.zip", {
  type: "application/zip",
});

const relatorio = {
  aceitos: ["main.tex", "preambulo.tex"],
  ignorados: ["main.pdf"],
  erros: [],
  avisos: [],
};

beforeEach(() => {
  mockedFetch.mockReset();
  mockedFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => relatorio,
  } as unknown as Response);
});

describe("subirRascunho", () => {
  it("manda FormData e NÃO declara Content-Type", async () => {
    // ⚠️ O browser põe o boundary do multipart. Declarar o header o
    // substitui por um sem boundary, e o servidor recebe um corpo que não
    // parseia. Mesmo padrão do uploadCartao.ts, e a mesma classe de defeito
    // que o card 12 mediu do outro lado.
    await subirRascunho(arquivo, "capa nova", "tok");

    const [, init] = mockedFetch.mock.calls[0];
    expect(init?.body).toBeInstanceOf(FormData);
    const headers = (init?.headers ?? {}) as Record<string, string>;
    expect(Object.keys(headers).map((k) => k.toLowerCase())).not.toContain(
      "content-type",
    );
  });

  it("o FormData leva o arquivo e as notas", async () => {
    await subirRascunho(arquivo, "capa nova", "tok");
    const corpo = mockedFetch.mock.calls[0][1]?.body as FormData;
    expect(corpo.get("arquivo")).toBe(arquivo);
    expect(corpo.get("notas")).toBe("capa nova");
  });

  it("sem notas, não manda o campo", async () => {
    await subirRascunho(arquivo, "", "tok");
    const corpo = mockedFetch.mock.calls[0][1]?.body as FormData;
    expect(corpo.has("notas")).toBe(false);
  });

  it("DEVOLVE o relatório quando há erros de lint — não trata como falha", async () => {
    // ⚠️ O TESTE CENTRAL DESTE CARD. A api responde 200 com `erros`
    // preenchido, de propósito. Um service que lance aqui, ou que devolva
    // "ok", faz a tela dizer "enviado com sucesso" — e o coordenador fecha o
    // modal achando que publicou. A prova seguinte sai com o template velho,
    // e nada falha.
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ...relatorio,
        erros: ["main.tex — falta \\input{conteudo}"],
      }),
    } as unknown as Response);

    const r = await subirRascunho(arquivo, "", "tok");

    expect(r.erros).toHaveLength(1);
    expect(r.aceitos).toEqual(["main.tex", "preambulo.tex"]);
  });

  it("erro de verdade (413) vira mensagem, não relatório", async () => {
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 413,
      json: async () => ({ message: "arquivo grande demais" }),
    } as unknown as Response);

    await expect(subirRascunho(arquivo, "", "tok")).rejects.toThrow(
      /grande demais/,
    );
  });

  it("manda POST para a rota do rascunho, com o Bearer", async () => {
    await subirRascunho(arquivo, "", "tok");
    const [url, init] = mockedFetch.mock.calls[0];
    expect(url).toBe(`${cadernoTemplate}/rascunho`);
    expect(init?.method).toBe("POST");
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer tok",
    );
  });
});
