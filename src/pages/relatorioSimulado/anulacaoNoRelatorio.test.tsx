import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { AvisoDeRecalculo, INTERVALO_DO_POLLING_MS } from "./AvisoDeRecalculo";
import {
  quaisForamAnuladas,
  resumoDasQuestoesDoRelatorio,
  textoDaDivergencia,
} from "./textosDaAnulacao";
import { flagsDaQuestao } from "./flagsDaQuestao";
import { indiceDeDificuldade } from "./dificuldadeDaQuestao";
import { planilhaDeQuestoes } from "./exportar";

const svc = vi.hoisted(() => ({ consultar: vi.fn(), pedir: vi.fn() }));
vi.mock("@/services/relatorioSimulado/recalculoAnulacao", () => ({
  consultarRecalculo: svc.consultar,
  pedirRecalculo: svc.pedir,
}));

const anulada = { numero: 45, motivo: "sem_alternativa_correta", justificativa: "Gabarito errado." };
const fonte = { tipo: "simulado" as const, simuladoId: "s1" };
const job = (o = {}) => ({ id: "j1", status: "processando" as const, total: 132, processados: 0, falhas: 0, regravados: 0, ...o });

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("textos (042/15)", () => {
  it("o aviso diz qual, por quê e quantos", () => {
    expect(textoDaDivergencia([anulada], 132)).toBe(
      "A questão 45 foi anulada (sem alternativa correta) depois que 132 resultados foram calculados. Esses resultados ainda contam a questão, e médias, discriminação e comparação podem estar erradas.",
    );
    expect(quaisForamAnuladas([anulada, { ...anulada, numero: 3 }, { ...anulada, numero: 90 }])).toBe(
      "As questões 45, 3 e 90 foram anuladas",
    );
  });
  it("resumo: '90 questões · 1 anulada · análise sobre 89'", () => {
    expect(resumoDasQuestoesDoRelatorio(90, 1, 89)).toBe("90 questões · 1 anulada · análise sobre 89");
    expect(resumoDasQuestoesDoRelatorio(90, 0)).toBe("90 questões");
  });
});

describe("AvisoDeRecalculo (042/15)", () => {
  const montar = (o: Partial<Parameters<typeof AvisoDeRecalculo>[0]> = {}) => {
    const aoConcluir = vi.fn();
    render(
      <AvisoDeRecalculo
        fonte={fonte}
        token="t"
        divergentes={132}
        anuladas={[anulada]}
        jobAtivo={null}
        aoConcluir={aoConcluir}
        {...o}
      />,
    );
    return { aoConcluir };
  };

  it("sem divergente e sem job → nada", () => {
    const { container } = render(
      <AvisoDeRecalculo fonte={fonte} token="t" divergentes={0} anuladas={[]} jobAtivo={null} aoConcluir={vi.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("divergente → Recalcular → progresso com polling a cada 3 s → concluído, com as falhas, e recarrega", async () => {
    svc.pedir.mockResolvedValue({ criado: true, job: job() });
    svc.consultar
      .mockResolvedValueOnce({ divergentes: 84, jobAtivo: job({ processados: 48 }), ultimoJob: null })
      .mockResolvedValueOnce({ divergentes: 3, jobAtivo: null, ultimoJob: job({ status: "concluido", processados: 132, falhas: 3, regravados: 129 }) });
    const { aoConcluir } = montar();
    expect(screen.getByTestId("aviso-divergencia").textContent).toContain("Relatório desatualizado.");
    await act(async () => {
      fireEvent.click(screen.getByText("Recalcular resultados"));
    });
    expect(screen.getByTestId("recalculo-rodando").textContent).toContain("Recalculando 0 de 132…");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(INTERVALO_DO_POLLING_MS);
    });
    expect(screen.getByTestId("recalculo-rodando").textContent).toContain("Recalculando 48 de 132…");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(INTERVALO_DO_POLLING_MS);
    });
    expect(screen.getByTestId("recalculo-concluido").textContent).toContain("3 resultados não puderam ser recalculados.");
    expect(aoConcluir).toHaveBeenCalledTimes(1);
    expect(svc.pedir).toHaveBeenCalledTimes(1);
  });

  it("⚠️ voltar no meio do job → já mostra o progresso, sem pedir de novo", () => {
    montar({ jobAtivo: job({ processados: 20 }) });
    expect(screen.getByTestId("recalculo-rodando").textContent).toContain("Recalculando 20 de 132…");
    expect(svc.pedir).not.toHaveBeenCalled();
  });

  it("aba escondida → o polling não consulta", async () => {
    const vis = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    montar({ jobAtivo: job() });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(INTERVALO_DO_POLLING_MS * 3);
    });
    expect(svc.consultar).not.toHaveBeenCalled();
    vis.mockRestore();
  });
});

describe("questões com anulada (042/15)", () => {
  const q = (o: Partial<QuestaoDoRelatorio> = {}) =>
    ({
      numero: 45,
      questaoId: "q45",
      respondentes: 40,
      acertos: 2,
      erros: 38,
      semLeitura: 0,
      porAlternativa: { A: 2, B: 30, C: 8, D: 0, E: 0 },
      alternativaCorreta: "A",
      discriminacao: -0.4,
      ...o,
    }) as QuestaoDoRelatorio;

  it("a anulada não tem sinal nem entra no índice de dificuldade", () => {
    const valida = q({ numero: 44, questaoId: "q44" });
    const anuladaQ = q({ anulada: true, motivoAnulacao: "sem_alternativa_correta", discriminacao: null });
    expect(flagsDaQuestao(valida).length).toBeGreaterThan(0);
    expect(flagsDaQuestao(anuladaQ)).toEqual([]);
    const idx = indiceDeDificuldade([valida, anuladaQ]);
    expect(idx.has("q44")).toBe(true);
    expect(idx.has("q45")).toBe(false);
  });

  it("o CSV marca a anulada com o motivo e a justificativa", () => {
    const p = planilhaDeQuestoes([
      q({ anulada: true, motivoAnulacao: "sem_alternativa_correta", justificativaAnulacao: "Gabarito errado." }),
    ]);
    const i = p.cabecalho.indexOf("Anulada");
    expect(p.linhas[0][i]).toBe("Sem alternativa correta");
    expect(p.linhas[0][i + 1]).toBe("Gabarito errado.");
  });
});

describe("estudantes com nota desatualizada (042/15)", () => {
  it("a coluna Resultado usa o total da nota e marca a linha divergente", async () => {
    const { colunasDoRelatorio } = await import("./colunas");
    const col = colunasDoRelatorio({
      comTurma: false,
      materias: [],
      desvios: new Map(),
      totalDeQuestoes: 90,
      mediaDoRecorte: null,
    } as never).find((c) => c.id === "aproveitamento")!;
    const base = { usuario: "u", nome: "Ana", matricula: "1", turmaId: null, turmaNome: null, enviouCartao: true, status: "completed", acertos: 49, questoesRespondidas: 89, aproveitamentoGeral: 49 / 89 };
    const { container, rerender } = render(<>{col.cell({ ...base, totalConsiderado: 89 } as never)}</>);
    expect(container.textContent).toContain("49/89");
    expect(container.querySelector("[data-divergente]")).toBeNull();
    rerender(<>{col.cell({ ...base, acertos: 50, questoesRespondidas: 90, divergente: true } as never)}</>);
    expect(container.textContent).toContain("50/90");
    expect(container.querySelector("[data-divergente]")!.textContent).toBe("desatualizada");
  });

  it("o CSV de estudantes traz o total considerado e a nota desatualizada", async () => {
    const { planilhaDeEstudantes } = await import("./exportar");
    const p = planilhaDeEstudantes(
      [{ usuario: "u", nome: "Ana", matricula: "1", turmaId: null, turmaNome: null, enviouCartao: true, status: "completed", acertos: 50, divergente: true } as never],
      { comTurma: false, totalDeQuestoes: 90 },
    );
    const i = p.cabecalho.indexOf("Total considerado");
    expect(p.linhas[0][i]).toBe(90);
    expect(p.linhas[0][i + 1]).toBe("sim");
  });
});

describe("tabela de questões com anulada (042/15)", () => {
  it("a anulada aparece com o X, o motivo e a justificativa no lugar dos sinais", async () => {
    vi.useRealTimers();
    const { TabelaDeQuestoes } = await import("./TabelaDeQuestoes");
    const base = { respondentes: 40, acertos: 20, erros: 20, semLeitura: 0, porAlternativa: { A: 20, B: 20, C: 0, D: 0, E: 0 }, alternativaCorreta: "A", discriminacao: null };
    render(
      <TabelaDeQuestoes
        estado="idle"
        questoes={[
          { ...base, numero: 44, questaoId: "q44" } as never,
          { ...base, numero: 45, questaoId: "q45", anulada: true, motivoAnulacao: "sem_alternativa_correta", justificativaAnulacao: "Gabarito errado." } as never,
        ]}
      />,
    );
    expect(document.querySelectorAll("[data-anulada]").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Anulada: Sem alternativa correta").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Gabarito errado.").length).toBeGreaterThan(0);
  });
});
