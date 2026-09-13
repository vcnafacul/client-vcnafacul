import { describe, expect, it } from "vitest";
import { dataOrdenavel, sortRows } from "./sortRows";
import type { DashColumn } from "./types";

interface Registro {
  id: string;
  nome: string;
  faltando: number | null;
  criadaEm?: string;
}

function reg(id: string, nome: string, faltando: number | null = 0, criadaEm?: string): Registro {
  return { id, nome, faltando, criadaEm };
}

const colunas: DashColumn<Registro>[] = [
  { id: "nome", header: "Nome", cell: (r) => r.nome, sortValue: (r) => r.nome },
  { id: "faltando", header: "Faltando", cell: (r) => r.faltando, sortValue: (r) => r.faltando },
  {
    id: "criadaEm",
    header: "Criada em",
    cell: (r) => r.criadaEm,
    // ⚠️ Normalizada: a API manda string ISO num campo tipado como DateTime.
    sortValue: (r) => dataOrdenavel(r.criadaEm),
  },
  { id: "acoes", header: "Ações", cell: () => null },
];

const ids = (rs: Registro[]) => rs.map((r) => r.id);

describe("dataOrdenavel", () => {
  it("normaliza a string ISO que a API manda no lugar do DateTime", () => {
    const d = dataOrdenavel("2024-03-10T12:00:00.000Z");
    expect(d).toBeInstanceOf(Date);
    expect(d?.toISOString()).toBe("2024-03-10T12:00:00.000Z");
  });

  it("devolve null para vazio e para data inválida, que é o que manda para o fim", () => {
    expect(dataOrdenavel(null)).toBeNull();
    expect(dataOrdenavel(undefined)).toBeNull();
    expect(dataOrdenavel("")).toBeNull();
    expect(dataOrdenavel("não é data")).toBeNull();
  });

  it("deixa passar um Date que já veio pronto", () => {
    const d = new Date("2020-01-01T00:00:00.000Z");
    expect(dataOrdenavel(d)?.getTime()).toBe(d.getTime());
  });
});

describe("sortRows — o comparador", () => {
  it("ordena texto com localeCompare pt-BR: acento não joga a palavra para o fim", () => {
    // ⚠️ Com `<` cru, "Ática" (U+00C1) vem DEPOIS de "Zebra" (U+005A) e o
    // usuário não acha a prova pelo nome.
    const linhas = [reg("z", "Zebra"), reg("a", "Ática"), reg("b", "Bahia")];

    expect(ids(sortRows(linhas, colunas, { columnId: "nome", direction: "asc" }))).toEqual([
      "a",
      "b",
      "z",
    ]);
    expect(ids(sortRows(linhas, colunas, { columnId: "nome", direction: "desc" }))).toEqual([
      "z",
      "b",
      "a",
    ]);
  });

  it("ordena número como número, não como texto", () => {
    const linhas = [reg("dez", "a", 10), reg("dois", "b", 2), reg("cem", "c", 100)];
    // Como texto seria "10" < "100" < "2".
    expect(ids(sortRows(linhas, colunas, { columnId: "faltando", direction: "asc" }))).toEqual([
      "dois",
      "dez",
      "cem",
    ]);
  });

  it("ordena data por instante, não pelo texto do Date", () => {
    /**
     * ⚠️ As três datas foram escolhidas para que a ordem cronológica e a ordem
     * alfabética de `String(date)` sejam **diferentes** — se o comparador cair
     * no `localeCompare`, ele ordena por nome do dia da semana ("Fri", "Mon",
     * "Sun") e este teste fica vermelho.
     */
    const linhas = [
      reg("meio", "b", 0, "2024-11-04T00:00:00.000Z"), // Mon Nov 04 2024
      reg("velha", "a", 0, "2023-06-09T00:00:00.000Z"), // Fri Jun 09 2023
      reg("nova", "c", 0, "2025-02-16T00:00:00.000Z"), // Sun Feb 16 2025
    ];

    expect(ids(sortRows(linhas, colunas, { columnId: "criadaEm", direction: "asc" }))).toEqual([
      "velha",
      "meio",
      "nova",
    ]);
    expect(ids(sortRows(linhas, colunas, { columnId: "criadaEm", direction: "desc" }))).toEqual([
      "nova",
      "meio",
      "velha",
    ]);
  });
});

describe("sortRows — estabilidade", () => {
  it("empate mantém a ordem original, também no desc", () => {
    // ⚠️ O `desc` é o que pega o bug: aplicar o sinal da direção também ao
    // desempate inverte os empatados e a lista embaralha ao alternar a seta.
    const linhas = [
      reg("p1", "Igual"),
      reg("p2", "Igual"),
      reg("p3", "Igual"),
      reg("p4", "Igual"),
    ];

    expect(ids(sortRows(linhas, colunas, { columnId: "nome", direction: "asc" }))).toEqual([
      "p1",
      "p2",
      "p3",
      "p4",
    ]);
    expect(ids(sortRows(linhas, colunas, { columnId: "nome", direction: "desc" }))).toEqual([
      "p1",
      "p2",
      "p3",
      "p4",
    ]);
  });

  it("empate parcial: os empatados mantêm a ordem relativa dentro do grupo", () => {
    const linhas = [
      reg("b1", "Beta"),
      reg("a1", "Alfa"),
      reg("b2", "Beta"),
      reg("a2", "Alfa"),
      reg("b3", "Beta"),
    ];

    expect(ids(sortRows(linhas, colunas, { columnId: "nome", direction: "desc" }))).toEqual([
      "b1",
      "b2",
      "b3",
      "a1",
      "a2",
    ]);
  });
});

describe("sortRows — nulos", () => {
  it("null e undefined vão para o fim nas DUAS direções", () => {
    const linhas = [
      reg("sem", "a", null),
      reg("tres", "b", 3),
      { id: "indef", nome: "c", faltando: undefined as unknown as null },
      reg("um", "d", 1),
    ];

    expect(ids(sortRows(linhas, colunas, { columnId: "faltando", direction: "asc" }))).toEqual([
      "um",
      "tres",
      "sem",
      "indef",
    ]);
    // ⚠️ No desc os nulos continuam no fim — não sobem para o topo.
    expect(ids(sortRows(linhas, colunas, { columnId: "faltando", direction: "desc" }))).toEqual([
      "tres",
      "um",
      "sem",
      "indef",
    ]);
  });

  it("nulos entre si mantêm a ordem original", () => {
    const linhas = [reg("n1", "a", null), reg("n2", "b", null), reg("n3", "c", null)];
    expect(ids(sortRows(linhas, colunas, { columnId: "faltando", direction: "desc" }))).toEqual([
      "n1",
      "n2",
      "n3",
    ]);
  });

  it("data ausente ou inválida também vai para o fim", () => {
    const linhas = [
      reg("ruim", "a", 0, "não é data"),
      reg("boa", "b", 0, "2024-01-01T00:00:00.000Z"),
      reg("nada", "c", 0, undefined),
    ];
    expect(ids(sortRows(linhas, colunas, { columnId: "criadaEm", direction: "desc" }))).toEqual([
      "boa",
      "ruim",
      "nada",
    ]);
  });
});

describe("sortRows — contrato", () => {
  it("é puro: devolve array novo e não mexe no que recebeu", () => {
    const linhas = [reg("z", "Zebra"), reg("a", "Ática")];
    const original = [...linhas];

    const saida = sortRows(linhas, colunas, { columnId: "nome", direction: "asc" });

    expect(saida).not.toBe(linhas);
    expect(linhas).toEqual(original);
  });

  it("coluna sem sortValue não ordena nada", () => {
    const linhas = [reg("z", "Zebra"), reg("a", "Ática")];
    expect(ids(sortRows(linhas, colunas, { columnId: "acoes", direction: "asc" }))).toEqual([
      "z",
      "a",
    ]);
  });

  it("sort ausente ou de coluna inexistente devolve a ordem de entrada", () => {
    const linhas = [reg("z", "Zebra"), reg("a", "Ática")];
    expect(ids(sortRows(linhas, colunas))).toEqual(["z", "a"]);
    expect(ids(sortRows(linhas, colunas, { columnId: "fantasma", direction: "asc" }))).toEqual([
      "z",
      "a",
    ]);
  });
});
