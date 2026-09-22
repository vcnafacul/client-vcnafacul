import { describe, expect, it } from "vitest";
import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { navegaveis, posicaoNaNavegacao } from "./navegacaoEntreAlunos";

const linha = (
  usuario: string,
  over: Partial<LinhaDoRelatorio> = {},
): LinhaDoRelatorio => ({
  usuario,
  nome: usuario.toUpperCase(),
  matricula: usuario,
  turmaId: null,
  turmaNome: null,
  enviouCartao: true,
  status: "completed",
  ...over,
});

describe("navegaveis", () => {
  it("⚠️ pula quem NÃO enviou cartão", () => {
    // Mesma razão de o `onRowClick` não abrir para eles: não há o que mostrar e
    // a rota devolve 404. Uma seta que leva a uma tela de erro é pior que uma
    // seta desabilitada.
    const lista = navegaveis([
      linha("a"),
      linha("b", { enviouCartao: false, status: undefined }),
      linha("c"),
    ]);

    expect(lista.map((l) => l.usuario)).toEqual(["a", "c"]);
  });

  it("⚠️ quem FALHOU continua navegável", () => {
    // É justamente navegando que se descobre que o cartão do próximo falhou —
    // e o modal tem a mensagem dele. Só quem não enviou é que não tem tela.
    const lista = navegaveis([linha("a"), linha("b", { status: "failed" })]);

    expect(lista).toHaveLength(2);
  });
});

describe("posicaoNaNavegacao", () => {
  const tres = [linha("a"), linha("b"), linha("c")];

  it("no meio, tem os dois vizinhos", () => {
    const p = posicaoNaNavegacao(tres, "b");

    expect(p).toMatchObject({ posicao: 2, total: 3 });
    expect(p.anterior?.usuario).toBe("a");
    expect(p.proximo?.usuario).toBe("c");
  });

  it("⚠️ na primeira, `anterior` é null — a seta desabilita, não some", () => {
    const p = posicaoNaNavegacao(tres, "a");

    expect(p.anterior).toBeNull();
    expect(p.proximo?.usuario).toBe("b");
  });

  it("na última, `proximo` é null", () => {
    const p = posicaoNaNavegacao(tres, "c");

    expect(p.proximo).toBeNull();
    expect(p.anterior?.usuario).toBe("b");
  });

  it("⚠️ a posição conta só os NAVEGÁVEIS, não as linhas da tabela", () => {
    // Com quem não enviou no meio, "2 de 3" contaria uma linha que a seta
    // pula — e o contador deixaria de descrever o que as setas percorrem.
    const comVazio = [
      linha("a"),
      linha("b", { enviouCartao: false }),
      linha("c"),
    ];

    expect(posicaoNaNavegacao(comVazio, "c")).toMatchObject({
      posicao: 2,
      total: 2,
    });
  });

  it("⚠️ pular quem não enviou funciona nos DOIS sentidos", () => {
    const comVazio = [
      linha("a"),
      linha("b", { enviouCartao: false }),
      linha("c"),
    ];

    expect(posicaoNaNavegacao(comVazio, "a").proximo?.usuario).toBe("c");
    expect(posicaoNaNavegacao(comVazio, "c").anterior?.usuario).toBe("a");
  });

  it("⚠️ a ordem é a da LISTA recebida, não alfabética nem do payload", () => {
    // A tela passa `linhasDaPagina`, já ordenada e filtrada: se a pessoa
    // ordenou por aproveitamento, "próximo" é a próxima linha que ela vê.
    const ordenada = [linha("c"), linha("a"), linha("b")];

    expect(posicaoNaNavegacao(ordenada, "c").proximo?.usuario).toBe("a");
  });

  it("⚠️ aluno FORA da lista desabilita as duas setas", () => {
    // A página pode ter mudado sob o modal aberto. Pular para um vizinho que
    // não tem relação com quem está na tela seria pior que não navegar.
    const p = posicaoNaNavegacao(tres, "z");

    expect(p).toMatchObject({ posicao: 0, anterior: null, proximo: null });
  });

  it("lista de um só não navega para lado nenhum", () => {
    const p = posicaoNaNavegacao([linha("a")], "a");

    expect(p).toMatchObject({ posicao: 1, total: 1 });
    expect(p.anterior).toBeNull();
    expect(p.proximo).toBeNull();
  });

  it("lista vazia não estoura", () => {
    expect(posicaoNaNavegacao([], "a")).toMatchObject({
      posicao: 0,
      total: 0,
    });
  });
});
