import { describe, expect, it } from "vitest";
import type {
  LinhaDoRelatorio,
  MediaPorMateria,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import {
  abaixoDaTurma,
  desviosPorMateria,
  MAXIMO_DE_COLUNAS_DE_MATERIA,
  materiasVisiveis,
  notaNaMateria,
} from "./materiasDoRelatorio";

const media = (id: string, nome: string, m: number): MediaPorMateria => ({
  id,
  nome,
  media: m,
  base: 10,
});

const linha = (
  materias: Array<[string, number]>,
  over: Partial<LinhaDoRelatorio> = {},
): LinhaDoRelatorio => ({
  usuario: "u1",
  nome: "Ana",
  matricula: "1",
  turmaId: null,
  turmaNome: null,
  enviouCartao: true,
  status: "completed",
  aproveitamentoPorMateria: materias.map(([id, nota]) => ({
    id,
    nome: id,
    aproveitamento: nota,
    frentes: [],
  })),
  ...over,
});

describe("materiasVisiveis", () => {
  it("abaixo do teto, mostra todas na ordem do resumo", () => {
    const resumo = [media("a", "Artes", 0.5), media("b", "Biologia", 0.3)];

    expect(materiasVisiveis(resumo).map((m) => m.id)).toEqual(["a", "b"]);
  });

  it("simulado de matéria única desenha uma coluna só", () => {
    expect(materiasVisiveis([media("a", "Matemática", 0.5)])).toHaveLength(1);
  });

  it("resumo ausente não desenha coluna nenhuma", () => {
    expect(materiasVisiveis(undefined)).toEqual([]);
    expect(materiasVisiveis([])).toEqual([]);
  });

  it(`⚠️ acima de ${MAXIMO_DE_COLUNAS_DE_MATERIA}, mostra as PIORES da turma`, () => {
    // Quem abre o relatório procura onde a turma foi mal — essa informação não
    // pode ficar escondida atrás de um "ver mais". Aqui a pior é `f` (0,1).
    const resumo = [
      media("a", "A", 0.9),
      media("b", "B", 0.2),
      media("c", "C", 0.8),
      media("d", "D", 0.3),
      media("e", "E", 0.7),
      media("f", "F", 0.1),
    ];

    const ids = materiasVisiveis(resumo).map((m) => m.id);
    expect(ids).toHaveLength(MAXIMO_DE_COLUNAS_DE_MATERIA);
    expect(ids).toContain("f");
    expect(ids).toContain("b");
    expect(ids).not.toContain("a");
  });

  it("⚠️ devolve na ordem ORIGINAL, não de pior para melhor", () => {
    // A tabela é lida por coluna; uma ordem que muda conforme as notas faria a
    // mesma turma trocar as colunas de lugar entre dois simulados.
    const resumo = [
      media("a", "A", 0.9),
      media("b", "B", 0.2),
      media("c", "C", 0.8),
      media("d", "D", 0.3),
      media("e", "E", 0.1),
    ];

    expect(materiasVisiveis(resumo).map((m) => m.id)).toEqual([
      "b",
      "c",
      "d",
      "e",
    ]);
  });

  it("⚠️ não muda o array recebido — ele vem do estado da tela", () => {
    const resumo = [
      media("a", "A", 0.9),
      media("b", "B", 0.2),
      media("c", "C", 0.8),
      media("d", "D", 0.3),
      media("e", "E", 0.1),
    ];
    const antes = resumo.map((m) => m.id);

    materiasVisiveis(resumo);

    expect(resumo.map((m) => m.id)).toEqual(antes);
  });
});

describe("desviosPorMateria", () => {
  it("calcula o desvio populacional por matéria", () => {
    // Notas 0,2 0,4 0,6 0,8 → média 0,5, variância 0,05, desvio 0,2236068
    const linhas = [0.2, 0.4, 0.6, 0.8].map((n, i) =>
      linha([["mat", n]], { usuario: `u${i}` }),
    );

    expect(desviosPorMateria(linhas).get("mat")).toBeCloseTo(0.2236068, 6);
  });

  it("⚠️ só quem tem leitura CONCLUÍDA entra", () => {
    // Mesmo conjunto que a api usa para a média — senão o desvio seria de uma
    // população e a média de outra. E `marcarFalha` não limpa `aproveitamento`,
    // então a linha `failed` chega com nota velha.
    const linhas = [
      linha([["mat", 0.2]]),
      linha([["mat", 0.4]], { usuario: "u2" }),
      linha([["mat", 0.99]], { usuario: "u3", status: "failed" }),
    ];

    // sem a `failed`: média 0,3, desvio 0,1
    expect(desviosPorMateria(linhas).get("mat")).toBeCloseTo(0.1, 10);
  });

  it("⚠️ uma nota só não tem desvio — e não vira zero", () => {
    // Desvio zero faria TODA nota abaixo da média virar alerta. Quem cobre este
    // caso é o gate de variância, não um `length < 2`: uma nota tem média igual
    // a ela mesma e variância exatamente zero.
    expect(desviosPorMateria([linha([["mat", 0.5]])]).has("mat")).toBe(false);
  });

  it("⚠️ turma toda com a mesma nota não tem desvio", () => {
    const linhas = [0.5, 0.5, 0.5].map((n, i) =>
      linha([["mat", n]], { usuario: `u${i}` }),
    );

    expect(desviosPorMateria(linhas).has("mat")).toBe(false);
  });

  it("matérias diferentes têm desvios independentes", () => {
    const linhas = [
      linha([
        ["mat", 0.2],
        ["hum", 0.5],
      ]),
      linha(
        [
          ["mat", 0.8],
          ["hum", 0.5],
        ],
        { usuario: "u2" },
      ),
    ];

    const d = desviosPorMateria(linhas);
    expect(d.get("mat")).toBeCloseTo(0.3, 10);
    expect(d.has("hum")).toBe(false);
  });
});

describe("abaixoDaTurma", () => {
  it("⚠️ um desvio abaixo marca — não é 'abaixo da média'", () => {
    // "Abaixo da média" realça metade da tabela por construção, e realce em
    // metade das células deixa de apontar para alguma coisa.
    expect(abaixoDaTurma(0.29, 0.5, 0.2)).toBe(true);
    expect(abaixoDaTurma(0.4, 0.5, 0.2)).toBe(false);
  });

  it("⚠️ exatamente um desvio abaixo NÃO marca — a borda é inclusiva", () => {
    expect(abaixoDaTurma(0.3, 0.5, 0.2)).toBe(false);
  });

  it("acima da média nunca marca", () => {
    expect(abaixoDaTurma(0.9, 0.5, 0.2)).toBe(false);
  });

  it("⚠️ sem desvio para comparar, não marca", () => {
    // Sem dispersão não existe "significativamente", e marcar mesmo assim
    // transformaria o alerta em ruído.
    expect(abaixoDaTurma(0.0, 0.5, undefined)).toBe(false);
  });
});

describe("notaNaMateria", () => {
  it("acha a nota da matéria do aluno", () => {
    expect(notaNaMateria(linha([["mat", 0.42]]), "mat")).toBe(0.42);
  });

  it("⚠️ matéria que o aluno não tem devolve `undefined`, e não 0", () => {
    // O aluno pode não ter Química porque nenhuma questão de Química foi lida
    // no cartão dele. Zero afirmaria que ele errou todas.
    expect(notaNaMateria(linha([["mat", 0.42]]), "quim")).toBeUndefined();
  });

  it("linha sem matéria nenhuma não estoura", () => {
    expect(
      notaNaMateria(linha([], { aproveitamentoPorMateria: undefined }), "mat"),
    ).toBeUndefined();
  });
});
