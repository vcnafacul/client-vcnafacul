import { describe, expect, it } from "vitest";
import type {
  LinhaDoRelatorio,
  QuestaoDoRelatorio,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import {
  nomeDoArquivo,
  planilhaDeEstudantes,
  planilhaDeQuestoes,
} from "./exportar";

const linha = (over: Partial<LinhaDoRelatorio> = {}): LinhaDoRelatorio => ({
  usuario: "u1",
  nome: "Ana Silva",
  matricula: "2025001",
  turmaId: "t1",
  turmaNome: "Turma A",
  enviouCartao: true,
  status: "completed",
  cartaoCode: "7",
  aproveitamentoGeral: 0.8,
  acertos: 61,
  ...over,
});

const questao = (over: Partial<QuestaoDoRelatorio> = {}): QuestaoDoRelatorio => ({
  numero: 3,
  questaoId: "q3",
  respondentes: 20,
  acertos: 12,
  erros: 6,
  semLeitura: 2,
  porAlternativa: { A: 12, B: 4, C: 2, D: 0, E: 0 },
  alternativaCorreta: "A",
  discriminacao: 0.42,
  ...over,
});

describe("planilhaDeEstudantes", () => {
  it("traz os campos da tabela, na ordem do cabeçalho", () => {
    const p = planilhaDeEstudantes([linha()], {
      comTurma: false,
      totalDeQuestoes: 90,
    });

    expect(p.cabecalho).toEqual([
      "Estudante",
      "Matrícula",
      "Turma",
      "Situação",
      "Acertos",
      "Total de questões",
      "Não lidas",
      "Aproveitamento (%)",
      "Cartão",
      "Motivo da falha",
    ]);
    expect(p.linhas[0]).toEqual([
      "Ana Silva",
      "2025001",
      "Turma A",
      "Lido",
      61,
      90,
      // ⚠️ `null`, e não `0`: este fixture não tem `questoesRespondidas`, que é
      // o caso do histórico anterior ao card 01. Zero afirmaria "leu o cartão
      // inteiro" sobre um cartão cuja contagem ninguém tem.
      null,
      80,
      "7",
      null,
    ]);
  });

  it("⚠️ a coluna Turma some quando o recorte JÁ é de uma turma", () => {
    // Repetir o mesmo nome em todas as linhas não informa nada. Mesma regra da
    // tabela, para a planilha não discordar da tela.
    const p = planilhaDeEstudantes([linha()], { comTurma: true });

    expect(p.cabecalho).not.toContain("Turma");
    expect(p.linhas[0]).toHaveLength(p.cabecalho.length);
  });

  it("⚠️ o aproveitamento sai de 0 a 100, como na tela — não a fração da api", () => {
    const p = planilhaDeEstudantes([linha({ aproveitamentoGeral: 0.755 })], {
      comTurma: true,
    });

    expect(p.linhas[0]).toContain(76);
  });

  it("⚠️ linha FALHA não leva aproveitamento, mesmo tendo o campo preenchido", () => {
    // O `marcarFalha` do ms não limpa `aproveitamento`: uma linha que leu bem e
    // depois falhou carrega nota velha. A tabela já esconde; a planilha tem de
    // esconder igual, senão vira a fonte "oficial" de um número que a tela
    // recusa mostrar.
    const p = planilhaDeEstudantes(
      [
        linha({
          status: "failed",
          aproveitamentoGeral: 0.8,
          falha: { codigo: "motor_timeout", descricao: "A leitura excedeu" },
        } as Partial<LinhaDoRelatorio>),
      ],
      { comTurma: true },
    );

    const [, , situacao, aproveitamento] = p.linhas[0];
    expect(situacao).toBe("Falhou");
    expect(aproveitamento).toBeNull();
  });

  it("linha de quem não enviou sai com a situação certa e sem nota", () => {
    const p = planilhaDeEstudantes(
      [linha({ enviouCartao: false, status: undefined, cartaoCode: undefined })],
      { comTurma: true },
    );

    expect(p.linhas[0]).toContain("Não enviou");
    expect(p.linhas[0]).toContain(null);
  });

  it("⚠️ exporta exatamente as linhas recebidas — o filtro é da tela", () => {
    // O arquivo é o que está visível, como a impressão. Esta função não filtra
    // nada por conta própria.
    const p = planilhaDeEstudantes([linha(), linha({ usuario: "u2" })], {
      comTurma: true,
    });

    expect(p.linhas).toHaveLength(2);
  });

  describe("colunas de matéria (card 07)", () => {
    const materias = [
      { id: "mat", nome: "Matemática", media: 0.5, base: 2 },
      { id: "hum", nome: "Humanas", media: 0.6, base: 2 },
    ];

    const comMaterias = (
      notas: Array<[string, number]>,
      over: Partial<LinhaDoRelatorio> = {},
    ) =>
      linha({
        aproveitamentoPorMateria: notas.map(([id, n]) => ({
          id,
          nome: id,
          aproveitamento: n,
          frentes: [],
        })),
        ...over,
      });

    it("uma coluna numérica por matéria, de 0 a 100", () => {
      // ⚠️ Número, não "42%": no Excel pt-BR o texto não soma nem ordena — é a
      // razão de exportar em vez de olhar a tela.
      const p = planilhaDeEstudantes([comMaterias([["mat", 0.42]])], {
        comTurma: true,
        materias,
      });

      expect(p.cabecalho).toContain("Matemática (%)");
      expect(p.linhas[0][p.cabecalho.indexOf("Matemática (%)")]).toBe(42);
    });

    it("⚠️ matéria que o ALUNO não tem sai VAZIA, e não 0", () => {
      // Zero numa planilha entra em média e em soma como se ele tivesse errado
      // todas as questões daquela matéria.
      const p = planilhaDeEstudantes([comMaterias([["mat", 0.42]])], {
        comTurma: true,
        materias,
      });

      expect(p.linhas[0][p.cabecalho.indexOf("Humanas (%)")]).toBeNull();
    });

    it("⚠️ linha sem leitura concluída sai vazia em todas as matérias", () => {
      // Mesmo gate do aproveitamento geral: `marcarFalha` não limpa
      // `aproveitamento`, e as matérias vão pelo mesmo caminho.
      const p = planilhaDeEstudantes(
        [comMaterias([["mat", 0.9]], { status: "failed" })],
        { comTurma: true, materias },
      );

      expect(p.linhas[0][p.cabecalho.indexOf("Matemática (%)")]).toBeNull();
    });

    it("sem matérias, a planilha fica exatamente como era", () => {
      const p = planilhaDeEstudantes([linha()], { comTurma: true });

      expect(p.cabecalho).toEqual([
        "Estudante",
        "Matrícula",
        "Situação",
        "Acertos",
        "Total de questões",
        "Não lidas",
        "Aproveitamento (%)",
        "Cartão",
        "Motivo da falha",
      ]);
    });

    it("⚠️ a linha tem o mesmo tamanho do cabeçalho, com matérias", () => {
      // O jeito mais fácil de quebrar um CSV é acrescentar coluna num lugar e
      // célula em outro — e o arquivo abre torto sem erro nenhum.
      const p = planilhaDeEstudantes([comMaterias([["mat", 0.4]])], {
        comTurma: false,
        materias,
      });

      expect(p.linhas[0]).toHaveLength(p.cabecalho.length);
    });
  });

  it("lista vazia dá planilha só com cabeçalho", () => {
    const p = planilhaDeEstudantes([], { comTurma: true });

    expect(p.linhas).toEqual([]);
    expect(p.cabecalho.length).toBeGreaterThan(0);
  });
});

describe("planilhaDeQuestoes", () => {
  it("traz contagens, percentuais por alternativa e os totais", () => {
    const p = planilhaDeQuestoes([questao()]);

    expect(p.cabecalho).toEqual([
      "Questão",
      "Respondentes",
      "Gabarito",
      "Acertos",
      "Erros",
      "Sem leitura",
      "A (%)",
      "B (%)",
      "C (%)",
      "D (%)",
      "E (%)",
      "Acerto (%)",
      "Erro (%)",
      "Discriminação",
      "Sinais",
      "Acerto geral (%)",
      "Base geral",
    ]);
    expect(p.linhas[0]).toEqual([
      3, 20, "A", 12, 6, 2, 60, 20, 10, 0, 0, 60, 30, 0.42, "Distrator",
      // ⚠️ Card 16: o fixture não tem `acertosGeral`/`baseGeral` — é o caso da
      // api anterior ao card. Percentual vazio, base vazia; nenhum zero, que
      // afirmaria "ninguém no país acertou".
      null, null,
    ]);
  });

  it("⚠️ `Discriminação` e `Sinais` existem no arquivo, e não como colunas", () => {
    // Card 19: um `r` entre −1 e +1 numa tela de coordenador é precisão que não
    // ajuda a decidir e custa largura. Numa planilha é o que se ordena.
    const p = planilhaDeQuestoes([questao()]);

    expect(p.cabecalho).toContain("Discriminação");
    expect(p.cabecalho).toContain("Sinais");
  });

  it("⚠️ `Sinais` é UMA coluna de texto, não seis booleanas", () => {
    // Seis colunas de 0/1 numa planilha de 180 linhas é pior de filtrar — e
    // some com a informação de quantos sinais a questão acumula.
    const p = planilhaDeQuestoes([
      questao({ discriminacao: -0.3, acertos: 2, erros: 18 }),
    ]);
    const iSinais = p.cabecalho.indexOf("Sinais");

    expect(p.linhas[0][iSinais]).toBe("Gabarito?; Difícil; Distrator");
    expect(p.cabecalho.filter((c) => c.includes("?"))).toEqual([]);
  });

  it("⚠️ discriminação `null` sai vazia, e não zero", () => {
    // `null` é "não há como medir"; zero afirmaria "não separa ninguém".
    const p = planilhaDeQuestoes([questao({ discriminacao: null })]);
    const i = p.cabecalho.indexOf("Discriminação");

    expect(p.linhas[0][i]).toBeNull();
  });

  it("questão sem sinal nenhum sai com `Sinais` vazio", () => {
    // ⚠️ String vazia, e não `null`: aqui a ausência É a informação — a questão
    // está ok. Diferente de uma medida que não existe.
    const p = planilhaDeQuestoes([
      questao({ porAlternativa: { A: 12, B: 4, C: 2, D: 1, E: 1 } }),
    ]);
    const i = p.cabecalho.indexOf("Sinais");

    expect(p.linhas[0][i]).toBe("");
  });

  it("⚠️ MANTÉM `Acertos`, `Erros` e `Erro (%)`, que a tabela removeu", () => {
    // Card 04: tela e arquivo seguem critérios diferentes de propósito. A tela
    // é para ler e comparar — `Acerto (%)` é a coluna do gabarito, `Erros` sai
    // por subtração. O arquivo é para fazer conta em cima.
    const p = planilhaDeQuestoes([questao()]);

    expect(p.cabecalho).toContain("Acertos");
    expect(p.cabecalho).toContain("Erros");
    expect(p.cabecalho).toContain("Erro (%)");
  });

  it("⚠️ gabarito `null` sai como célula VAZIA, e não travessão", () => {
    // O CSV é lido por planilha: um "—" no meio de uma coluna de letras vira
    // texto que não filtra nem agrupa junto com o resto.
    const p = planilhaDeQuestoes([questao({ alternativaCorreta: null })]);

    expect(p.linhas[0][2]).toBeNull();
  });

  it("⚠️ o percentual vai como NÚMERO, sem o símbolo de %", () => {
    // No Excel pt-BR "60%" é texto e não soma nem ordena. Fazer conta com isso
    // é justamente a razão de exportar em vez de olhar a tela.
    //
    // ⚠️ `Gabarito` é a ÚNICA célula de texto da planilha (card 04): é uma
    // letra, não uma medida. Por isso a asserção a exclui por posição em vez de
    // afrouxar para "quase tudo é número" — assim uma medida que virasse string
    // por acidente continuaria caindo aqui.
    const { cabecalho, linhas } = planilhaDeQuestoes([questao()]);
    // ⚠️ `Gabarito` e `Sinais` são as ÚNICAS células de texto: uma letra e uma
    // lista de rótulos, não medidas. A asserção as exclui por posição em vez de
    // afrouxar para "quase tudo é número" — assim uma medida que virasse string
    // por acidente continuaria caindo aqui.
    const texto = ["Gabarito", "Sinais"].map((c) => cabecalho.indexOf(c));

    for (const i of texto) expect(typeof linhas[0][i]).toBe("string");
    expect(
      linhas[0]
        .filter((_, i) => !texto.includes(i))
        .every((c) => c === null || typeof c === "number"),
    ).toBe(true);
  });

  it("⚠️ `respondentes` entra, embora não esteja na tabela", () => {
    // É o denominador de todos os percentuais ao lado; sem ele quem abre o
    // arquivo não refaz nenhuma conta.
    const p = planilhaDeQuestoes([questao()]);

    expect(p.cabecalho[1]).toBe("Respondentes");
    expect(p.linhas[0][1]).toBe(20);
  });

  it("⚠️ questão sem respondentes leva célula VAZIA, e não 0", () => {
    // Zero afirma "ninguém acertou"; não haver base é outra coisa.
    const p = planilhaDeQuestoes([
      questao({ respondentes: 0, acertos: 0, erros: 0, semLeitura: 0, porAlternativa: {} }),
    ]);

    expect(p.linhas[0][10]).toBeNull(); // Acerto (%)
    expect(p.linhas[0][11]).toBeNull(); // Erro (%)
  });

  it("questão sem número sai com célula vazia", () => {
    const p = planilhaDeQuestoes([questao({ numero: null })]);

    expect(p.linhas[0][0]).toBeNull();
  });
});

describe("nomeDoArquivo", () => {
  it("junta prefixo, simulado e data", () => {
    const nome = nomeDoArquivo("estudantes", "sim-1");

    expect(nome).toMatch(/^estudantes-sim-1-\d{4}-\d{2}-\d{2}$/);
  });

  it("registra a turma quando o recorte é de uma", () => {
    expect(nomeDoArquivo("questoes", "sim-1", "t-9")).toContain("-turma-t-9-");
  });

  it("⚠️ tira barra e dois-pontos — são separadores de caminho", () => {
    // Um id com barra produziria um download recusado em silêncio.
    const nome = nomeDoArquivo("estudantes", "a/b:c");

    expect(nome).not.toMatch(/[/:\\]/);
    expect(nome).toContain("a-b-c");
  });
});

describe("planilhaDeEstudantes — coluna Não lidas (card 13)", () => {
  const comContagem = (respondidas: number | undefined, status = "completed") =>
    planilhaDeEstudantes(
      [linha({ questoesRespondidas: respondidas, status: status as never })],
      { comTurma: true, totalDeQuestoes: 90 },
    );

  const naoLidasDa = (p: ReturnType<typeof planilhaDeEstudantes>) =>
    p.linhas[0][p.cabecalho.indexOf("Não lidas")];

  it("traz total menos respondidas", () => {
    expect(naoLidasDa(comContagem(87))).toBe(3);
  });

  it("⚠️ zero SAI na planilha, ao contrário da tela", () => {
    /*
      Na tela "0 não lidas" em 300 linhas é ruído. Aqui a célula vazia se lê
      como "não sei", e a coluna precisa poder ser somada e filtrada — `null`
      fica reservado para quem realmente não tem contagem.
    */
    expect(naoLidasDa(comContagem(90))).toBe(0);
  });

  it("histórico sem a contagem vai vazio, não zero", () => {
    expect(naoLidasDa(comContagem(undefined))).toBeNull();
  });

  it("⚠️ cartão que falhou vai vazio mesmo com contagem velha no documento", () => {
    expect(naoLidasDa(comContagem(40, "failed"))).toBeNull();
  });

  it("⚠️ vem ANTES do aproveitamento — a ressalva precede o número que qualifica", () => {
    const p = comContagem(87);

    expect(p.cabecalho.indexOf("Não lidas")).toBeLessThan(
      p.cabecalho.indexOf("Aproveitamento (%)"),
    );
  });
});

describe("planilhaDeQuestoes — dificuldade global (card 16)", () => {
  const indices = (p: ReturnType<typeof planilhaDeQuestoes>) => ({
    pct: p.cabecalho.indexOf("Acerto geral (%)"),
    base: p.cabecalho.indexOf("Base geral"),
  });

  it("leva percentual e base quando há base suficiente", () => {
    const p = planilhaDeQuestoes([
      questao({ acertosGeral: 443, baseGeral: 1847 }),
    ]);
    const i = indices(p);

    expect(p.linhas[0][i.pct]).toBe(24);
    expect(p.linhas[0][i.base]).toBe(1847);
  });

  it("⚠️ abaixo do piso, a BASE sai e o percentual NÃO", () => {
    /*
      A planilha leva o denominador — sem ele não há como refazer conta nenhuma
      —, mas não escreve um percentual que a tela recusa mostrar: seria a
      planilha virando a fonte "oficial" de um número que a interface considera
      não confiável, que é o que o card 13 evitou do outro lado.
    */
    const p = planilhaDeQuestoes([questao({ acertosGeral: 3, baseGeral: 12 })]);
    const i = indices(p);

    expect(p.linhas[0][i.pct]).toBeNull();
    expect(p.linhas[0][i.base]).toBe(12);
  });

  it("api sem os campos deixa as duas vazias", () => {
    const p = planilhaDeQuestoes([questao()]);
    const i = indices(p);

    expect(p.linhas[0][i.pct]).toBeNull();
    expect(p.linhas[0][i.base]).toBeNull();
  });

  it("⚠️ as colunas existem mesmo sem nenhuma questão com base", () => {
    // Ao contrário da TELA, onde a coluna some: numa planilha a coluna ausente
    // muda o formato do arquivo entre duas exportações da mesma tela.
    const p = planilhaDeQuestoes([questao()]);

    expect(p.cabecalho).toContain("Acerto geral (%)");
    expect(p.cabecalho).toContain("Base geral");
  });

  it("a linha tem o mesmo tamanho do cabeçalho", () => {
    const p = planilhaDeQuestoes([
      questao({ acertosGeral: 443, baseGeral: 1847 }),
    ]);

    expect(p.linhas[0]).toHaveLength(p.cabecalho.length);
  });
});
