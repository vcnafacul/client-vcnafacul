import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotivoAnulacao } from "@/dtos/question/anulacao";
import { ModalAvisoAnulada } from "./ModalAvisoAnulada";
import { ErroDaAnulacao } from "@/services/anulacao/anularQuestao";
import { AnuladaEm } from "@/pages/dashQuestionNew/modals/tabs/TabClassificacao/AnuladaEm";

const mocks = vi.hoisted(() => ({ add: vi.fn(), fetch: vi.fn() }));
vi.mock("@/services/question/addQuestionToProva", async (orig) => ({
  ...(await orig<typeof import("@/services/question/addQuestionToProva")>()),
  addQuestionToProva: mocks.add,
}));
vi.mock("@/utils/fetchWrapper", () => ({ default: mocks.fetch }));
vi.mock("@/store/auth", () => ({ useAuthStore: () => ({ data: { token: "tok" } }) }));
vi.mock("react-toastify", () => ({
  toast: { loading: vi.fn(() => 1), update: vi.fn(), dismiss: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

const a1 = {
  provaId: "p1",
  provaNome: "ENEM 2022 – Dia 2",
  numero: 45,
  motivo: MotivoAnulacao.semAlternativaCorreta,
  justificativa: "A alternativa C, dada como gabarito, está errada.",
  em: "2026-10-01T15:00:00Z",
};
const a2 = {
  ...a1,
  provaId: "p2",
  provaNome: "Simulado 3 – Cursinho X",
  numero: 12,
  motivo: MotivoAnulacao.enunciadoComErro,
  justificativa: "O enunciado cita um gráfico que não está na questão.",
};

beforeEach(() => vi.clearAllMocks());

describe("ModalAvisoAnulada (042/08)", () => {
  const montar = (anulacoes = [a1, a2]) => {
    const onEscolher = vi.fn();
    const onCancelar = vi.fn();
    render(
      <ModalAvisoAnulada
        anulacoes={anulacoes}
        numero={7}
        provaNome="Minha prova"
        onEscolher={onEscolher}
        onCancelar={onCancelar}
      />,
    );
    return { onEscolher, onCancelar };
  };

  it("lista as provas com número, motivo e justificativa", () => {
    montar();
    expect(screen.getByText("Esta questão foi anulada em 2 provas")).toBeTruthy();
    expect(screen.getByText(/ENEM 2022 – Dia 2/).parentElement!.textContent).toContain("Q45");
    expect(screen.getByText(`“${a2.justificativa}”`)).toBeTruthy();
  });

  it("Cancelar não escolhe nada; Adicionar normal escolhe normal", () => {
    const { onEscolher, onCancelar } = montar([a1]);
    expect(screen.getByText("Esta questão foi anulada em 1 prova")).toBeTruthy();
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onCancelar).toHaveBeenCalled();
    expect(onEscolher).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Adicionar normal"));
    expect(onEscolher).toHaveBeenCalledWith({ modo: "normal" });
  });

  it("Adicionar como anulada: pré-preenche com a 1ª, troca pela escolhida, edita e confirma", () => {
    const { onEscolher } = montar();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar como anulada" }));
    const texto = () => (screen.getByLabelText("Justificativa") as HTMLTextAreaElement).value;
    expect(texto()).toBe(a1.justificativa);
    fireEvent.change(screen.getByLabelText("Usar a justificativa de"), { target: { value: "1" } });
    expect(texto()).toBe(a2.justificativa);
    fireEvent.change(screen.getByLabelText("Justificativa"), { target: { value: "Mesmo problema aqui." } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar como anulada" }));
    expect(onEscolher).toHaveBeenCalledWith({
      modo: "anulada",
      anulacao: { motivo: a2.motivo, justificativa: "Mesmo problema aqui." },
    });
  });

  it("com uma anulação só, não mostra o seletor", () => {
    montar([a1]);
    fireEvent.click(screen.getByRole("button", { name: "Adicionar como anulada" }));
    expect(screen.queryByLabelText("Usar a justificativa de")).toBeNull();
  });
});

describe("adicionar à prova com aviso (042/08) — hook", () => {
  it("⚠️ o 409 QUESTAO_ANULADA abre o aviso em vez de virar erro; a escolha reenvia com o modo", async () => {
    const { useClassificacaoForm } = await import(
      "@/pages/dashQuestionNew/modals/tabs/TabClassificacao/useClassificacaoForm"
    );
    mocks.add
      .mockRejectedValueOnce(new ErroDaAnulacao("x", 409, { code: "QUESTAO_ANULADA", anulacoes: [a1] }))
      .mockResolvedValueOnce(undefined);
    const onSaveSuccess = vi.fn();
    const { result } = renderHook(() =>
      useClassificacaoForm({ question: { _id: "q1", provasContendo: [] } as never, onSaveSuccess }),
    );

    await act(() => result.current.handleAddToProva("p9", 7));
    expect(result.current.avisoDeAnulada).toEqual({ provaId: "p9", numero: 7, anulacoes: [a1] });
    expect(onSaveSuccess).not.toHaveBeenCalled();

    await act(() => result.current.escolherEntrada({ modo: "normal" }));
    expect(mocks.add).toHaveBeenLastCalledWith("q1", "p9", 7, "tok", { modo: "normal" });
    expect(result.current.avisoDeAnulada).toBeNull();
    expect(onSaveSuccess).toHaveBeenCalled();
  });

  it("outro erro segue como antes (toast e recarrega)", async () => {
    const { useClassificacaoForm } = await import(
      "@/pages/dashQuestionNew/modals/tabs/TabClassificacao/useClassificacaoForm"
    );
    mocks.add.mockRejectedValueOnce(new Error("Número 7 indisponível"));
    const onSaveSuccess = vi.fn();
    const { result } = renderHook(() =>
      useClassificacaoForm({ question: { _id: "q1", provasContendo: [] } as never, onSaveSuccess }),
    );
    await act(() => result.current.handleAddToProva("p9", 7));
    expect(result.current.avisoDeAnulada).toBeNull();
    expect(onSaveSuccess).toHaveBeenCalled();
  });
});

describe("serviço e banco (042/08)", () => {
  it("addQuestionToProva manda o modo e devolve o 409 com o corpo, sem o prefixo", async () => {
    const { addQuestionToProva } = await vi.importActual<
      typeof import("@/services/question/addQuestionToProva")
    >("@/services/question/addQuestionToProva");
    const fetchMock = mocks.fetch.mockResolvedValue(
      new Response(JSON.stringify({ code: "QUESTAO_ANULADA", message: "Esta questão foi anulada em 1 prova(s).", anulacoes: [a1] }), { status: 409 }),
    );
    const erro = await addQuestionToProva("q1", "p9", 7, "tok", { modo: "normal" }).catch((e) => e);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ provaId: "p9", numero: 7, modo: "normal" });
    expect(erro).toBeInstanceOf(ErroDaAnulacao);
    expect(erro.code).toBe("QUESTAO_ANULADA");
    expect(erro.corpo.anulacoes).toEqual([a1]);
    expect(erro.message).toBe("Esta questão foi anulada em 1 prova(s).");
  });

  it("AnuladaEm lista prova, número, motivo, data e justificativa", () => {
    render(
      <AnuladaEm
        anulacoes={[{ ...a1, numero: 45 }]}
        nomeDaProva={(id) => (id === "p1" ? "ENEM 2022 – Dia 2" : undefined)}
      />,
    );
    const texto = screen.getByTestId("anulada-em").textContent!;
    expect(texto).toContain("ENEM 2022 – Dia 2, Q45 · Sem alternativa correta · 01/10/2026");
    expect(texto).toContain(a1.justificativa);
  });
});

describe("selo no banco (042/08)", () => {
  it("card da questão anulada mostra 'Anulada em N provas'; a outra, nada", async () => {
    const { SimpleQuestionCard } = await import("@/pages/dashQuestionNew/components/simpleQuestionCard");
    const base = { _id: "q", enemArea: "Matemática", materia: "Mat", updatedAt: new Date(), status: 1 };
    const { rerender } = render(<SimpleQuestionCard question={{ ...base, qtdAnulacoes: 2, anulada: true } as never} />);
    expect(screen.getByTestId("selo-anulada").textContent).toBe("Anulada em 2 provas");
    rerender(<SimpleQuestionCard question={{ ...base, qtdAnulacoes: 0 } as never} />);
    expect(screen.queryByTestId("selo-anulada")).toBeNull();
  });

  it("getAllQuestions só manda `anulada` quando não é 'todas'", async () => {
    vi.stubEnv("VITE_BASE_URL", "http://api");
    vi.resetModules();
    const { getAllQuestions } = await import("@/services/question/getAllQuestion");
    mocks.fetch.mockReset().mockImplementation(async () => new Response(JSON.stringify({ data: [], totalItems: 0 }), { status: 200 }));
    await getAllQuestions("t", 0 as never, "", 1, 40, "", "", "", "", "somente");
    await getAllQuestions("t", 0 as never);
    expect(mocks.fetch.mock.calls[0][0]).toContain("anulada=somente");
    expect(mocks.fetch.mock.calls[1][0]).not.toContain("anulada");
    vi.unstubAllEnvs();
  });
});
