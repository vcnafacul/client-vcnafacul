import { describe, expect, it } from "vitest";
import type { RespostaDoEstudante } from "@/dtos/relatorioSimulado/relatorioSimulado";
import {
  contagensDoDetalhe,
  filtrarRespostas,
  FILTRO_PADRAO,
  FILTROS,
} from "./filtroDoDetalhe";

const r = (
  numero: number,
  resultado: RespostaDoEstudante["resultado"],
): RespostaDoEstudante => ({
  numero,
  questaoId: `q${numero}`,
  alternativaCorreta: "A",
  resultado,
});

const respostas = [
  r(1, "acerto"),
  r(2, "erro"),
  r(3, "sem_leitura"),
  r(4, "erro"),
  r(5, "acerto"),
];

describe("contagensDoDetalhe", () => {
  it("conta cada estado separadamente", () => {
    expect(contagensDoDetalhe(respostas)).toEqual({
      tudo: 5,
      errou: 2,
      sem_leitura: 1,
    });
  });

  it("⚠️ `tudo` é o total, não a soma dos outros dois", () => {
    // Os acertos entram em `tudo` e em nenhum chip próprio — é o que faz o
    // contador do "Tudo" explicar a diferença.
    const c = contagensDoDetalhe(respostas);

    expect(c.tudo).toBeGreaterThan(c.errou + c.sem_leitura);
  });

  it("cartão sem resposta nenhuma dá tudo zero", () => {
    expect(contagensDoDetalhe([])).toEqual({
      tudo: 0,
      errou: 0,
      sem_leitura: 0,
    });
  });
});

describe("filtrarRespostas", () => {
  it("`tudo` devolve a lista inteira, na mesma ordem", () => {
    expect(filtrarRespostas(respostas, "tudo")).toEqual(respostas);
  });

  it("⚠️ `errou` é SÓ erro — não inclui sem leitura", () => {
    // O `rotuloDoResultado` documenta que juntar os dois "distorce exatamente a
    // leitura que o professor faz para decidir o que revisar em aula". A tela
    // classifica os três estados com cuidado justamente para distingui-los.
    const f = filtrarRespostas(respostas, "errou");

    expect(f.map((x) => x.numero)).toEqual([2, 4]);
  });

  it("`sem_leitura` traz só o que não foi lido", () => {
    expect(filtrarRespostas(respostas, "sem_leitura").map((x) => x.numero)).toEqual(
      [3],
    );
  });

  it("⚠️ o filtro REMOVE linhas, não reordena", () => {
    // A tabela continua sem `onSortChange`: a ordem é a do ms, por número da
    // questão. Filtrar e reordenar seriam duas mudanças, e só uma foi pedida.
    const embaralhada = [r(9, "erro"), r(2, "erro"), r(5, "erro")];

    expect(filtrarRespostas(embaralhada, "errou").map((x) => x.numero)).toEqual([
      9, 2, 5,
    ]);
  });

  it("filtro sem resultado devolve lista vazia, não a lista inteira", () => {
    expect(filtrarRespostas([r(1, "acerto")], "errou")).toEqual([]);
  });
});

describe("os chips", () => {
  it("⚠️ são TRÊS — não há chip de 'Acertou'", () => {
    // Ninguém abre o modal para ver o que o aluno acertou, e um quarto chip
    // custa largura e atenção sem entregar nada.
    expect(FILTROS).toHaveLength(3);
    expect(FILTROS).not.toContain("acertou");
  });

  it("`Tudo` é o padrão — o card não muda o que se vê ao abrir", () => {
    expect(FILTRO_PADRAO).toBe("tudo");
    expect(FILTROS[0]).toBe("tudo");
  });
});
