import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ModalEscolhaAoSalvar } from "./ModalEscolhaAoSalvar";

const base = {
  textoQuestao: "Qual é a capital?",
  textoAlternativaC: "c",
  alternativa: "A",
};

const montar = (over: Record<string, unknown> = {}) => {
  const onConfirmar = vi.fn();
  const onClose = vi.fn();
  const r = render(
    <ModalEscolhaAoSalvar
      isOpen
      onClose={onClose}
      campos={["enunciado"]}
      respostas={10}
      provas={3}
      antes={base}
      depois={{ ...base, textoQuestao: "Qual é a moeda?" }}
      onConfirmar={onConfirmar}
      {...over}
    />,
  );
  return { ...r, onConfirmar, onClose };
};

describe("ModalEscolhaAoSalvar (card 27)", () => {
  it("⚠️ mostra O QUE mudou — a pergunta não é no vácuo", () => {
    /*
      "Deseja criar uma nova versão?" é uma pergunta conceitual, e pergunta
      conceitual no momento do save é clicada no automático. O diff é o que a
      torna concreta.
    */
    const { container } = montar({ campos: ["enunciado", "alternativa C"] });

    expect(container.querySelector("[data-campos-alterados]")).toHaveTextContent(
      "enunciado · alternativa C",
    );
  });

  it("⚠️ os textos falam da CONSEQUÊNCIA na prova, não de 'versão'", () => {
    const { container } = montar();

    const novaVersao = container.querySelector("[data-opcao='novaVersao']")!
      .parentElement!;
    expect(novaVersao.textContent).toContain("as 3 provas que a usam passam");
    expect(novaVersao.textContent).toContain("congela");
  });

  it("⚠️ o texto da correção diz quantas respostas continuam valendo", () => {
    const { container } = montar();

    expect(
      container.querySelector("[data-opcao='correcao']")!.parentElement!
        .textContent,
    ).toContain("as 10 respostas já registradas");
  });

  it("⚠️ o default vem da heurística — texto diferente propõe nova versão", () => {
    /*
      Sem heurística, o default vira hábito — e o hábito vai ser o botão da
      esquerda, sempre.
    */
    const { container } = montar();

    expect(container.querySelector("[data-opcao='novaVersao']")).toBeChecked();
    expect(container.querySelector("[data-opcao='correcao']")).not.toBeChecked();
  });

  it("⚠️ só espaçamento propõe correção", () => {
    const { container } = montar({
      depois: { ...base, textoQuestao: "Qual  é a capital? " },
    });

    expect(container.querySelector("[data-opcao='correcao']")).toBeChecked();
  });

  it("⚠️ o GABARITO sempre propõe nova versão", () => {
    // Qualquer diferença aqui muda quem acertou.
    const { container } = montar({
      depois: { ...base, alternativa: "C" },
      campos: ["gabarito"],
    });

    expect(container.querySelector("[data-opcao='novaVersao']")).toBeChecked();
  });

  it("o default é trocável", () => {
    const { container, onConfirmar } = montar();

    fireEvent.click(container.querySelector("[data-opcao='correcao']")!);
    fireEvent.click(container.querySelector("[data-confirmar]")!);

    expect(onConfirmar).toHaveBeenCalledWith("correcao");
  });

  it("confirma com a escolha proposta quando ninguém troca", () => {
    const { container, onConfirmar } = montar();

    fireEvent.click(container.querySelector("[data-confirmar]")!);

    expect(onConfirmar).toHaveBeenCalledWith("novaVersao");
  });

  it("⚠️ 'Cancelar' não tem o mesmo peso visual das duas opções", () => {
    /*
      Sair sem salvar é outra categoria de ação; dar a ele o mesmo peso faria a
      pessoa escolher entre três coisas quando são duas.
    */
    const { container } = montar();

    const cancelar = container.querySelector("[data-cancelar]")!;
    expect(cancelar.className).not.toContain("bg-orange");
    expect(cancelar.tagName).toBe("BUTTON");
  });

  it("cancelar não confirma nada", () => {
    const { container, onClose, onConfirmar } = montar();

    fireEvent.click(container.querySelector("[data-cancelar]")!);

    expect(onClose).toHaveBeenCalled();
    expect(onConfirmar).not.toHaveBeenCalled();
  });

  it("uma prova só fica no singular", () => {
    const { container } = montar({ provas: 1 });

    expect(
      container.querySelector("[data-opcao='novaVersao']")!.parentElement!
        .textContent,
    ).toContain("a prova que a usa passa");
  });

  it("⚠️ NÃO oferece 'duplicar' — ele não nasce de estar editando", () => {
    // Duplicar nasce de "quero outra questão baseada nesta", e a pessoa nem
    // abriu o editor. Fica no botão à parte do card 25.
    const { container } = montar();

    expect(container.textContent?.toLowerCase()).not.toContain("duplicar");
  });
});
