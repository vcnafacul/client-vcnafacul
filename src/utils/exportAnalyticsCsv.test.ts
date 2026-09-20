import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { exportAnalyticsCsv } from "./exportAnalyticsCsv";

/**
 * Captura o texto que teria sido baixado.
 *
 * ⚠️ jsdom não implementa `URL.createObjectURL` nem download de verdade — o
 * que dá para afirmar aqui é o CONTEÚDO do Blob, que é justamente onde mora a
 * regra de escape. O download em si é gate manual.
 */
const capturado: string[] = [];

beforeEach(() => {
  capturado.length = 0;
  vi.stubGlobal(
    "Blob",
    class {
      constructor(partes: string[]) {
        capturado.push(partes.join(""));
      }
    },
  );
  vi.stubGlobal("URL", {
    createObjectURL: () => "blob:fake",
    revokeObjectURL: () => {},
  });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const conteudo = () => capturado[0];

describe("exportAnalyticsCsv", () => {
  it("monta cabeçalho e linhas separados por ;", () => {
    exportAnalyticsCsv(["Nome", "Total"], [["Ana", 3]], "arquivo");

    expect(conteudo()).toBe("\uFEFFNome;Total\nAna;3");
  });

  it("⚠️ começa com BOM — é o que faz o Excel abrir os acentos certos", () => {
    exportAnalyticsCsv(["Matrícula"], [["João"]], "x");

    expect(conteudo().startsWith("\uFEFF")).toBe(true);
  });

  it("null vira célula vazia", () => {
    exportAnalyticsCsv(["A", "B"], [[null, 1]], "x");

    expect(conteudo()).toContain("\n;1");
  });
});

describe("exportAnalyticsCsv — escape", () => {
  it("⚠️ valor com ; é envolvido em aspas, e NÃO parte a linha", () => {
    // Sem isto, "Turma A; B" vira duas colunas e desloca todas as seguintes —
    // um arquivo silenciosamente errado, que só aparece ao abrir no Excel.
    exportAnalyticsCsv(["Turma", "Total"], [["Turma A; B", 3]], "x");

    expect(conteudo()).toBe('\uFEFFTurma;Total\n"Turma A; B";3');
  });

  it("⚠️ aspas internas são DUPLICADAS, não barradas", () => {
    // É a regra do RFC 4180. Escapar com barra invertida é o reflexo de quem
    // vem de JSON, e o Excel não entende.
    exportAnalyticsCsv(["Nome"], [['Ana "Aninha"']], "x");

    expect(conteudo()).toContain('"Ana ""Aninha"""');
  });

  it("⚠️ quebra de linha dentro do valor é preservada entre aspas", () => {
    exportAnalyticsCsv(["Obs"], [["linha 1\nlinha 2"]], "x");

    expect(conteudo()).toContain('"linha 1\nlinha 2"');
  });

  it("⚠️ \\r também dispara o escape — CRLF colado do Windows", () => {
    exportAnalyticsCsv(["Obs"], [["a\r\nb"]], "x");

    expect(conteudo()).toContain('"a\r\nb"');
  });

  it("⚠️ valor SEM caractere especial sai idêntico ao de antes do escape", () => {
    // É esta propriedade que garante que as sete telas de analytics que já
    // usam este utilitário não mudaram de comportamento.
    exportAnalyticsCsv(["Nome", "Cidade"], [["Ana Silva", "São Paulo"]], "x");

    expect(conteudo()).toBe("\uFEFFNome;Cidade\nAna Silva;São Paulo");
  });

  it("o cabeçalho também é escapado", () => {
    exportAnalyticsCsv(["Nome; completo"], [["Ana"]], "x");

    expect(conteudo()).toContain('"Nome; completo"');
  });
});
