import { describe, expect, it } from "vitest";
import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { filtrarLinhas, totalQueNaoEnviou } from "./filtrarLinhas";

const linha = (over: Partial<LinhaDoRelatorio>): LinhaDoRelatorio => ({
  usuario: "u1",
  nome: "Fulano de Tal",
  matricula: "2026001",
  turmaId: null,
  turmaNome: null,
  enviouCartao: true,
  ...over,
});

const ENVIOU = linha({ usuario: "u1", nome: "José Álvaro", matricula: "2026001" });
const NAO_ENVIOU = linha({
  usuario: "u2",
  nome: "Maria Souza",
  matricula: "2026002",
  enviouCartao: false,
});

describe("filtrarLinhas — o toggle de quem não enviou", () => {
  it("⚠️ por padrão a tela esconde quem não enviou", () => {
    // É o pedido: o relatório é sobre os cartões que chegaram. Quem não enviou
    // é informação de cobrança, não de leitura, e só aparece se for pedida.
    const r = filtrarLinhas([ENVIOU, NAO_ENVIOU], {
      mostrarQuemNaoEnviou: false,
      busca: "",
    });

    expect(r).toEqual([ENVIOU]);
  });

  it("com o toggle ligado, as duas aparecem", () => {
    const r = filtrarLinhas([ENVIOU, NAO_ENVIOU], {
      mostrarQuemNaoEnviou: true,
      busca: "",
    });

    expect(r).toHaveLength(2);
  });

  it("⚠️ o toggle olha enviouCartao, NÃO a ausência de historicoId", () => {
    // O DTO documenta que `enviouCartao` é explícito justamente para ninguém
    // inferir da ausência de `historicoId` — a api manda o campo para isso.
    const semHistoricoMasEnviou = linha({
      usuario: "u3",
      enviouCartao: true,
      historicoId: undefined,
    });

    const r = filtrarLinhas([semHistoricoMasEnviou], {
      mostrarQuemNaoEnviou: false,
      busca: "",
    });

    expect(r).toEqual([semHistoricoMasEnviou]);
  });
});

describe("filtrarLinhas — a busca", () => {
  it("casa por nome, sem diferenciar maiúscula", () => {
    const r = filtrarLinhas([ENVIOU, NAO_ENVIOU], {
      mostrarQuemNaoEnviou: true,
      busca: "maria",
    });

    expect(r).toEqual([NAO_ENVIOU]);
  });

  it("⚠️ casa IGNORANDO acento — 'jose' acha 'José'", () => {
    // Quem digita o nome de um estudante raramente digita o acento. Sem a
    // normalização NFD a busca não acha ninguém e parece quebrada.
    const todos = { mostrarQuemNaoEnviou: true } as const;

    expect(filtrarLinhas([ENVIOU], { ...todos, busca: "jose" })).toEqual([
      ENVIOU,
    ]);
    expect(filtrarLinhas([ENVIOU], { ...todos, busca: "alvaro" })).toEqual([
      ENVIOU,
    ]);
    // e o nome completo sem acento nenhum também casa, porque a normalização
    // é aplicada dos dois lados antes do `includes`
    expect(filtrarLinhas([ENVIOU], { ...todos, busca: "jose alvaro" })).toEqual(
      [ENVIOU],
    );
  });

  it("nome que não existe no recorte não casa com ninguém", () => {
    const r = filtrarLinhas([ENVIOU, NAO_ENVIOU], {
      mostrarQuemNaoEnviou: true,
      busca: "carlos",
    });

    expect(r).toEqual([]);
  });

  it("casa por matrícula, que é como o cursinho identifica o estudante", () => {
    const r = filtrarLinhas([ENVIOU, NAO_ENVIOU], {
      mostrarQuemNaoEnviou: true,
      busca: "2026002",
    });

    expect(r).toEqual([NAO_ENVIOU]);
  });

  it("casa por pedaço da matrícula", () => {
    const r = filtrarLinhas([ENVIOU, NAO_ENVIOU], {
      mostrarQuemNaoEnviou: true,
      busca: "6002",
    });

    expect(r).toEqual([NAO_ENVIOU]);
  });

  it("busca vazia ou só espaços não filtra nada", () => {
    const filtro = { mostrarQuemNaoEnviou: true, busca: "   " };
    expect(filtrarLinhas([ENVIOU, NAO_ENVIOU], filtro)).toHaveLength(2);
  });

  it("⚠️ os dois filtros são cumulativos", () => {
    // Buscar por alguém que não enviou, com o toggle desligado, não pode
    // ressuscitar a linha: senão o toggle vira sugestão em vez de filtro.
    const r = filtrarLinhas([ENVIOU, NAO_ENVIOU], {
      mostrarQuemNaoEnviou: false,
      busca: "maria",
    });

    expect(r).toEqual([]);
  });
});

describe("totalQueNaoEnviou", () => {
  it("conta quem não enviou", () => {
    expect(totalQueNaoEnviou([ENVIOU, NAO_ENVIOU, NAO_ENVIOU])).toBe(2);
  });

  it("⚠️ conta sobre a lista INTEIRA, ignorando a busca", () => {
    // O número no rótulo do toggle responde "quem mais existe neste recorte",
    // e não "o que sobrou do que eu digitei" — por isso recebe as linhas
    // originais, nunca as já filtradas.
    expect(totalQueNaoEnviou([ENVIOU])).toBe(0);
  });
});
