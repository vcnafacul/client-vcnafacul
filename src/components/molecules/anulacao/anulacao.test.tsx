import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotivoAnulacao } from "@/dtos/question/anulacao";
import { ModalAnularQuestao } from "./ModalAnularQuestao";
import { podeAnularNa } from "@/pages/dashQuestionNew/permissoesDoBanco";
import { AnuladasDaProva } from "@/pages/dashProvas/modals/AnuladasDaProva";
import { resumoDasQuestoes } from "@/pages/dashProvas/modals/resumoDasQuestoes";
import {
  AnulacaoDaProva,
  TEXTO_PROVA_APLICADA,
} from "@/pages/dashQuestionNew/modals/tabs/TabClassificacao/AnulacaoDaProva";
import { ErroDaAnulacao, lerErro } from "@/services/anulacao/anularQuestao";

const servico = vi.hoisted(() => ({
  anular: vi.fn(),
  desanular: vi.fn(),
}));
vi.mock("@/services/anulacao/anularQuestao", async (orig) => ({
  ...(await orig<typeof import("@/services/anulacao/anularQuestao")>()),
  anularQuestao: servico.anular,
  desanularQuestao: servico.desanular,
}));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const anulacao = {
  provaId: "p1",
  numero: 45,
  motivo: MotivoAnulacao.semAlternativaCorreta,
  justificativa: "A alternativa C, dada como gabarito, está errada.",
  em: "2026-10-17T00:00:00Z",
};

beforeEach(() => vi.clearAllMocks());

describe("ModalAnularQuestao (042/07)", () => {
  const anular = () => screen.getByRole("button", { name: "Anular" }) as HTMLButtonElement;

  it("sem motivo, ou com justificativa curta, o botão fica desabilitado", () => {
    render(<ModalAnularQuestao numero={45} onConfirmar={vi.fn()} onCancelar={vi.fn()} />);
    expect(anular().disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Justificativa"), { target: { value: "curta" } });
    expect(anular().disabled).toBe(true);
    expect(screen.getByText(/5\/500/).className).toContain("text-rose-600");
  });

  it("motivo + 10 caracteres → confirma com a justificativa aparada", () => {
    const onConfirmar = vi.fn();
    render(
      <ModalAnularQuestao
        numero={45}
        inicial={{ motivo: MotivoAnulacao.outro }}
        onConfirmar={onConfirmar}
        onCancelar={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Justificativa"), {
      target: { value: "   Enunciado com erro grave.  " },
    });
    fireEvent.click(anular());
    expect(onConfirmar).toHaveBeenCalledWith({
      motivo: "outro",
      justificativa: "Enunciado com erro grave.",
    });
  });

  it("diz o efeito antes de confirmar e mostra o erro do servidor", () => {
    render(
      <ModalAnularQuestao numero={45} erro="Deu ruim" onConfirmar={vi.fn()} onCancelar={vi.fn()} />,
    );
    expect(screen.getByText(/A questão 45 fica fora da análise desta prova/)).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe("Deu ruim");
  });
});

describe("AnulacaoDaProva (042/07)", () => {
  const montar = (o: Partial<Parameters<typeof AnulacaoDaProva>[0]> = {}) =>
    render(
      <AnulacaoDaProva
        questaoId="q1"
        provaId="p1"
        provaNome="Simulado 3"
        numero={45}
        podeAnular
        token="t"
        {...o}
      />,
    );

  it("quem não pode anular não vê ação; questão válida e sem permissão não mostra nada", () => {
    const { container } = montar({ podeAnular: false });
    expect(container.innerHTML).toBe("");
  });

  it("card 21: só as ações — o motivo e a justificativa ficam no aviso do topo", () => {
    const { container } = montar({ anulacao, podeAnular: false });
    expect(container.innerHTML).toBe("");
    montar({ anulacao });
    expect(screen.getByText("Editar justificativa")).toBeTruthy();
    expect(screen.getByText("Desanular")).toBeTruthy();
    expect(screen.queryByText(anulacao.justificativa)).toBeNull();
  });

  it("Anular nesta prova abre o modal, e nada muda antes de confirmar", async () => {
    servico.anular.mockResolvedValue(undefined);
    const onMudou = vi.fn();
    montar({ onMudou });
    fireEvent.click(screen.getByText("Anular nesta prova"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(onMudou).not.toHaveBeenCalled();
  });

  it("⚠️ 409 PROVA_JA_APLICADA vira a mensagem clara no modal", async () => {
    servico.anular.mockRejectedValue(
      new ErroDaAnulacao("x", 409, { code: "PROVA_JA_APLICADA" }),
    );
    montar({ anulacao });
    fireEvent.click(screen.getByText("Editar justificativa"));
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe(TEXTO_PROVA_APLICADA));
    expect(servico.anular).toHaveBeenCalledWith(
      "p1",
      "q1",
      { motivo: anulacao.motivo, justificativa: anulacao.justificativa },
      "t",
    );
  });

  it("desanular pede confirmação; cancelar não chama o servidor", async () => {
    servico.desanular.mockResolvedValue(undefined);
    const confirmar = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    const onMudou = vi.fn();
    montar({ anulacao, onMudou });
    fireEvent.click(screen.getByText("Desanular"));
    expect(servico.desanular).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Desanular"));
    await waitFor(() => expect(onMudou).toHaveBeenCalled());
    expect(servico.desanular).toHaveBeenCalledWith("p1", "q1", "t");
    confirmar.mockRestore();
  });
});

describe("regras e tela da prova (042/07)", () => {
  it("podeAnularNa: dono, ou plataforma em qualquer prova; editor do cursinho só nas dele", () => {
    const deOutro = { podeComporProva: false };
    expect(podeAnularNa({ editarQuestoesCursinho: true }, { podeComporProva: true })).toBe(true);
    expect(podeAnularNa({ editarQuestoesCursinho: true }, deOutro)).toBe(false);
    expect(podeAnularNa({ validarQuestao: true }, deOutro)).toBe(true);
    expect(podeAnularNa({ criarQuestao: true }, deOutro)).toBe(true);
    expect(podeAnularNa({ criarQuestao: true }, null)).toBe(false);
  });

  it("resumo: '90 questões · 1 anulada'", () => {
    expect(resumoDasQuestoes(90, 1)).toBe("90 questões · 1 anulada");
    expect(resumoDasQuestoes(90, 2)).toBe("90 questões · 2 anuladas");
    expect(resumoDasQuestoes(90, 0)).toBe("90 questões");
  });

  it("a prova lista as anuladas em ordem, com o motivo e a justificativa à vista", () => {
    const slots = [
      ...Array.from({ length: 88 }, (_, i) => ({ numero: i + 1 })),
      { numero: 90, anulacao: { ...anulacao, motivo: MotivoAnulacao.outro } },
      { numero: 89, anulacao },
    ];
    render(<AnuladasDaProva questoes={slots} />);
    expect(screen.getByText("90 questões · 2 anuladas")).toBeTruthy();
    const itens = screen.getAllByRole("listitem");
    expect(itens.map((li) => li.textContent?.slice(0, 2))).toEqual(["89", "90"]);
    expect(itens[0].getAttribute("title")).toBe(anulacao.justificativa);
  });

  it("prova sem anulada não mostra o bloco", () => {
    const { container } = render(<AnuladasDaProva questoes={[{ numero: 1 }]} />);
    expect(container.innerHTML).toBe("");
  });

  it("lerErro guarda o `code` do corpo", async () => {
    const e = await lerErro(
      new Response(JSON.stringify({ code: "QUESTAO_ANULADA", message: "m" }), { status: 409 }),
      "padrão",
    );
    expect(e.code).toBe("QUESTAO_ANULADA");
    expect(e.status).toBe(409);
    expect(e.message).toBe("m");
  });
});
