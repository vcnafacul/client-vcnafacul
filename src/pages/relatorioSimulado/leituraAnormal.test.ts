import type {
  LinhaDoRelatorio,
  QuestaoDoRelatorio,
} from "@/dtos/relatorioSimulado/relatorioSimulado";
import { describe, expect, it } from "vitest";
import {
  cartoesComLeituraAnormal,
  LIMIARES_DE_LEITURA,
  percentualSemLeitura,
  percentualSemLeituraDoCartao,
  questoesComLeituraAnormal,
} from "./leituraAnormal";

/**
 * ⚠️ `respondentes` é o denominador, e `semLeitura` sai dele — a invariante da
 * api é `sum(porAlternativa) + semLeitura === respondentes`. Os fixtures a
 * respeitam; um que a viole faz os testes afirmarem percentual que a api nunca
 * produz.
 */
const questao = (
  numero: number,
  semLeitura: number,
  respondentes = 20,
): QuestaoDoRelatorio => ({
  numero,
  questaoId: `q${numero}`,
  respondentes,
  acertos: respondentes - semLeitura,
  erros: 0,
  semLeitura,
  porAlternativa: { A: respondentes - semLeitura, B: 0, C: 0, D: 0, E: 0 },
  alternativaCorreta: "A",
  discriminacao: 0.4,
});

const linha = (over: Partial<LinhaDoRelatorio> = {}): LinhaDoRelatorio => ({
  usuario: "u1",
  nome: "Aluno",
  matricula: "m1",
  turmaId: null,
  turmaNome: null,
  enviouCartao: true,
  status: "completed",
  questoesRespondidas: 20,
  ...over,
});

describe("percentualSemLeitura", () => {
  it("é sobre respondentes, e inteiro", () => {
    expect(percentualSemLeitura(questao(1, 5, 20))).toBe(25);
  });

  it("sem respondentes é null, não zero", () => {
    expect(percentualSemLeitura(questao(1, 0, 0))).toBeNull();
  });
});

describe("percentualSemLeituraDoCartao", () => {
  it("é total menos respondidas, sobre o total", () => {
    expect(percentualSemLeituraDoCartao(linha({ questoesRespondidas: 63 }), 90)).toBe(
      30,
    );
  });

  it("⚠️ leitura não concluída é null, nunca 100%", () => {
    // Cartão em processamento não leu nada AINDA — dizer "100% sem leitura"
    // o poria no topo do alerta como se fosse foto ruim.
    expect(
      percentualSemLeituraDoCartao(
        linha({ status: "awaiting_omr", questoesRespondidas: undefined }),
        90,
      ),
    ).toBeNull();
  });

  it("⚠️ histórico anterior ao card 01 é null, não zero", () => {
    // Sem o campo, "leu tudo" é uma afirmação que ninguém fez.
    expect(
      percentualSemLeituraDoCartao(linha({ questoesRespondidas: undefined }), 90),
    ).toBeNull();
  });

  it("simulado sem total conhecido é null", () => {
    expect(percentualSemLeituraDoCartao(linha(), 0)).toBeNull();
  });

  it("⚠️ respondidas acima do total é null, não negativo", () => {
    // O simulado encolheu depois da aplicação. Um percentual negativo passaria
    // reto pelos limiares e sumiria do alerta sem ninguém saber.
    expect(percentualSemLeituraDoCartao(linha({ questoesRespondidas: 95 }), 90)).toBeNull();
  });
});

describe("questoesComLeituraAnormal", () => {
  const normais = (quantas: number) =>
    Array.from({ length: quantas }, (_, i) => questao(i + 1, 0, 20));

  it("acusa a questão que destoa do próprio simulado", () => {
    // 8 questões em 0% e uma em 40%: mediana 0, piso cruzado.
    const { questoes, mediana } = questoesComLeituraAnormal([
      ...normais(8),
      questao(34, 8, 20),
    ]);

    expect(mediana).toBe(0);
    expect(questoes.map((q) => q.numero)).toEqual([34]);
  });

  it("⚠️ simulado com leitura ruim UNIFORME não acusa nada", () => {
    /*
      É o caso que o card nomeia: impressão ruim inteira dá 15% em tudo, e um
      corte fixo em 10% acusaria as 90 questões. Alerta que aponta tudo não
      aponta nada.
    */
    const todas = Array.from({ length: 9 }, (_, i) => questao(i + 1, 3, 20));

    const { questoes, mediana } = questoesComLeituraAnormal(todas);

    expect(mediana).toBe(15);
    expect(questoes).toEqual([]);
  });

  it("⚠️ dez vezes a mediana mas abaixo do piso NÃO acusa", () => {
    /*
      ⚠️ **Base 100, e não 20, e isso não é detalhe.** Com base 20 cada marcação
      vale 5 p.p., e não existe valor que seja >3× a mediana E <15% ao mesmo
      tempo — o caso que separa as duas condições era inalcançável. A mutação
      que remove o piso sobrevivia ao fixture antigo.

      Aqui: mediana 1%, uma questão em 10%. Dez vezes a mediana, e ainda assim
      abaixo do piso — que é exatamente o "4% com 1% de mediana não é nada" que
      o card usa para justificar o piso.
    */
    const { questoes, mediana } = questoesComLeituraAnormal([
      ...Array.from({ length: 8 }, (_, i) => questao(i + 1, 1, 100)),
      questao(34, 10, 100),
    ]);

    expect(mediana).toBe(1);
    expect(questoes).toEqual([]);
  });

  it("⚠️ acima do piso mas dentro do padrão do simulado NÃO acusa", () => {
    // Mediana 20%, uma questão em 25%: cruza o piso de 15 e não destoa.
    const { questoes } = questoesComLeituraAnormal([
      ...Array.from({ length: 8 }, (_, i) => questao(i + 1, 4, 20)),
      questao(34, 5, 20),
    ]);

    expect(questoes).toEqual([]);
  });

  it("⚠️ questão com poucos respondentes fica fora — do alerta E da mediana", () => {
    /*
      Com 5 respondentes, UM cartão ilegível dá 20% e cruzaria o piso sozinho.
      Ela também não pode entrar na mediana: entraria puxando-a para cima e
      protegendo as questões realmente tortas.
    */
    const { questoes, mediana } = questoesComLeituraAnormal([
      ...normais(8),
      questao(99, 1, 5),
    ]);

    expect(questoes).toEqual([]);
    expect(mediana).toBe(0);
  });

  it("⚠️ abaixo do mínimo para mediana não avalia — e diz que não avaliou", () => {
    // Quatro questões: a mediana seria o próprio outlier na metade dos casos.
    const { questoes, mediana } = questoesComLeituraAnormal([
      ...normais(3),
      questao(34, 8, 20),
    ]);

    expect(questoes).toEqual([]);
    expect(mediana).toBeNull();
  });

  it("lista vazia não explode", () => {
    expect(questoesComLeituraAnormal([])).toEqual({ questoes: [], mediana: null });
  });

  it("⚠️ a mediana inclui as próprias questões acusadas", () => {
    /*
      Tirá-las antes seria comparar o outlier com um simulado do qual ele foi
      removido: a mediana cai, e o alerta cresce sozinho a cada questão que
      entra nele.
    */
    const metadeTorta = [
      ...Array.from({ length: 5 }, (_, i) => questao(i + 1, 0, 20)),
      ...Array.from({ length: 4 }, (_, i) => questao(i + 10, 8, 20)),
    ];

    const { mediana } = questoesComLeituraAnormal(metadeTorta);

    // Com as 4 tortas dentro, a mediana é 0 (5 zeros contra 4 quarentas).
    expect(mediana).toBe(0);
  });
});

describe("cartoesComLeituraAnormal", () => {
  const cartao = (nome: string, respondidas: number) =>
    linha({ nome, usuario: nome, matricula: nome, questoesRespondidas: respondidas });

  it("acusa o cartão que destoa dos demais", () => {
    const lidos = Array.from({ length: 8 }, (_, i) => cartao(`ok${i}`, 90));

    const { cartoes, mediana } = cartoesComLeituraAnormal(
      [...lidos, cartao("Maria", 63)],
      90,
    );

    expect(mediana).toBe(0);
    expect(cartoes.map((c) => c.linha.nome)).toEqual(["Maria"]);
    expect(cartoes[0].percentual).toBe(30);
  });

  it("⚠️ cartão `failed` com contagem VELHA não entra", () => {
    /*
      ⚠️ **O caso que o DTO avisa e que a guarda de `undefined` não pega.** O
      `marcarFalha` do ms não limpa os campos do histórico, então uma linha
      `failed` pode chegar com `questoesRespondidas` preenchido de uma leitura
      anterior. Sem a guarda de status, esse número entra na mediana e no
      alerta como se fosse leitura desta aplicação.
    */
    const lidos = Array.from({ length: 6 }, (_, i) => cartao(`ok${i}`, 90));

    const { cartoes } = cartoesComLeituraAnormal(
      [...lidos, linha({ nome: "Falhou", status: "failed", questoesRespondidas: 40 })],
      90,
    );

    expect(cartoes).toEqual([]);
  });

  it("⚠️ quem não enviou e quem ainda processa não entram na conta", () => {
    /*
      Sem isto, cartão em processamento vira "100% sem leitura" e ocupa o topo
      do alerta — e o alerta passa a listar gente cuja foto está a caminho.
    */
    const lidos = Array.from({ length: 5 }, (_, i) => cartao(`ok${i}`, 90));

    const { cartoes } = cartoesComLeituraAnormal(
      [
        ...lidos,
        linha({ nome: "Nao enviou", enviouCartao: false, status: undefined, questoesRespondidas: undefined }),
        linha({ nome: "Processando", status: "awaiting_omr", questoesRespondidas: undefined }),
      ],
      90,
    );

    expect(cartoes).toEqual([]);
  });

  it("recorte pequeno não avalia", () => {
    const { cartoes, mediana } = cartoesComLeituraAnormal(
      [cartao("a", 90), cartao("b", 90), cartao("c", 40)],
      90,
    );

    expect(cartoes).toEqual([]);
    expect(mediana).toBeNull();
  });

  it("turma inteira com foto ruim não vira alerta de 30 cartões", () => {
    const todos = Array.from({ length: 10 }, (_, i) => cartao(`a${i}`, 72));

    expect(cartoesComLeituraAnormal(todos, 90).cartoes).toEqual([]);
  });
});

describe("LIMIARES_DE_LEITURA", () => {
  it("são nomeados, e o piso é o que o card propôs", () => {
    expect(LIMIARES_DE_LEITURA.pisoPercentual).toBe(15);
    expect(LIMIARES_DE_LEITURA.fatorSobreMediana).toBe(3);
  });
});
