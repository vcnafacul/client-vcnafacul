import { describe, expect, it } from "vitest";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import {
  explicacaoDaFlag,
  flagsDaQuestao,
  LIMIARES,
} from "./flagsDaQuestao";

/**
 * Base 20 e gabarito A, para os percentuais darem números redondos: cada
 * marcação vale 5 pontos percentuais.
 */
const questao = (over: Partial<QuestaoDoRelatorio> = {}): QuestaoDoRelatorio => ({
  numero: 1,
  questaoId: "q1",
  respondentes: 20,
  acertos: 10,
  erros: 10,
  semLeitura: 0,
  porAlternativa: { A: 10, B: 4, C: 3, D: 2, E: 1 },
  alternativaCorreta: "A",
  discriminacao: 0.4,
  ...over,
});

describe("flagsDaQuestao (card 06)", () => {
  it("questão boa não recebe sinal nenhum", () => {
    // 50% de acerto, discriminação 0,4, nenhum distrator abaixo de 5%.
    expect(flagsDaQuestao(questao({ porAlternativa: { A: 10, B: 4, C: 3, D: 2, E: 1 } }))).toEqual(
      [],
    );
  });

  describe("gabarito suspeito", () => {
    it("⚠️ discriminação negativa marca `gabarito_suspeito`", () => {
      // Os alunos que foram bem na prova erraram mais esta questão que os que
      // foram mal. É o achado mais acionável do relatório inteiro.
      expect(flagsDaQuestao(questao({ discriminacao: -0.1 }))).toContain(
        "gabarito_suspeito",
      );
    });

    it("⚠️ negativa NÃO acumula com `nao_discrimina`", () => {
      // Negativa já é o caso mais grave de não discriminar. As duas juntas
      // diriam a mesma coisa duas vezes, com urgências diferentes.
      const flags = flagsDaQuestao(questao({ discriminacao: -0.5 }));

      expect(flags).toContain("gabarito_suspeito");
      expect(flags).not.toContain("nao_discrimina");
    });

    it("discriminação exatamente 0 é `nao_discrimina`, não suspeita", () => {
      expect(flagsDaQuestao(questao({ discriminacao: 0 }))).toEqual([
        "nao_discrimina",
      ]);
    });
  });

  describe("não discrimina", () => {
    it(`abaixo de ${LIMIARES.discriminacaoMinima} marca`, () => {
      expect(flagsDaQuestao(questao({ discriminacao: 0.19 }))).toContain(
        "nao_discrimina",
      );
    });

    it(`⚠️ exatamente ${LIMIARES.discriminacaoMinima} NÃO marca — a borda é inclusiva`, () => {
      expect(
        flagsDaQuestao(questao({ discriminacao: LIMIARES.discriminacaoMinima })),
      ).not.toContain("nao_discrimina");
    });
  });

  describe("⚠️ base insuficiente não gera flag", () => {
    it("`discriminacao: null` não vira `nao_discrimina`", () => {
      // O backend se recusou a avaliar (menos de 10 com leitura, ou variância
      // zero). Afirmar "item fraco" a partir disso é pior que não dizer nada.
      const flags = flagsDaQuestao(questao({ discriminacao: null }));

      expect(flags).not.toContain("nao_discrimina");
      expect(flags).not.toContain("gabarito_suspeito");
    });

    it("questão sem respondentes não gera flag alguma", () => {
      expect(
        flagsDaQuestao(
          questao({
            respondentes: 0,
            acertos: 0,
            erros: 0,
            semLeitura: 0,
            porAlternativa: {},
            discriminacao: null,
          }),
        ),
      ).toEqual([]);
    });
  });

  describe("dificuldade", () => {
    it("⚠️ abaixo de 25% marca `muito_dificil` — 20% é o chute com 5 alternativas", () => {
      // 4 de 20 = 20%: a turma não está respondendo, está sorteando.
      expect(
        flagsDaQuestao(
          questao({ acertos: 4, erros: 16, porAlternativa: { A: 4, B: 8, C: 4, D: 3, E: 1 } }),
        ),
      ).toContain("muito_dificil");
    });

    it("⚠️ exatamente 25% NÃO marca — a borda é inclusiva", () => {
      // 5 de 20 = 25%.
      expect(
        flagsDaQuestao(
          questao({ acertos: 5, erros: 15, porAlternativa: { A: 5, B: 6, C: 4, D: 3, E: 2 } }),
        ),
      ).not.toContain("muito_dificil");
    });

    it("acima de 90% marca `muito_facil`", () => {
      // 19 de 20 = 95%.
      expect(
        flagsDaQuestao(
          questao({ acertos: 19, erros: 1, porAlternativa: { A: 19, B: 1, C: 0, D: 0, E: 0 } }),
        ),
      ).toContain("muito_facil");
    });

    it("⚠️ exatamente 90% NÃO marca — a borda é inclusiva", () => {
      // 18 de 20 = 90%.
      expect(
        flagsDaQuestao(
          questao({ acertos: 18, erros: 2, porAlternativa: { A: 18, B: 2, C: 0, D: 0, E: 0 } }),
        ),
      ).not.toContain("muito_facil");
    });
  });

  describe("distrator morto", () => {
    it("alternativa errada com menos de 5% marca", () => {
      // E com 0 marcação: 0% < 5%.
      expect(
        flagsDaQuestao(
          questao({ porAlternativa: { A: 10, B: 5, C: 5, D: 0, E: 0 } }),
        ),
      ).toContain("distrator_morto");
    });

    it("⚠️ exatamente 5% NÃO marca — a borda é inclusiva", () => {
      // 1 de 20 = 5%.
      expect(
        flagsDaQuestao(
          questao({ porAlternativa: { A: 10, B: 5, C: 3, D: 1, E: 1 } }),
        ),
      ).not.toContain("distrator_morto");
    });

    it("⚠️ o GABARITO com 4% não é distrator morto", () => {
      // É o critério de aceite explícito do card. Confundir os dois faria toda
      // questão difícil aparecer como problema de redação de alternativa — e o
      // coordenador reescreveria a alternativa certa.
      const flags = flagsDaQuestao(
        questao({
          acertos: 0,
          erros: 20,
          // gabarito A com 0%, e todas as erradas bem marcadas
          porAlternativa: { A: 0, B: 5, C: 5, D: 5, E: 5 },
        }),
      );

      expect(flags).not.toContain("distrator_morto");
      // mas segue muito difícil, que é o que de fato aconteceu
      expect(flags).toContain("muito_dificil");
    });

    it("⚠️ sem gabarito conhecido não marca — não há o que excluir da varredura", () => {
      // `alternativaCorreta: null` (card 03, históricos que discordam). Chutar
      // qual excluir inverteria o sinal.
      expect(
        flagsDaQuestao(
          questao({
            alternativaCorreta: null,
            porAlternativa: { A: 10, B: 10, C: 0, D: 0, E: 0 },
          }),
        ),
      ).not.toContain("distrator_morto");
    });
  });

  it("⚠️ as flags ACUMULAM — é a combinação que fecha o diagnóstico", () => {
    // Difícil sozinha pede aula; difícil COM gabarito suspeito pede conferir o
    // gabarito antes de qualquer outra coisa. Escolher uma "principal" perderia
    // exatamente a informação que decide a ação.
    const flags = flagsDaQuestao(
      questao({
        acertos: 3,
        erros: 17,
        discriminacao: -0.3,
        porAlternativa: { A: 3, B: 16, C: 1, D: 0, E: 0 },
      }),
    );

    expect(flags).toContain("gabarito_suspeito");
    expect(flags).toContain("muito_dificil");
    expect(flags).toContain("distrator_morto");
  });

  it("⚠️ a ordem é a da urgência: gabarito primeiro", () => {
    // A coluna renderiza nesta ordem, e o primeiro badge é o que o coordenador
    // deve olhar antes dos outros.
    const flags = flagsDaQuestao(
      questao({
        acertos: 3,
        erros: 17,
        discriminacao: -0.3,
        porAlternativa: { A: 3, B: 16, C: 1, D: 0, E: 0 },
      }),
    );

    expect(flags[0]).toBe("gabarito_suspeito");
  });
});

describe("explicacaoDaFlag — o texto do tooltip", () => {
  /**
   * ⚠️ **Concreta, não genérica.** A versão anterior repetia o limiar ("menos
   * de 25% acertaram"), que é a REGRA — não o que aconteceu naquela linha. Quem
   * passa o mouse está olhando uma questão específica.
   */
  const q20 = (over: Partial<QuestaoDoRelatorio> = {}) =>
    questao({ respondentes: 20, ...over });

  it("⚠️ 'Difícil' diz o percentual REAL, não o limiar", () => {
    /*
      3 de 20 = **15%** de propósito: a primeira versão deste teste usava 4 de
      20 = 20%, e "20%" aparece também na frase sobre o chute — então ele
      passava mesmo com a explicação genérica ("menos de 25% acertaram"). O
      número escolhido tem de ser um que SÓ possa vir do dado.
    */
    const q = q20({
      acertos: 3,
      erros: 17,
      porAlternativa: { A: 3, B: 9, C: 4, D: 3, E: 1 },
    });

    const t = explicacaoDaFlag("muito_dificil", q);
    expect(t).toContain("15%");
    expect(t).not.toContain("Menos de 25%");
    // e segue explicando por que 15% é pouco
    expect(t).toContain("chute");
  });

  it("'Fácil' também traz o número da questão", () => {
    const q = q20({
      acertos: 19,
      erros: 1,
      porAlternativa: { A: 19, B: 1, C: 0, D: 0, E: 0 },
    });

    expect(explicacaoDaFlag("muito_facil", q)).toContain("95%");
  });

  it("⚠️ 'Gabarito?' traz o valor da discriminação, com vírgula", () => {
    // Número em pt-BR: "-0,30", não "-0.30".
    const t = explicacaoDaFlag("gabarito_suspeito", q20({ discriminacao: -0.3 }));

    expect(t).toContain("-0,30");
    expect(t).not.toContain("-0.30");
  });

  it("'Não discrimina' cita o limiar E o valor", () => {
    const t = explicacaoDaFlag("nao_discrimina", q20({ discriminacao: 0.11 }));

    expect(t).toContain("0,11");
    expect(t).toContain("0,20");
  });

  describe("⚠️ o distrator NOMEIA a alternativa morta", () => {
    it("uma só, no singular", () => {
      // D com 0 de 20 = 0%
      const q = q20({ porAlternativa: { A: 10, B: 5, C: 5, D: 0, E: 2 } });

      const t = explicacaoDaFlag("distrator_morto", q);
      expect(t).toContain("A alternativa D foi marcada");
      expect(t).toContain("4 alternativas");
    });

    it("⚠️ várias saem em português, não com 'e' repetido", () => {
      // `join(" e ")` produzia "C e D e E". O primeiro teste que escrevi
      // ACEITOU isso, porque eu escrevi a expectativa com o mesmo erro —
      // teste que copia a implementação não verifica nada.
      const q = q20({ porAlternativa: { A: 10, B: 10, C: 0, D: 0, E: 0 } });

      const t = explicacaoDaFlag("distrator_morto", q);
      expect(t).toContain("As alternativas C, D e E foram marcadas");
      expect(t).not.toContain("C e D e E");
      expect(t).toContain("2 alternativas");
    });

    it("⚠️ NÃO nomeia o gabarito, mesmo com pouca marcação", () => {
      // A é o gabarito e tem 0%: é questão difícil, não distrator morto.
      const q = q20({
        acertos: 0,
        erros: 20,
        porAlternativa: { A: 0, B: 10, C: 10, D: 0, E: 0 },
      });

      const t = explicacaoDaFlag("distrator_morto", q);
      expect(t).not.toContain("A e");
      expect(t).toContain("D e E");
    });
  });

  it("⚠️ toda explicação termina dizendo O QUE FAZER", () => {
    // Um sinal que diz o que está errado e não o que fazer transfere o trabalho
    // inteiro para quem lê — e a triagem existe para poupar esse trabalho.
    const q = q20({
      discriminacao: -0.3,
      acertos: 2,
      erros: 18,
      porAlternativa: { A: 2, B: 18, C: 0, D: 0, E: 0 },
    });

    for (const flag of flagsDaQuestao(q)) {
      expect(explicacaoDaFlag(flag, q)).toMatch(
        /confira|revisar|reescrever|vaga|dado|claro/i,
      );
    }
  });
});

describe("⚠️ discriminação `undefined` — o ms antigo, durante o deploy", () => {
  /**
   * O DTO declara `number | null`, mas na janela entre o deploy do client e o
   * do ms o campo chega **ausente**. Com `!== null`, `undefined` passava pela
   * guarda e caía nas comparações, onde `undefined < 0` é `false` por acidente:
   * funcionava por sorte, e a explicação estourava com `toFixed of undefined`.
   */
  const semCampo = () => {
    const q = questao();
    delete (q as { discriminacao?: unknown }).discriminacao;
    return q;
  };

  it("não gera flag de discriminação", () => {
    const flags = flagsDaQuestao(semCampo());

    expect(flags).not.toContain("gabarito_suspeito");
    expect(flags).not.toContain("nao_discrimina");
  });

  it("⚠️ a explicação não estoura — mostra travessão", () => {
    expect(() =>
      explicacaoDaFlag("nao_discrimina", semCampo()),
    ).not.toThrow();
    expect(explicacaoDaFlag("nao_discrimina", semCampo())).toContain("—");
  });

  it("as flags que NÃO dependem dela continuam funcionando", () => {
    const q = semCampo();
    q.acertos = 2;
    q.erros = 18;
    q.porAlternativa = { A: 2, B: 18, C: 0, D: 0, E: 0 };

    expect(flagsDaQuestao(q)).toContain("muito_dificil");
  });
});

describe("flagsDaQuestao — leitura_suspeita (card 12)", () => {
  /*
    ⚠️ 6 sem leitura em 20 respondentes = 30%, contra mediana 2% do simulado:
    cruza o piso de 15 e é mais de 3× a mediana.
  */
  const comSemLeitura = (semLeitura: number) =>
    questao({
      semLeitura,
      acertos: 10,
      porAlternativa: { A: 10, B: 4, C: 3, D: 2, E: 1 - semLeitura },
    });

  it("sem mediana no chamador, a flag não existe — nada muda para quem não passa", () => {
    expect(flagsDaQuestao(comSemLeitura(6))).not.toContain("leitura_suspeita");
  });

  it("com mediana baixa e percentual alto, acusa", () => {
    expect(flagsDaQuestao(comSemLeitura(6), 2)).toContain("leitura_suspeita");
  });

  it("⚠️ mediana alta (simulado inteiro ruim) não acusa", () => {
    // 30% contra mediana 20%: cruza o piso e não destoa do simulado.
    expect(flagsDaQuestao(comSemLeitura(6), 20)).not.toContain("leitura_suspeita");
  });

  it("⚠️ mediana null é 'não avaliado', e não vira flag", () => {
    expect(flagsDaQuestao(comSemLeitura(6), null)).not.toContain("leitura_suspeita");
  });

  it("⚠️ vem logo depois do gabarito, antes da dificuldade", () => {
    /*
      A ordem é a ordem em que se age: leitura anormal INVALIDA o `% de acerto`
      da linha, então agir sobre "Difícil" antes de conferir a impressão é
      tratar sintoma de um número que não vale.
    */
    const flags = flagsDaQuestao(
      questao({
        semLeitura: 6,
        acertos: 2,
        porAlternativa: { A: 2, B: 12, C: 0, D: 0, E: 0 },
        discriminacao: -0.3,
      }),
      2,
    );

    expect(flags.indexOf("leitura_suspeita")).toBe(
      flags.indexOf("gabarito_suspeito") + 1,
    );
    expect(flags.indexOf("leitura_suspeita")).toBeLessThan(
      flags.indexOf("muito_dificil"),
    );
  });

  it("a explicação traz o percentual DESTA questão e manda conferir a folha", () => {
    const texto = explicacaoDaFlag("leitura_suspeita", comSemLeitura(6));

    expect(texto).toContain("30%");
    expect(texto.toLowerCase()).toContain("gabarito impressa torta");
  });
});
