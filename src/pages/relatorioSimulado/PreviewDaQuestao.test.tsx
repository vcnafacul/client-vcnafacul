import type { Question } from "@/dtos/question/questionDTO";
import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  PreviewDaQuestao,
  TEXTO_ERRO,
  TEXTO_PODE_TER_MUDADO,
  TEXTO_SEM_ALTERNATIVAS,
} from "./PreviewDaQuestao";
import { textosDasAlternativas } from "./alternativasDaQuestao";

vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));

const questao = (over: Partial<QuestaoDoRelatorio> = {}): QuestaoDoRelatorio => ({
  numero: 34,
  questaoId: "q34",
  // ⚠️ Mesma invariante da api dos outros fixtures: soma de `porAlternativa`
  // mais `semLeitura` dá `respondentes`, e `porAlternativa[correta]` dá
  // `acertos`.
  respondentes: 27,
  acertos: 6,
  erros: 19,
  semLeitura: 2,
  porAlternativa: { A: 2, B: 16, C: 6, D: 1, E: 0 },
  alternativaCorreta: "C",
  discriminacao: 0.4,
  ...over,
});

const doBanco = (over: Partial<Question> = {}): Question =>
  ({
    _id: "q34",
    textoQuestao: "O enunciado da questão",
    pergunta: "Qual a alternativa correta?",
    textoAlternativaA: "Primeira",
    textoAlternativaB: "Segunda",
    textoAlternativaC: "Terceira",
    textoAlternativaD: "Quarta",
    textoAlternativaE: "Quinta",
    alternativa: "C",
    contentFormat: "plain",
    ...over,
  }) as Question;

function montar(
  over: {
    questao?: Partial<QuestaoDoRelatorio>;
    buscar?: (token: string, id: string) => Promise<Question>;
  } = {},
) {
  const buscar =
    over.buscar ?? vi.fn().mockResolvedValue(doBanco());
  render(
    <PreviewDaQuestao
      token="tok"
      questao={questao(over.questao)}
      isOpen
      onClose={() => {}}
      buscar={buscar}
    />,
  );
  return { buscar };
}

describe("PreviewDaQuestao", () => {
  it("mostra enunciado, pergunta e as cinco alternativas", async () => {
    montar();

    expect(await screen.findByText("O enunciado da questão")).toBeTruthy();
    expect(screen.getByText("Qual a alternativa correta?")).toBeTruthy();
    for (const texto of ["Primeira", "Segunda", "Terceira", "Quarta", "Quinta"]) {
      expect(screen.getByText(texto)).toBeTruthy();
    }
  });

  it("busca uma vez, pelo questaoId da linha", async () => {
    const buscar = vi.fn().mockResolvedValue(doBanco());
    montar({ buscar });

    await screen.findByText("O enunciado da questão");
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(buscar).toHaveBeenCalledWith("tok", "q34");
  });

  it("não busca com o modal fechado", () => {
    const buscar = vi.fn().mockResolvedValue(doBanco());
    render(
      <PreviewDaQuestao
        token="tok"
        questao={questao()}
        isOpen={false}
        onClose={() => {}}
        buscar={buscar}
      />,
    );

    expect(buscar).not.toHaveBeenCalled();
  });

  it("⚠️ o percentual de cada alternativa fica ao lado do texto dela", async () => {
    /*
      É o ponto do card: ler o distrator que levou metade da turma COM o
      percentual do lado é o que fecha o diagnóstico da triagem. Separados —
      texto aqui, número na tabela atrás do modal — o professor precisa
      decorar a distribuição antes de abrir.
    */
    montar();

    await screen.findByText("O enunciado da questão");
    // 16 de 27 = 59%; 6 de 27 = 22%; 0 de 27 = 0%, não travessão.
    expect(screen.getByTestId("preview-pct-B").textContent).toBe("59%");
    expect(screen.getByTestId("preview-pct-C").textContent).toBe("22%");
    expect(screen.getByTestId("preview-pct-E").textContent).toBe("0%");
  });

  it("destaca o gabarito da CORREÇÃO, não o do banco", async () => {
    montar();

    await screen.findByText("O enunciado da questão");
    const correta = document.querySelectorAll("[data-correta='sim']");
    expect(correta.length).toBe(1);
    expect(correta[0].getAttribute("data-alternativa")).toBe("C");
  });

  it("sem gabarito no recorte, nenhuma alternativa é destacada", async () => {
    /*
      ⚠️ `alternativaCorreta: null` é "não sei" — nenhum histórico completo, ou
      históricos que discordam. Destacar a do banco seria responder por palpite
      uma pergunta que o card 03 deixou explicitamente em aberto.
    */
    montar({ questao: { alternativaCorreta: null } });

    await screen.findByText("O enunciado da questão");
    expect(document.querySelectorAll("[data-correta='sim']").length).toBe(0);
  });

  it("⚠️ avisa quando o banco mudou o gabarito depois da aplicação", async () => {
    montar({ buscar: vi.fn().mockResolvedValue(doBanco({ alternativa: "B" })) });

    const aviso = await screen.findByTestId("preview-gabarito-divergente");
    expect(aviso.textContent).toContain("B");
    expect(aviso.textContent).toContain("C");
    // E o destaque continua no gabarito da correção.
    expect(
      document.querySelector("[data-correta='sim']")?.getAttribute("data-alternativa"),
    ).toBe("C");
  });

  it("não avisa divergência quando os gabaritos batem", async () => {
    montar();

    await screen.findByText("O enunciado da questão");
    expect(screen.queryByTestId("preview-gabarito-divergente")).toBeNull();
  });

  it("não avisa divergência quando o recorte não sabe o gabarito", async () => {
    montar({
      questao: { alternativaCorreta: null },
      buscar: vi.fn().mockResolvedValue(doBanco({ alternativa: "B" })),
    });

    await screen.findByText("O enunciado da questão");
    expect(screen.queryByTestId("preview-gabarito-divergente")).toBeNull();
  });

  it("questão com alternativas só na imagem diz isso, em vez de cinco linhas vazias", async () => {
    montar({
      buscar: vi.fn().mockResolvedValue(
        doBanco({
          textoAlternativaA: "",
          textoAlternativaB: "",
          textoAlternativaC: "",
          textoAlternativaD: "",
          textoAlternativaE: "",
        }),
      ),
    });

    expect(await screen.findByText(TEXTO_SEM_ALTERNATIVAS)).toBeTruthy();
    expect(screen.queryByTestId("preview-pct-A")).toBeNull();
  });

  it("o aviso de que a questão pode ter sido editada está sempre visível", async () => {
    montar();

    expect(await screen.findByText(TEXTO_PODE_TER_MUDADO)).toBeTruthy();
  });

  it("falha mostra erro e o botão de tentar de novo refaz a busca", async () => {
    const buscar = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue(doBanco());
    montar({ buscar });

    expect(await screen.findByText(TEXTO_ERRO)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /tentar de novo/i }));

    await waitFor(() =>
      expect(screen.getByText("O enunciado da questão")).toBeTruthy(),
    );
  });

  it("questão sem número não mostra 'Questão null'", async () => {
    montar({ questao: { numero: null } });

    expect(await screen.findByText("Questão sem número")).toBeTruthy();
  });
});

describe("textosDasAlternativas", () => {
  it("devolve as cinco na ordem A–E", () => {
    expect(textosDasAlternativas(doBanco())).toEqual([
      "Primeira",
      "Segunda",
      "Terceira",
      "Quarta",
      "Quinta",
    ]);
  });

  it("campo ausente vira string vazia, não undefined", () => {
    // ⚠️ Questão legada não traz os cinco campos. `undefined` aqui explodiria
    // no `.trim()` do teste de alternativa-em-imagem.
    const sem = { ...doBanco(), textoAlternativaD: undefined } as unknown as Question;
    expect(textosDasAlternativas(sem)[3]).toBe("");
  });
});
