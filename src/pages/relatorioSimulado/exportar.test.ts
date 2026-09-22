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
  ...over,
});

describe("planilhaDeEstudantes", () => {
  it("traz os campos da tabela, na ordem do cabeçalho", () => {
    const p = planilhaDeEstudantes([linha()], { comTurma: false });

    expect(p.cabecalho).toEqual([
      "Estudante",
      "Matrícula",
      "Turma",
      "Situação",
      "Aproveitamento (%)",
      "Cartão",
      "Motivo da falha",
    ]);
    expect(p.linhas[0]).toEqual([
      "Ana Silva",
      "2025001",
      "Turma A",
      "Lido",
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
    ]);
    expect(p.linhas[0]).toEqual([3, 20, "A", 12, 6, 2, 60, 20, 10, 0, 0, 60, 30]);
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
    const iGabarito = cabecalho.indexOf("Gabarito");

    expect(typeof linhas[0][iGabarito]).toBe("string");
    expect(
      linhas[0]
        .filter((_, i) => i !== iGabarito)
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
