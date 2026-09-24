import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useConteudoForm } from "./useConteudoForm";

const updateContent = vi.hoisted(() => vi.fn());
vi.mock("@/services/question/updateContent", () => ({ updateContent }));

const novaVersaoQuestao = vi.hoisted(() => vi.fn());
vi.mock("@/services/question/novaVersaoQuestao", () => ({ novaVersaoQuestao }));

vi.mock("@/services/question/uploadAsset", () => ({ uploadAsset: vi.fn() }));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
/*
 * ⚠️ O `useToastAsync` real envolve a ação em toast e estado; aqui só o
 * `action` e os callbacks importam — é o contrato que o hook usa.
 */
vi.mock("@/hooks/useToastAsync", () => ({
  useToastAsync: () => async (opcoes: {
    action: () => Promise<unknown>;
    onSuccess?: () => void;
    onFinally?: () => void;
  }) => {
    await opcoes.action();
    opcoes.onSuccess?.();
    opcoes.onFinally?.();
  },
}));

/*
  ⚠️ **O `textoQuestao` tem de ter 10+ caracteres**: o `conteudoSchema` exige, e
  com um fixture curto o `isValid` nunca vira `true` — todo teste passaria por
  não ter acontecido nada.
*/
const question = (over: Record<string, unknown> = {}) =>
  ({
    _id: "q1",
    textoQuestao: "o enunciado original da questao",
    pergunta: "",
    textoAlternativaA: "a",
    textoAlternativaB: "b",
    textoAlternativaC: "c",
    textoAlternativaD: "d",
    textoAlternativaE: "e",
    alternativa: "A",
    textClassification: true,
    alternativeClassfication: true,
    quantidadeResposta: 0,
    ...over,
  }) as never;

const montar = (q = question()) =>
  renderHook(() => useConteudoForm({ question: q }));

/**
 * ⚠️ **O `trigger()` não é ruído de teste.** O `handleSave` tem um
 * `if (!isValid) return`, e o `isValid` do react-hook-form com resolver começa
 * `false` até a primeira validação — sem isto todo teste passaria por não ter
 * acontecido nada, que é o pior modo de falha possível.
 */
const salvar = async (result: { current: ReturnType<typeof useConteudoForm> }) => {
  await act(async () => {
    await result.current.form.trigger();
  });
  await act(async () => {
    await result.current.handleSave();
  });
};

describe("useConteudoForm — a escolha ao salvar (card 27)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateContent.mockResolvedValue({});
    novaVersaoQuestao.mockResolvedValue({ _id: "q2" });
  });

  it("⚠️ questão NUNCA respondida salva direto, sem modal", async () => {
    /*
      Ali não há escolha a fazer: é rascunho, ninguém viu. Perguntar seria
      cerimônia sobre uma decisão que não existe.
    */
    const { result } = montar();
    act(() => result.current.setValue("textoQuestao", "o enunciado NOVO da questao"));

    await salvar(result);

    expect(updateContent).toHaveBeenCalledTimes(1);
    expect(result.current.escolhaPendente).toBeNull();
  });

  it("⚠️ questão JÁ respondida abre a escolha, sem escrever nada ainda", async () => {
    const { result } = montar(question({ quantidadeResposta: 10 }));
    act(() => result.current.setValue("textoQuestao", "o enunciado NOVO da questao"));

    await salvar(result);

    expect(updateContent).not.toHaveBeenCalled();
    expect(novaVersaoQuestao).not.toHaveBeenCalled();
    expect(result.current.escolhaPendente?.campos).toEqual(["enunciado"]);
  });

  it("⚠️ save que não altera nada NÃO pergunta", async () => {
    // Não há o que decidir sobre uma edição que não existe.
    const { result } = montar(question({ quantidadeResposta: 10 }));

    await salvar(result);

    expect(result.current.escolhaPendente).toBeNull();
  });

  it("escolher 'nova versão' chama a rota que congela e troca as provas", async () => {
    const { result } = montar(question({ quantidadeResposta: 10 }));
    act(() => result.current.setValue("textoQuestao", "o enunciado NOVO da questao"));
    await salvar(result);

    await act(async () => {
      await result.current.confirmarEscolha("novaVersao");
    });

    expect(novaVersaoQuestao).toHaveBeenCalledWith(
      "tok",
      "q1",
      expect.objectContaining({ textoQuestao: "o enunciado NOVO da questao" }),
    );
    expect(updateContent).not.toHaveBeenCalled();
  });

  it("escolher 'correção' edita a original in-place", async () => {
    const { result } = montar(question({ quantidadeResposta: 10 }));
    act(() => result.current.setValue("textoQuestao", "o enunciado NOVO da questao"));
    await salvar(result);

    await act(async () => {
      await result.current.confirmarEscolha("correcao");
    });

    expect(updateContent).toHaveBeenCalledTimes(1);
    expect(novaVersaoQuestao).not.toHaveBeenCalled();
  });

  it("⚠️ as duas chamadas recebem o MESMO corpo", async () => {
    /*
      É o que mantém o card honesto: a diferença entre corrigir e versionar está
      no que o servidor faz com as provas, não no que a tela manda.
    */
    const { result } = montar(question({ quantidadeResposta: 10 }));
    act(() => result.current.setValue("textoQuestao", "o enunciado NOVO da questao"));
    await salvar(result);

    const corpo = { ...result.current.escolhaPendente!.dados };

    await act(async () => {
      await result.current.confirmarEscolha("novaVersao");
    });

    expect(novaVersaoQuestao.mock.calls[0][2]).toEqual(corpo);
  });

  it("cancelar fecha a escolha sem escrever", async () => {
    const { result } = montar(question({ quantidadeResposta: 10 }));
    act(() => result.current.setValue("textoQuestao", "o enunciado NOVO da questao"));
    await salvar(result);

    act(() => result.current.cancelarEscolha());

    await waitFor(() => expect(result.current.escolhaPendente).toBeNull());
    expect(updateContent).not.toHaveBeenCalled();
    expect(novaVersaoQuestao).not.toHaveBeenCalled();
  });
});
