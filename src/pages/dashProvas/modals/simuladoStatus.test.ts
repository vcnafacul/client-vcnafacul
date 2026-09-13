import { describe, expect, it } from "vitest";
import { proporcaoQuestoes, statusVisual } from "./simuladoStatus";

/**
 * ⚠️ **Datas montadas em horário LOCAL, de propósito.** `formatDateTime` usa
 * `date-fns/format`, que formata no fuso da máquina. Uma string ISO fixa
 * ("2026-03-12T08:00:00Z") produziria "05:00" no Brasil e "08:00" no CI, e o
 * teste passaria a depender do `TZ` — o repo já tem um e2e quebrado
 * exatamente assim (`inscription-course.e2e-spec.ts`). Nascendo de um `Date`
 * local, a volta pelo formatador devolve os mesmos dígitos em qualquer fuso.
 */
const iso = (ano: number, mes: number, dia: number, hora = 0, min = 0) =>
  new Date(ano, mes - 1, dia, hora, min).toISOString();

const AGORA = new Date(2026, 2, 15, 12, 0); // 15/03/2026 12:00 local

describe("statusVisual", () => {
  it("bloqueado sai como cadeado e diz o que falta", () => {
    const v = statusVisual({ bloqueado: true }, AGORA);

    expect(v.forma).toBe("cadeado");
    expect(v.tone).toBe("neutral");
    expect(v.descricao).toContain("cadastradas, aprovadas e numeradas");
  });

  it("bloqueado vence a janela, mesmo com a janela aberta", () => {
    // ⚠️ O par que separa "olhou o bloqueado" de "olhou só as datas". Sem
    // esta ordem, um simulado sem aprovação apareceria como disponível.
    const v = statusVisual(
      {
        bloqueado: true,
        disponivelDe: iso(2026, 3, 1),
        disponivelAte: iso(2026, 3, 31),
      },
      AGORA,
    );

    expect(v.forma).toBe("cadeado");
  });

  it("antes da janela diz quando abre", () => {
    const v = statusVisual(
      { bloqueado: false, disponivelDe: iso(2026, 3, 20, 8, 30) },
      AGORA,
    );

    expect(v.forma).toBe("relogio");
    expect(v.tone).toBe("running");
    expect(v.descricao).toBe("Abre em 20/03/2026 08:30");
  });

  it("antes da janela com prazo diz abertura e fechamento", () => {
    const v = statusVisual(
      {
        bloqueado: false,
        disponivelDe: iso(2026, 3, 20, 8, 30),
        disponivelAte: iso(2026, 3, 25, 23, 59),
      },
      AGORA,
    );

    expect(v.descricao).toBe(
      "Abre em 20/03/2026 08:30 e fecha em 25/03/2026 23:59",
    );
  });

  it("depois da janela diz quando expirou", () => {
    const v = statusVisual(
      {
        bloqueado: false,
        disponivelDe: iso(2026, 3, 1),
        disponivelAte: iso(2026, 3, 10, 23, 59),
      },
      AGORA,
    );

    expect(v.forma).toBe("expirado");
    expect(v.tone).toBe("missing");
    expect(v.descricao).toBe("Expirou em 10/03/2026 23:59");
  });

  it("sem janela sai como check neutro", () => {
    const v = statusVisual(
      { bloqueado: false, disponivelDe: null, disponivelAte: null },
      AGORA,
    );

    expect(v.forma).toBe("check");
    expect(v.tone).toBe("neutral");
    expect(v.descricao).toBe("Disponível — sem janela definida");
  });

  it("disponível dentro da janela diz o intervalo inteiro", () => {
    const v = statusVisual(
      {
        bloqueado: false,
        disponivelDe: iso(2026, 3, 10, 9, 0),
        disponivelAte: iso(2026, 3, 20, 18, 0),
      },
      AGORA,
    );

    expect(v.forma).toBe("check");
    expect(v.tone).toBe("done");
    expect(v.descricao).toBe(
      "Disponível de 10/03/2026 09:00 até 20/03/2026 18:00",
    );
  });

  it("disponível só com início diz desde quando", () => {
    const v = statusVisual(
      { bloqueado: false, disponivelDe: iso(2026, 3, 10, 9, 0) },
      AGORA,
    );

    expect(v.tone).toBe("done");
    expect(v.descricao).toBe("Disponível desde 10/03/2026 09:00");
  });

  it("disponível só com fim diz até quando", () => {
    const v = statusVisual(
      { bloqueado: false, disponivelAte: iso(2026, 3, 20, 18, 0) },
      AGORA,
    );

    expect(v.tone).toBe("done");
    expect(v.descricao).toBe("Disponível até 20/03/2026 18:00");
  });

  it("nenhum estado sai sem descrição", () => {
    /**
     * ⚠️ A descrição é a única coisa que explica o ícone — não há texto na
     * tela. Um estado que devolvesse string vazia produziria um ícone mudo,
     * que é o modo de falhar deste redesenho.
     */
    const estados = [
      { bloqueado: true },
      { bloqueado: false, disponivelDe: iso(2026, 3, 20) },
      { bloqueado: false, disponivelAte: iso(2026, 3, 10) },
      { bloqueado: false },
      { bloqueado: false, disponivelAte: iso(2026, 3, 20) },
    ];

    for (const e of estados) {
      const { descricao } = statusVisual(e, AGORA);
      expect(descricao.trim().length).toBeGreaterThan(0);
      expect(descricao).not.toContain("Invalid");
    }
  });
});

describe("proporcaoQuestoes", () => {
  it("calcula a proporção quando há total", () => {
    expect(proporcaoQuestoes(12, 45)).toEqual({
      pct: (12 / 45) * 100,
      texto: "12/45",
      completo: false,
    });
  });

  it("marca completo quando alcança o total", () => {
    expect(proporcaoQuestoes(45, 45).completo).toBe(true);
  });

  it("não deixa a barra passar de 100%", () => {
    // ⚠️ Simulado com mais questões que o esperado existe; a barra vazando da
    // trilha, não.
    expect(proporcaoQuestoes(50, 45).pct).toBe(100);
    expect(proporcaoQuestoes(50, 45).completo).toBe(true);
  });

  it("devolve pct null quando a categoria não declara o total", () => {
    // ⚠️ O caso que produziria `width: NaN%` — barra que some sem erro nenhum.
    expect(proporcaoQuestoes(12, undefined)).toEqual({
      pct: null,
      texto: "12/—",
      completo: false,
    });
    expect(proporcaoQuestoes(12, 0).pct).toBeNull();
  });

  it("devolve pct null quando o total é null", () => {
    // ⚠️ `quantidadeTotalQuestao` é `number | null` no DTO — `null` é o valor
    // que chega de verdade, `undefined` só quando não há categoria.
    expect(proporcaoQuestoes(12, null).pct).toBeNull();
  });
});
