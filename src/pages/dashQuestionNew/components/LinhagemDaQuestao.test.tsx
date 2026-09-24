import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LinhagemDaQuestao } from "./LinhagemDaQuestao";
import {
  TEXTO_DUPLICAR,
  textoDeCopias,
  TEXTO_VER_ORIGINAL,
} from "./textoDaLinhagem";

const listarCopias = vi.hoisted(() => vi.fn());
vi.mock("@/services/question/listarCopias", () => ({ listarCopias }));

const duplicarQuestao = vi.hoisted(() => vi.fn());
vi.mock("@/services/question/duplicarQuestao", () => ({ duplicarQuestao }));

const estado = vi.hoisted(() => ({
  permissao: { criarQuestao: true } as Record<string, boolean>,
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok", permissao: estado.permissao } }),
}));

const montar = (props: Record<string, unknown> = {}) =>
  render(<LinhagemDaQuestao questaoId="q1" {...props} />);

describe("textoDeCopias", () => {
  it("plural e singular", () => {
    expect(textoDeCopias(3)).toBe("3 cópias");
    expect(textoDeCopias(1)).toBe("1 cópia");
  });

  it("nenhuma cópia não vira texto", () => {
    expect(textoDeCopias(0)).toBeNull();
  });
});

describe("LinhagemDaQuestao (card 25)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    estado.permissao = { criarQuestao: true };
    listarCopias.mockResolvedValue([]);
    duplicarQuestao.mockResolvedValue({ _id: "q2" });
  });

  it("⚠️ duplicar é botão à PARTE, fora do fluxo de edição", async () => {
    /*
      Decisão do card 27: duplicar não nasce de estar editando — nasce de "quero
      outra questão baseada nesta", e a pessoa nem abriu o editor.
    */
    montar();

    expect(await screen.findByText(TEXTO_DUPLICAR)).toBeTruthy();
  });

  it("⚠️ o título do botão diz a CONSEQUÊNCIA na prova", async () => {
    /*
      É o que separa duplicar de versionar na cabeça de quem usa: duplicar não
      mexe em prova nenhuma, a cópia nasce órfã.
    */
    const { container } = montar();

    await waitFor(() => expect(listarCopias).toHaveBeenCalled());
    expect(
      container.querySelector("[data-duplicar]")?.getAttribute("title"),
    ).toContain("provas que usam esta questão não mudam");
  });

  it("⚠️ sem `criarQuestao` NÃO há botão de duplicar", async () => {
    /*
      Mesmo critério da guarda na api: duplicar produz questão nova, então é
      `criarQuestao` e não `validarQuestao`. Um botão que só sabe receber 403 é
      pior que botão nenhum.
    */
    estado.permissao = { validarQuestao: true };

    const { container } = montar();

    await waitFor(() => expect(listarCopias).toHaveBeenCalled());
    expect(container.querySelector("[data-duplicar]")).toBeNull();
  });

  it("duplicar chama o serviço e avisa quem montou", async () => {
    const aoDuplicar = vi.fn();
    montar({ aoDuplicar });

    fireEvent.click(await screen.findByText(TEXTO_DUPLICAR));

    await waitFor(() => expect(aoDuplicar).toHaveBeenCalledWith("q2"));
    expect(duplicarQuestao).toHaveBeenCalledWith("tok", "q1");
  });

  it("recarrega a lista de cópias depois de duplicar", async () => {
    montar();
    await waitFor(() => expect(listarCopias).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByText(TEXTO_DUPLICAR));

    await waitFor(() => expect(listarCopias).toHaveBeenCalledTimes(2));
  });

  it("⚠️ questão SEM origem não mostra badge de cópia", async () => {
    // É a esmagadora maioria — só quem veio de "Duplicar" tem.
    const { container } = montar();

    await waitFor(() => expect(listarCopias).toHaveBeenCalled());
    expect(container.querySelector("[data-badge-copia]")).toBeNull();
  });

  it("cópia mostra o badge e o link para a original", async () => {
    const abrirQuestao = vi.fn();
    const { container } = montar({ origem: "665f0c1a2b3c4d5e6f00abc2", abrirQuestao });

    await waitFor(() => expect(listarCopias).toHaveBeenCalled());
    expect(container.querySelector("[data-badge-copia]")).toBeTruthy();

    fireEvent.click(screen.getByText(TEXTO_VER_ORIGINAL));
    expect(abrirQuestao).toHaveBeenCalledWith("665f0c1a2b3c4d5e6f00abc2");
  });

  it("⚠️ sem `abrirQuestao`, o badge aparece sem link", async () => {
    // A informação continua visível, que é o mínimo — quem monta decide se sabe
    // trocar de questão.
    const { container } = montar({ origem: "q0" });

    await waitFor(() => expect(listarCopias).toHaveBeenCalled());
    expect(container.querySelector("[data-badge-copia]")).toBeTruthy();
    expect(container.querySelector("[data-ver-original]")).toBeNull();
  });

  it("o contador abre a lista de cópias", async () => {
    listarCopias.mockResolvedValue([
      { id: "665f0c1a2b3c4d5e6f00abc2", status: "Pending", origem: "q1" },
    ]);
    const { container } = montar();

    fireEvent.click(await screen.findByText(/1 cópia/));

    expect(container.querySelector("[data-lista-copias]")).toBeTruthy();
  });

  it("sem cópias, não há contador", async () => {
    const { container } = montar();

    await waitFor(() => expect(listarCopias).toHaveBeenCalled());
    expect(container.querySelector("[data-ver-copias]")).toBeNull();
  });

  it("⚠️ a busca falha em SILÊNCIO — a linhagem é acessória ao modal", async () => {
    /*
      Um erro aqui não pode derrubar a questão nem disputar atenção com o
      "tentar de novo" do conteúdo.
    */
    listarCopias.mockRejectedValue(new Error("caiu"));

    const { container } = montar();

    await waitFor(() => expect(listarCopias).toHaveBeenCalled());
    expect(container.querySelector("[data-linhagem]")).toBeTruthy();
    expect(container.querySelector("[data-ver-copias]")).toBeNull();
  });

  it("⚠️ um recarregamento que falha NÃO apaga as cópias já conhecidas", async () => {
    /*
      ⚠️ **Este teste nasceu de uma mutação que sobreviveu.** O `catch` fazia
      `setCopias([])`, e ninguém notava — até perceber que o recarregamento de
      depois de duplicar é justamente o que pode falhar: a tela diria "nenhuma
      cópia" sobre uma questão que acabou de ganhar uma.

      Manter o último valor bom é o comportamento certo.
    */
    listarCopias.mockResolvedValueOnce([
      { id: "665f0c1a2b3c4d5e6f00abc2", status: "Pending", origem: "q1" },
    ]);
    const { container } = montar();
    await screen.findByText(/1 cópia/);

    listarCopias.mockRejectedValue(new Error("caiu"));
    fireEvent.click(screen.getByText(TEXTO_DUPLICAR));

    await waitFor(() => expect(listarCopias).toHaveBeenCalledTimes(2));
    expect(container.querySelector("[data-ver-copias]")).toBeTruthy();
  });
});

describe("LinhagemDaQuestao — posição no rodapé (revisão do card 25)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    estado.permissao = { criarQuestao: true };
    listarCopias.mockResolvedValue([]);
    duplicarQuestao.mockResolvedValue({ _id: "q2" });
  });

  it("⚠️ o bloco alinha à DIREITA — ações ficam no canto da ação", async () => {
    /*
      À esquerda, o botão de duplicar lia como se fosse parte da classificação
      acima. É ação sobre a questão inteira.
    */
    const { container } = montar();

    await waitFor(() => expect(listarCopias).toHaveBeenCalled());
    expect(container.querySelector("[data-linhagem]")?.className).toContain(
      "justify-end",
    );
  });

  it("⚠️ tem separador do conteúdo acima", () => {
    // No rodapé, sem a linha o bloco encosta na classificação e os dois parecem
    // o mesmo assunto.
    const { container } = montar();

    expect(container.querySelector("[data-linhagem]")?.className).toContain(
      "border-t",
    );
  });

  it("⚠️ o badge de origem fica à ESQUERDA, longe do botão", async () => {
    // "De onde esta questão veio" é informação, e informação não compete com o
    // botão de ação pelo mesmo canto.
    const { container } = montar({ origem: "q0" });

    await waitFor(() => expect(listarCopias).toHaveBeenCalled());
    expect(container.querySelector("[data-badge-copia]")?.className).toContain(
      "mr-auto",
    );
  });
});
