import { describe, expect, it } from "vitest";
import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import {
  acertosSobreTotal,
  desvioEmPontos,
  formatarDesvio,
  naoLidas,
  textoDeNaoLidas,
} from "./resultadoDoEstudante";

const linha = (over: Partial<LinhaDoRelatorio> = {}): LinhaDoRelatorio => ({
  usuario: "u1",
  nome: "Ana",
  matricula: "1",
  turmaId: null,
  turmaNome: null,
  enviouCartao: true,
  status: "completed",
  aproveitamentoGeral: 0.68,
  acertos: 61,
  ...over,
});

describe("acertosSobreTotal", () => {
  it("monta o par acertos/total", () => {
    expect(acertosSobreTotal(linha(), 90)).toBe("61/90");
  });

  it("⚠️ NÃO deriva de `aproveitamentoGeral × total` quando falta `acertos`", () => {
    // 0,68 × 90 = 61,2 → arredondaria para 61 por acidente. Mas o aluno pode ter
    // feito 62 e o percentual ter sido arredondado de 0,6888 — e ele confere
    // esse número à mão, contra o próprio cartão. Sem o dado contado, a tela
    // mostra só o percentual.
    expect(acertosSobreTotal(linha({ acertos: undefined }), 90)).toBeNull();
  });

  it("⚠️ zero acertos monta `0/90`, e não some", () => {
    // Cartão lido em que o aluno não acertou nada é uma medida, e é
    // exatamente a linha que o coordenador precisa ver.
    expect(acertosSobreTotal(linha({ acertos: 0 }), 90)).toBe("0/90");
  });

  it("⚠️ total 0 devolve `null` — nunca `61/0`", () => {
    // Acontece quando o simulado sumiu, ou quando o ms ainda não tem o card 08.
    expect(acertosSobreTotal(linha(), 0)).toBeNull();
  });

  it.each(["failed", "pending", "awaiting_omr"])(
    "status %s não mostra acertos",
    (status) => {
      expect(
        acertosSobreTotal(linha({ status: status as never }), 90),
      ).toBeNull();
    },
  );
});

describe("desvioEmPontos", () => {
  it("⚠️ a diferença é em PONTOS PERCENTUAIS, não em por cento", () => {
    // 68% contra média 54% é +14 p.p. — e NÃO "+26%", que é a variação
    // relativa e responde outra pergunta. As duas se confundem o tempo todo.
    expect(desvioEmPontos(linha({ aproveitamentoGeral: 0.68 }), 0.54)).toBe(14);
  });

  it("abaixo da média dá negativo", () => {
    expect(desvioEmPontos(linha({ aproveitamentoGeral: 0.46 }), 0.55)).toBe(-9);
  });

  it("exatamente na média dá zero", () => {
    expect(desvioEmPontos(linha({ aproveitamentoGeral: 0.5 }), 0.5)).toBe(0);
  });

  it("⚠️ arredonda DEPOIS de subtrair, não antes", () => {
    // 0,544 e 0,536: arredondando cada um antes dá 54 − 54 = 0; a diferença
    // real é 0,008 → 1 p.p. O erro aparece justamente em quem está perto da
    // média, que é onde a distinção importa.
    expect(desvioEmPontos(linha({ aproveitamentoGeral: 0.544 }), 0.536)).toBe(1);
  });

  it("⚠️ sem média no recorte não há desvio — e não é zero", () => {
    // Zero afirmaria "está na média"; não haver média é outra coisa.
    expect(desvioEmPontos(linha(), null)).toBeNull();
  });

  it("sem nota, sem desvio", () => {
    expect(
      desvioEmPontos(linha({ aproveitamentoGeral: undefined }), 0.5),
    ).toBeNull();
  });

  it("linha que falhou não tem desvio, mesmo carregando nota velha", () => {
    expect(desvioEmPontos(linha({ status: "failed" }), 0.5)).toBeNull();
  });
});

describe("formatarDesvio", () => {
  it("⚠️ o sinal é explícito no positivo", () => {
    // Sem ele "14 p.p." se lê como a nota, não como a diferença.
    expect(formatarDesvio(14)).toBe("+14 p.p.");
  });

  it("⚠️ usa o menos tipográfico, não o hífen", () => {
    expect(formatarDesvio(-9)).toBe("−9 p.p.");
    expect(formatarDesvio(-9)).not.toContain("-");
  });

  it("zero não leva sinal", () => {
    expect(formatarDesvio(0)).toBe("0 p.p.");
  });

  it("null continua null — quem decide o travessão é a célula", () => {
    expect(formatarDesvio(null)).toBeNull();
  });
});

describe("naoLidas (card 13)", () => {
  const cartao = (over: Partial<LinhaDoRelatorio> = {}): LinhaDoRelatorio => ({
    usuario: "u1",
    nome: "Ana",
    matricula: "m1",
    turmaId: null,
    turmaNome: null,
    enviouCartao: true,
    status: "completed",
    questoesRespondidas: 87,
    ...over,
  });

  it("é total menos respondidas", () => {
    expect(naoLidas(cartao(), 90)).toBe(3);
  });

  it("cartão lido inteiro é 0, e 0 é um valor", () => {
    expect(naoLidas(cartao({ questoesRespondidas: 90 }), 90)).toBe(0);
  });

  it("⚠️ leitura não concluída é null, nunca o total", () => {
    // "90 não lidas" num cartão em processamento diria que a leitura falhou.
    expect(
      naoLidas(
        cartao({ status: "awaiting_omr", questoesRespondidas: undefined }),
        90,
      ),
    ).toBeNull();
  });

  it("⚠️ cartão `failed` é null mesmo com a contagem preenchida", () => {
    // `marcarFalha` não limpa o histórico: o número que sobrou é de uma leitura
    // anterior, e anotá-lo na nota desta seria inventar.
    expect(naoLidas(cartao({ status: "failed" }), 90)).toBeNull();
  });

  it("histórico anterior ao card 01 é null, não zero", () => {
    expect(naoLidas(cartao({ questoesRespondidas: undefined }), 90)).toBeNull();
  });

  it("sem total conhecido é null", () => {
    expect(naoLidas(cartao(), 0)).toBeNull();
  });

  it("⚠️ respondidas acima do total é null, e não negativo", () => {
    // O simulado encolheu depois da aplicação. Um negativo passaria pelo `> 0`
    // da tela e sumiria sem ninguém saber.
    expect(naoLidas(cartao({ questoesRespondidas: 95 }), 90)).toBeNull();
  });
});

describe("textoDeNaoLidas", () => {
  it("plural e singular", () => {
    expect(textoDeNaoLidas(3)).toBe("3 não lidas");
    expect(textoDeNaoLidas(1)).toBe("1 não lida");
  });

  it("⚠️ zero não vira texto — 300 linhas com '0 não lidas' é ruído", () => {
    expect(textoDeNaoLidas(0)).toBeNull();
  });

  it("null não vira texto", () => {
    expect(textoDeNaoLidas(null)).toBeNull();
  });
});
